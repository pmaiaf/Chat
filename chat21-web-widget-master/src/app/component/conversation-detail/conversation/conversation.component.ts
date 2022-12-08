import { ChatManager } from 'src/chat21-core/providers/chat-manager';

import { ConversationFooterComponent } from './../conversation-footer/conversation-footer.component';

// tslint:disable-next-line:max-line-length
import { ElementRef, Component, OnInit, OnChanges, AfterViewInit, Input, Output, ViewChild, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  UID_SUPPORT_GROUP_MESSAGES
} from 'src/app/utils/constants';

// models

import { MessageModel } from 'src/chat21-core/models/message';

// utils
import { isJustRecived, isPopupUrl} from 'src/app/utils/utils';
import { v4 as uuidv4 } from 'uuid';


// Import the resized event model

import {DomSanitizer} from '@angular/platform-browser';

import { AppComponent } from '../../../app.component';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { ConversationHandlerService } from 'src/chat21-core/providers/abstract/conversation-handler.service';
import { ConversationHandlerBuilderService } from 'src/chat21-core/providers/abstract/conversation-handler-builder.service';
import { getDateDifference, getFromNow, popupUrl } from 'src/chat21-core/utils/utils';
import { ConversationContentComponent } from '../conversation-content/conversation-content.component';
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service';
import { Globals } from 'src/app/utils/globals';
import { AppConfigService } from 'src/app/providers/app-config.service';
import { StarRatingWidgetService } from 'src/app/providers/star-rating-widget.service';
import { TiledeskRequestsService } from 'src/chat21-core/providers/tiledesk/tiledesk-requests.service';
import moment from 'moment';
import { isUserBanned } from 'src/chat21-core/utils/utils-message';
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'chat-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {'(window:resize)': 'onResize($event)'}
})
export class ConversationComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('afConversationComponent') private afConversationComponent: ElementRef; // l'ID del div da scrollare
  // @HostListener('window:resize', ['$event'])
  // ========= begin:: Input/Output values
  // @Input() elRoot: ElementRef;
  @Input() conversationId: string;
  @Input() stylesMap: Map<string, string>;
  @Input() isOpen: boolean;
  @Input() senderId: string;    // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  @Input() isConversationArchived: boolean;
  @Output() onBackHome = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  @Output() onSoundChange = new EventEmitter();
  @Output() onConversationClosed = new EventEmitter<string>()
  @Output() onSignOut = new EventEmitter();
  @Output() onBeforeMessageSent = new EventEmitter();
  @Output() onAfterSendMessage = new EventEmitter<MessageModel>();
  @Output() onNewConversationInit = new EventEmitter();
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onNewMessageCreated = new EventEmitter();
  @Output() onNewConversationButtonClicked = new EventEmitter();
  // ========= end:: Input/Output values

  // projectid: string;   // uid progetto passato come parametro getVariablesFromSettings o getVariablesFromAttributeHtml
  // channelType: string; // tipo di conversazione ( group / direct ) a seconda che recipientId contenga o meno 'group'
  // writingMessage = '';    // messaggio sta scrivendo...
  // isTypings = false;
  conversation: ConversationModel
  conversationWith: string;
  isMenuShow = false;
  isEmojiiPickerShow: boolean = false;
  
  isButtonsDisabled = true;
  // isConversationArchived = false;
  hideFooterTextReply: boolean = false;
  hideTextAreaContent: boolean = false;
  footerMessagePlaceholder: string = '';
  textInputTextArea: String;
  isTrascriptDownloadEnabled = false;
  showContinueConversationButton: boolean = false
  // ========= begin:: gestione scroll view messaggi ======= //
  //startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  isScrolling = false;
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  showBadgeScroollToBottom = false;
  messagesBadgeCount = 0;
  // ========= end:: gestione scroll view messaggi ======= //


  // ========= begin:: send image ======= //
  selectedFiles: FileList;
  // isFilePendingToUpload: Boolean = false;
  arrayFilesLoad: Array<any>;
  isFileSelected: Boolean = false;

  isOpenAttachmentPreview: Boolean = false;
  attachments: Array<{ file: Array<any>, metadata: {}}>

  
  
  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;

  // availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  messages: Array<MessageModel> = [];


  CLIENT_BROWSER: string = navigator.userAgent;

  // devo inserirle nel globals
  subscriptions: Array<any> = [];
  private unsubscribe$: Subject<any> = new Subject<any>();
  showMessageWelcome: boolean;

  // ========= begin::agent availability
  // public areAgentsAvailableText: string;
  // public areAgentsAvailable: Boolean = false;
  // ========= end::agent availability


  isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
  firstScroll = true;

  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  translationMapHeader: Map<string, string>;
  translationMapFooter: Map<string, string>;
  translationMapContent: Map<string, string>;
  translationMapPreview: Map<string, string>;

  // ========== begin:: typying =======
  public isTypings = false;
  public isDirect = false;
  public idUserTypingNow: string;
  public nameUserTypingNow: string;
  private setTimeoutWritingMessages;
  membersConversation = ['SYSTEM'];
  // ========== end:: typying =======

  @ViewChild(ConversationFooterComponent) conversationFooter: ConversationFooterComponent
  @ViewChild(ConversationContentComponent) conversationContent: ConversationContentComponent
  conversationHandlerService: ConversationHandlerService
  conversationsHandlerService: ConversationsHandlerService
  archivedConversationsHandlerService: ArchivedConversationsHandlerService

  public isButtonUrl: boolean = false;
  public buttonClicked: any;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    //public el: ElementRef,
    public g: Globals,
    public starRatingWidgetService: StarRatingWidgetService,
    public sanitizer: DomSanitizer,
    public appComponent: AppComponent,
    public appStorageService: AppStorageService,
    public conversationHandlerBuilderService: ConversationHandlerBuilderService,
    public appConfigService: AppConfigService,
    private customTranslateService: CustomTranslateService,
    private chatManager: ChatManager,
    public typingService: TypingService,
    private tiledeskRequestService: TiledeskRequestsService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) { }

  onResize(event){
    this.logger.debug('[CONV-COMP] resize event', event)
  }

  ngOnInit() {
    // this.initAll();
    this.logger.debug('[CONV-COMP] ngOnInit: ', this.senderId);
    this.showMessageWelcome = false;
    // const subscriptionEndRenderMessage = this.appComponent.obsEndRenderMessage.subscribe(() => {
    //   this.ngZone.run(() => {
    //     // that.scrollToBottom();
    //   });
    // });
    // this.subscriptions.push(subscriptionEndRenderMessage);
    // this.attributes = this.setAttributes();
    // this.getTranslation();
    this.translations();
    //this.initAll();

  }

  public translations() {
    const keysHeader = [
      //'LABEL_AVAILABLE',
      //'LABEL_NOT_AVAILABLE',
      //'LABEL_TODAY',
      //'LABEL_TOMORROW',
      //'LABEL_TO',
      'LABEL_LAST_ACCESS',
      //'ARRAY_DAYS',
      //'LABEL_ACTIVE_NOW',
      'LABEL_WRITING',
      'BUTTON_CLOSE_TO_ICON', 
      'OPTIONS', 
      'PREV_CONVERSATIONS',
      'SOUND_OFF',
      'SOUND_ON',
      'DOWNLOAD_TRANSCRIPT',
      'BACK',
      'CLOSE',
      'MAXIMIZE',
      'MINIMIZE',
      'CLOSE_CHAT',
      'RESTART',
      'LOGOUT'
    ];

    const keysFooter = [
      'LABEL_PLACEHOLDER',
      'GUEST_LABEL',
      'LABEL_START_NW_CONV',
      'CONTINUE'
    ];

    const keysContent = [
      'INFO_SUPPORT_USER_ADDED_SUBJECT',
      'INFO_SUPPORT_USER_ADDED_YOU_VERB',
      'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
      'INFO_SUPPORT_USER_ADDED_VERB',
      'INFO_SUPPORT_CHAT_REOPENED',
      'INFO_SUPPORT_CHAT_CLOSED',
      'INFO_A_NEW_SUPPORT_REQUEST_HAS_BEEN_ASSIGNED_TO_YOU',
      'INFO_SUPPORT_LEAD_UPDATED',
      'INFO_SUPPORT_MEMBER_LEFT_GROUP',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_LOADING',
      'LABEL_TO',
      'ARRAY_DAYS',
    ];

    const keysPreview= [
      'BACK', 
      'CLOSE',
      'LABEL_PLACEHOLDER',
      'LABEL_PREVIEW'
    ];

    
    this.translationMapHeader = this.customTranslateService.translateLanguage(keysHeader);
    this.translationMapFooter = this.customTranslateService.translateLanguage(keysFooter);
    this.translationMapContent = this.customTranslateService.translateLanguage(keysContent);
    this.translationMapPreview = this.customTranslateService.translateLanguage(keysPreview);
  }

  ngAfterViewInit() {
    this.logger.debug('[CONV-COMP] --------ngAfterViewInit: conversation-------- ');
    // this.storageService.setItem('activeConversation', this.conversation.uid);
    
    // --------------------------- //
    // after animation intro
    setTimeout(() => {
      this.initAll();
      // this.setFocusOnId('chat21-main-message-context');
      //this.updateConversationBadge();

      // this.g.currentConversationComponent = this;
      if (this.g.newConversationStart === true) {
        this.onNewConversationComponentInit();
        this.g.newConversationStart = false;
      }
      this.setSubscriptions();
      if (this.afConversationComponent) {
        this.afConversationComponent.nativeElement.focus();
      }
      this.isButtonsDisabled = false;
    }, 300);
  }

  ngAfterViewChecked(){
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug('[CONV-COMP] onChagnges', changes)
    if(this.stylesMap){
      this.elementRef.nativeElement.style.setProperty('--themeColor', this.stylesMap.get('themeColor'))
      this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.stylesMap.get('foregroundColor'))
    }
    if (this.isOpen === true) {
      //this.updateConversationBadge();
      // this.scrollToBottom();
    }
    // CHECK if conversationId is changed and re-build component
    if(changes && changes['conversationId'] && changes['conversationId'].previousValue !== undefined && (changes['conversationId'].previousValue !== changes['conversationId'].currentValue)){
      this.logger.debug("[CONV-COMP] UID CHANGESSSS", changes['conversationId'])
      
      this.ngOnDestroy();
      this.ngOnInit();
      this.ngAfterViewInit();
    }
  }

  updateConversationBadge() {
    this.logger.debug('[CONV-COMP] updateConversationBadge', this.conversationId, this.isConversationArchived)
    if(this.isConversationArchived && this.conversationId && this.archivedConversationsHandlerService){
      this.archivedConversationsHandlerService.setConversationRead(this.conversationId)
    }
    if (!this.isConversationArchived && this.conversationId && this.conversationsHandlerService) {
      this.conversationsHandlerService.setConversationRead(this.conversationId)
      const badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
      this.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
    }

  }

  /**
   * do per scontato che this.userId esiste!!!
   */
  initAll() {

    this.logger.debug('[CONV-COMP] ------ 2: setConversation ------ ');
    this.setConversation();

    this.logger.debug('[CONV-COMP] ------ 3: connectConversation ------ ');
    // this.connectConversation();
    this.initConversationHandler();

    this.logger.debug('[CONV-COMP] ------ 4: initializeChatManager ------ ');
    //this.initializeChatManager();

    // sponziello, commentato
    // this.logger.debug('[CONV-COMP] ------ 5: setAvailableAgentsStatus ------ ');
    // this.setAvailableAgentsStatus();

    // this.logger.debug('[CONV-COMP] ------ 5: updateConversationbage ------ ');
    // this.updateConversationBadge();

    this.logger.debug('[CONV-COMP] ------ 6: getConversationDetail ------ ', this.conversationId);
    this.getConversationDetail((isConversationArchived) => {
      this.logger.debug('[CONV-COMP] ------ 6: updateConversationbage ------ ');
      this.updateConversationBadge();
      return;
    }) //check if conv is archived or not
    // this.checkListMessages();

    if(this.g.customAttributes){
      this.updateUserInfo(this.g.customAttributes)
    }

    this.logger.debug('[CONV-COMP] ------ 7: initializeTyping()', this.conversationId)
    this.initializeTyping();
  }

  /**
   * @description get detail of conversation by uid and then return callback with conversation status
   * @param callback
   * @returns isConversationArchived (status conversation archived: boolean) 
   */
  getConversationDetail(callback:(isConversationArchived: boolean)=>void){
    // if(!this.isConversationArchived){ 
    //get conversation from 'conversations' firebase node
    this.logger.debug('[CONV-COMP] getConversationDetail: isConversationArchived???', this.isConversationArchived, this.conversationWith)
    this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv)=>{
      this.logger.debug('[CONV-COMP] getConversationDetail: conversationsHandlerService ', this.conversationWith, conv, this.isConversationArchived)
      if(conv){
        this.conversation = conv;
        // let duration = getDateDifference(new Date(+this.conversation.timestamp * 1000) , new Date(1661439632 * 1000))
        this.isConversationArchived = false;
        callback(this.isConversationArchived)
      }
      if(!conv){
        //get conversation from 'archivedconversations' firebase node
        this.logger.debug('[CONV-COMP] getConversationDetail: conv not exist --> search in archived list', this.isConversationArchived, this.conversationWith)
        this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv)=>{
          this.logger.debug('[CONV-COMP] getConversationDetail: archivedConversationsHandlerService', this.conversationWith, conv, this.isConversationArchived)
          if(conv){
            this.conversation = conv;
            this.isConversationArchived = true;
            /**calc time difference between now and last conversation timestamp to allow "Continue" button */
            let duration = getDateDifference(this.conversation.timestamp, Date.now())
            duration.hours < this.g.continueConversationBeforeTime? this.showContinueConversationButton = true: this.showContinueConversationButton = false
            callback(this.isConversationArchived)
          }else if(!conv) {
            callback(null);
          }
        })
      }
    });
    // } else { //get conversation from 'conversations' firebase node
    //   this.archivedConversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
    //     this.logger.debug('[CONV-COMP] archivedConversationsHandlerService getConversationDetail', this.conversationId, conv, this.isConversationArchived)
    //     if(conv){
    //       this.conversation = conv;
    //       this.isConversationArchived = true;
    //       callback(this.isConversationArchived) 
    //     }
    //     if(!conv){
    //       this.conversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
    //         this.logger.debug('[CONV-COMP] conversationsHandlerService getConversationDetail', this.conversationId, conv, this.isConversationArchived)
    //         conv? this.isConversationArchived = false : null  
    //         this.conversation = conv;
    //         callback(this.isConversationArchived) 
    //       })
    //     }
    //   })
    // }
    
    // if(!this.isConversationArchived){ //get conversation from 'conversations' firebase node
    //   this.conversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
    //     this.logger.debug('[CONV-COMP] conversationsHandlerService getConversationDetail', this.conversationId, conv)
    //     this.conversation = conv;
    //     callback(this.isConversationArchived)    
    //   })
    // }else { //get conversation from 'conversations' firebase node
    //   this.archivedConversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
    //     this.logger.debug('[CONV-COMP] archivedConversationsHandlerService getConversationDetail', this.conversationId, conv)
    //     this.conversation = conv;   
    //     callback(this.isConversationArchived)   
    //   })
    // }
    // this.updateConversationBadge()
  }

  /**
    * this.g.recipientId:
    * this.g.senderId:
    * this.g.channelType:
    * this.g.tenant
    * 1 - setto channelTypeTEMP ( group / direct )
    *    a seconda che recipientId contenga o meno 'group'
    * 2 - setto conversationWith
    * 2 - setto conversationWith
    *    uguale a recipientId se esiste
    *    uguale al senderId nel this.storageService se esiste
    *    generateUidConversation
  */
  private setConversation() {
    const recipientId = this.g.recipientId;
    const channelType = this.g.channelType;
    this.logger.debug('[CONV-COMP] setConversation recipientId::: ', recipientId, channelType);
    if ( !recipientId ) { this.g.setParameter('recipientId', this.setRecipientId()); }
    if ( !channelType ) { this.g.setParameter('channelType', this.setChannelType()); }
    this.conversationWith = recipientId as string;
    this.logger.debug('[CONV-COMP] setConversation conversation::: ', this.conversation);
    if (!this.conversation) {
      // this.conversation = new ConversationModel(
      //   recipientId,
      //   {},
      //   channelType,
      //   true,
      //   '',
      //   recipientId,
      //   this.g.recipientFullname,
      //   this.senderId,
      //   this.g.userFullname,
      //   '0',
      //   0,
      //   TYPE_MSG_TEXT,
      //   '',
      //   '',
      //   '',
      //   '',
      //   0,
      //   false
      //   );
      this.conversation = new ConversationModel(
        recipientId,
        this.g.attributes,
        channelType,
        this.g.recipientFullname,
        this.conversationWith,
        recipientId,
        this.g.recipientFullname,
        '',
        true,
        '',
        '',
        this.senderId,
        '',
        this.g.userFullname,
        '0',
        '',
        true,
        '',
        '',
        false,
        'text')
    }
  }


  /**
   *
   */
  private setRecipientId() {
    let recipientIdTEMP: string;
    const senderId = this.senderId;
    recipientIdTEMP = this.appStorageService.getItem(senderId);
    if (!recipientIdTEMP) {
      // questa deve essere sincrona!!!!
      // recipientIdTEMP = UID_SUPPORT_GROUP_MESSAGES + uuidv4(); >>>>>OLD 
      recipientIdTEMP = UID_SUPPORT_GROUP_MESSAGES + this.g.projectid + '-' + uuidv4().replace(/-/g, '');
      this.logger.debug('[CONV-COMP] recipitent', recipientIdTEMP)
      //recipientIdTEMP = this.messagingService.generateUidConversation(senderId);
    }
    return recipientIdTEMP;
  }

  /**
   *
   */
  private setChannelType() {
    let channelTypeTEMP = CHANNEL_TYPE_GROUP;
    const projectid = this.g.projectid;
    if (this.g.recipientId && this.g.recipientId.indexOf('group') !== -1) {
      channelTypeTEMP = CHANNEL_TYPE_GROUP;
    } else if (!projectid) {
      channelTypeTEMP = CHANNEL_TYPE_DIRECT;
    }
    return channelTypeTEMP;
  }


   /**
   * recupero da chatManager l'handler
   * se NON ESISTE creo un handler e mi connetto e lo memorizzo nel chatmanager
   * se ESISTE mi connetto
   * carico messaggi
   * attendo x sec se nn arrivano messaggi visualizzo msg welcome
   */
  initConversationHandler() {
    const tenant = this.g.tenant;
    this.messages = [];
    //TODO-GAB: da sistemare loggedUser in firebase-conversation-handler.service
    const loggedUser = { uid: this.senderId}
    const conversationWithFullname = this.g.recipientFullname; // TODO-GAB: risulta null a questo punto
    this.logger.debug('[CONV-COMP] initconversation NEWWW', loggedUser, conversationWithFullname, tenant)
    this.showMessageWelcome = false;
    const handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    this.logger.debug('[CONV-COMP] DETTAGLIO CONV - handler **************', handler, this.conversationWith);
    if (!handler) {
      this.conversationHandlerService = this.conversationHandlerBuilderService.build();
      this.conversationHandlerService.initialize(
        this.conversationWith,
        conversationWithFullname,
        loggedUser,
        tenant,
        this.translationMapContent,
        this.g.showInfoMessage
      );
      this.conversationHandlerService.connect();
      this.logger.debug('[CONV-COMP] DETTAGLIO CONV - NEW handler **************', this.conversationHandlerService);
      this.messages = this.conversationHandlerService.messages;
      
      /* SEND FIRST MESSAGE if preChatForm has 'firstMessage' key */ 
      this.sendFirstMessagePreChatForm()
      
      this.logger.debug('[CONV-COMP] DETTAGLIO CONV - messages **************', this.messages);
      this.chatManager.addConversationHandler(this.conversationHandlerService);

      // attendo un secondo e poi visualizzo il messaggio se nn ci sono messaggi
      const that = this;
      setTimeout( () => {
        if (!that.messages || that.messages.length === 0) {
          //this.showIonContent = true;
          that.showMessageWelcome = true;
          // that.sendFirstMessage()
          that.logger.debug('[CONV-COMP] setTimeout ***', that.showMessageWelcome);
        }
      }, 8000);

    } else {
      this.logger.debug('[CONV-COMP] NON ENTRO ***', this.conversationHandlerService, handler);
      this.conversationHandlerService = handler;
      this.messages = this.conversationHandlerService.messages;
      // sicuramente ci sono messaggi
      // la conversazione l'ho già caricata precedentemente
      // mi arriva sempre notifica dell'ultimo msg (tramite BehaviorSubject)
      // scrollo al bottom della pagina
    }
    this.logger.debug('[CONV-COMP] CONVERSATION MESSAGES ' + this.messages );

    //retrive active and archived conversations-handler service
    this.conversationsHandlerService = this.chatManager.conversationsHandlerService
    this.archivedConversationsHandlerService = this.chatManager.archivedConversationsService

  }

  /**
   *  se nel preChatForm c'è una chiave 'firstMessage'
   *  e la conversazione non ha altri messaggi, invio il firstMessage
   *  del preChatForm appena compilato
   */
  sendFirstMessagePreChatForm(){
    setTimeout(() => {
      if(this.messages && this.messages.length === 0){
        this.logger.debug('[CONV-COMP] sendFirstMessage: messages + attributes ',this.messages, this.g.attributes)
        if(this.g.attributes && this.g.attributes.preChatForm && this.g.attributes.preChatForm.firstMessage){
          const firstMessage = this.g.attributes.preChatForm.firstMessage
          this.conversationFooter.sendMessage(firstMessage, TYPE_MSG_TEXT, this.g.attributes) 
        }
      }
    }, 1000);
  }


  initializeTyping() {
    this.logger.debug('[CONV-COMP] membersconversation', this.membersConversation)
    this.membersConversation.push(this.senderId)
    //this.setSubscriptions();
    this.typingService.isTyping(this.conversationId, this.senderId, this.isDirect);
    
  }

  /** */
  subscribeTypings(data: any) {
    const that = this;
    try {
      const key = data.uidUserTypingNow;
      const waitTime = data.waitTime
      this.nameUserTypingNow = null;
      this.idUserTypingNow = null;

      if (data.nameUserTypingNow) {
        this.nameUserTypingNow = data.nameUserTypingNow;
      }
      if (data.uidUserTypingNow){
        this.idUserTypingNow = data.uidUserTypingNow
      }
      this.logger.debug('[CONV-COMP] subscribeTypings data:', data);
      const userTyping = this.membersConversation.includes(key);
      if ( !userTyping && key) {
        this.isTypings = true;
        setTimeout(function () {
          that.conversationContent.scrollToBottom();
        }, 0);
        // clearTimeout(this.setTimeoutWritingMessages);
        this.setTimeoutWritingMessages = setTimeout(() => {
            that.isTypings = false;
        }, waitTime);
        // this.initiTimeout(waitTime)
      }
    } catch (error) {
      this.logger.error('[CONV-COMP] error: ', error);
    }

  }

  initiTimeout(waitTime){
    const that = this;
    this.setTimeoutWritingMessages = setTimeout(() => {
      that.isTypings = false;
    }, waitTime);
  }

  resetTimeout(){
    this.isTypings = false
    this.setTimeoutWritingMessages = null;
    clearTimeout(this.setTimeoutWritingMessages)
  }

  /**
   * imposto le sottoscrizioni
   * 1 - conversazione chiusa (CHAT CHIUSA)
   * 2 - nuovo messaggio
   */
  setSubscriptions() {
    const that = this;
    let subscribtion: any;
    let subscribtionKey: string;

    subscribtionKey = 'starRating';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.starRatingWidgetService.setOsservable(false);
      // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
      // tslint:disable-next-line:max-line-length
      this.logger.debug('[CONV-COMP] setSubscriptions!!!! StartRating', this.starRatingWidgetService.obsCloseConversation.value);
      subscribtion = this.starRatingWidgetService.obsCloseConversation.pipe(takeUntil(this.unsubscribe$)).subscribe(isOpenStartRating => {
        this.logger.debug('[CONV-COMP] startratingggg', isOpenStartRating)
        that.g.setParameter('isOpenStartRating', isOpenStartRating);
        if (isOpenStartRating === false) {
          this.logger.debug('[CONV-COMP] NOT OPEN StartRating **');
        } else if (isOpenStartRating === true) {
          this.logger.debug('[CONV-COMP] OPEN StartRating **');
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }


    subscribtionKey = 'messageAdded';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.logger.debug('[CONV-COMP] ***** add messageAdded *****',  this.conversationHandlerService);
      subscribtion = this.conversationHandlerService.messageAdded.pipe(takeUntil(this.unsubscribe$)).subscribe((msg: MessageModel) => {
        this.logger.debug('[CONV-COMP] ***** DETAIL messageAdded *****', msg);
        if (msg) {
          that.newMessageAdded(msg);
          this.onNewMessageCreated.emit(msg)
          this.checkMessagesLegntForTranscriptDownloadMenuOption();
          this.resetTimeout();
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'conversationsRemoved';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){

      subscribtion = this.chatManager.conversationsHandlerService.conversationRemoved.pipe(takeUntil(this.unsubscribe$)).subscribe((conversation) => {
        this.logger.debug('[CONV-COMP] ***** DATAIL conversationsRemoved *****', conversation, this.conversationWith, this.isConversationArchived);
        if(conversation && conversation.uid === this.conversationWith){
          this.isConversationArchived = true;
          this.g.nativeRating? this.starRatingWidgetService.setOsservable(true): null; //if nativeRating is true, open starRatingComponent, otherwize do nothing
          this.g.nativeRating? null: this.onConversationClosed.emit(conversation.uid) //if nativeRating is false, when conversation in archived -> manually back to home
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'conversationsChanged';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){

      subscribtion = this.chatManager.conversationsHandlerService.conversationChanged.pipe(takeUntil(this.unsubscribe$)).subscribe((conversation) => {
        this.logger.debug('[CONV-COMP] ***** DATAIL conversationsChanged *****', conversation, this.conversationWith, this.isConversationArchived);
        if(conversation && conversation.recipient === this.g.senderId && isUserBanned(conversation)){
          return;
        }
        if(conversation && conversation.sender !== this.senderId){
          const checkContentScrollPosition = that.conversationContent.checkContentScrollPosition();
          if(checkContentScrollPosition && conversation.is_new){ //update conversation if scroolToBottom is to the end
            this.logger.debug('[CONV-COMP] updateConversationBadge...')
            that.updateConversationBadge();
          }
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'messageWait';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.logger.debug('[CONV-COMP] ***** add messageWait *****',  this.conversationHandlerService);
      subscribtion = this.conversationHandlerService.messageWait.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.logger.debug('[CONV-COMP] ***** DETAIL messageWait *****', data);
        if (data && data.waitTime && data.waitTime !== 0) {
          const isTypingUid = data.uid; //support-group-...
          if (this.conversationId === isTypingUid) {
            that.subscribeTypings(data);
          }
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'messageInfo';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.logger.debug('[CONV-COMP] ***** add messageInfo *****',  this.conversationHandlerService);
      subscribtion = this.conversationHandlerService.messageInfo.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.logger.debug('[CONV-COMP] ***** DETAIL messageInfo *****', data);
        if(data){
          this.updateLeadInfo(data)
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'conversationTyping';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      subscribtion =  this.typingService.BSIsTyping.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.logger.debug('[CONV-COMP] ***** BSIsTyping *****', data);
        if (data) {
          const isTypingUid = data.uid; //support-group-...
          if (this.conversationId === isTypingUid) {
            that.subscribeTypings(data);
          }
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

  }

  checkMessagesLegntForTranscriptDownloadMenuOption(){
    if(this.messages.length > 1 && this.g.allowTranscriptDownload){
      this.isTrascriptDownloadEnabled = true
    }
  }
  // NUOVO MESSAGGIO!!
  /**
   * se:          non sto già scrollando oppure il messaggio l'ho inviato io -> scrollToBottom
   * altrimenti:  se esiste scrollMe (div da scrollare) verifico la posizione
   *  se:         sono alla fine della pagina scrollo alla fine
   *  altrimenti: aumento il badge
   */
  newMessageAdded(msg){
    const that = this;
    const senderId = that.senderId;
    if (msg.sender === senderId) { //caso in cui sender manda msg
      that.logger.debug('[CONV-COMP] *A1-------');
      setTimeout(function () {
        that.conversationContent.scrollToBottom();
      }, 200);
    } else if (msg.sender !== senderId) { //caso in cui operatore manda msg
      const checkContentScrollPosition = that.conversationContent.checkContentScrollPosition();
      if (checkContentScrollPosition) {
        that.logger.debug('[CONV-COMP] *A2-------');
        // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
        setTimeout(function () {
          that.conversationContent.scrollToBottom();
        }, 200);
      } else {
        that.logger.debug('[CONV-COMP] *A3-------');
        that.messagesBadgeCount++;
        // that.soundMessage(msg.timestamp);
      }

      // check if sender can reply --> set footer active/disabled
      if(msg.attributes && msg.attributes['disableInputMessage']){
        this.hideFooterTextReply = msg.attributes['disableInputMessage']
        
      } else if (msg.attributes && !msg.attributes['disableInputMessage']) {
        this.hideFooterTextReply = false
      }

      // check if footer text placebolder exist --> set new footer text placeholder
      if(msg.attributes && msg.attributes['inputMessagePlaceholder']) {
        this.footerMessagePlaceholder = msg.attributes['inputMessagePlaceholder']
      }else {
        this.footerMessagePlaceholder = '';
      }
    }

  }

  updateLeadInfo(msg){
    //check if user has changed userFullname and userEmail
    if (msg.attributes && msg.attributes['updateUserFullname']) {
      const userFullname = msg.attributes['updateUserFullname'];
      this.logger.debug('[CONV-COMP] newMessageAdded --> updateUserFullname', userFullname)
      this.g.setAttributeParameter('userFullname', userFullname);
      this.g.setParameter('userFullname', userFullname);
      this.appStorageService.setItem('attributes', JSON.stringify(this.g.attributes));
    }
    if (msg.attributes && msg.attributes['updateUserEmail']) {
      const userEmail = msg.attributes['updateUserEmail'];
      this.logger.debug('[CONV-COMP] newMessageAdded --> userEmail', userEmail)
      this.g.setAttributeParameter('userEmail', userEmail);
      this.g.setParameter('userEmail', userEmail);
      this.appStorageService.setItem('attributes', JSON.stringify(this.g.attributes));
    }
  }

  updateUserInfo(customAttributes){
    if (customAttributes && customAttributes['userFullname']) {
      const userFullname = customAttributes['userFullname'];
      this.logger.debug('[CONV-COMP] updateUserInfo --> userFullname', userFullname)
      this.g.setAttributeParameter('userFullname', userFullname);
      this.g.setParameter('userFullname', userFullname);
    }
    if (customAttributes && customAttributes['userEmail']) {
      const userEmail = customAttributes['userEmail'];
      this.logger.debug('[CONV-COMP] updateUserInfo --> userEmail', userEmail)
      this.g.setAttributeParameter('userEmail', userEmail);
      this.g.setParameter('userEmail', userEmail);
    }
    this.appStorageService.setItem('attributes', JSON.stringify(this.g.attributes));
  }

 scrollToBottom() {
  this.conversationContent.scrollToBottom();
  // const that = this;
  //  try {
  //   that.isScrolling = true;
  //   const objDiv = document.getElementById(that.idDivScroll) as HTMLElement;
  //   console.log('divto scrool', objDiv);
  //   // const element = objDiv[0] as HTMLElement;
  //   setTimeout(function () {

  //     if (that.isIE === true || withoutAnimation === true || that.firstScroll === true) {
  //       objDiv.parentElement.classList.add('withoutAnimation');
  //     } else {
  //       objDiv.parentElement.classList.remove('withoutAnimation');
  //     }
  //     objDiv.parentElement.scrollTop = objDiv.scrollHeight;
  //     objDiv.style.opacity = '1';
  //     that.firstScroll = false;
  //   }, 0);
  // } catch (err) {
  //   that.g.wdLog(['> Error :' + err]);
  // }
  // that.isScrolling = false;
 }

  // ========= end:: functions scroll position ======= //


  // =========== BEGIN: event emitter function ====== //
  /** CALLED BY: conv-header component */
  onBackHomeFN() {
    //this.storageService.removeItem('activeConversation');
    //this.g.setParameter('activeConversation', null, false);
    this.onBackHome.emit();
  }
  /** CALLED BY: conv-header component */
  onCloseWidgetFN() {
    //this.g.setParameter('activeConversation', null, false);
    this.onCloseWidget.emit();
  }
  /** CALLED BY: conv-header component */
  onSoundChangeFN(soundEnabled){
    this.onSoundChange.emit(soundEnabled)
  }
  /** CALLED BY: conv-header component */
  onCloseChat(event){
    this.logger.debug('[CONV-COMP] close chat with uid ', this.conversation.uid)
    this.tiledeskRequestService.closeSupportGroup(this.conversation.uid).then(data => {
      if(data === 'closed'){
        this.isMenuShow = false
        this.logger.debug('[CONV-COMP] chat closed successfully with uid ', this.conversation.uid)
      }
    }).catch(error => {
      this.logger.error('[CONV-COMP] ERROR while closing chat with id: ', this.conversation.uid, error)
    })
  }
  /** CALLED BY: conv-header component */
  onRestartChat(event){
    this.hideTextAreaContent = true
  }
  /** CALLED BY: conv-header component */
  onWidgetHeightChange(mode){
    var tiledeskDiv = this.g.windowContext.window.document.getElementById('tiledeskdiv') 
    if(mode==='max'){
      tiledeskDiv.style.maxHeight = 'unset'
    }else if(mode==='min'){
      tiledeskDiv.style.maxHeight = '620px'
    }
    this.isMenuShow = false;
  }
  /** CALLED BY: conv-header component */
  onSignOutFN(event){
    this.onSignOut.emit(true)
  }
  /** CALLED BY: conv-header conv-content component */
  onMenuOption(event:boolean){
    this.isMenuShow = event;
    this.conversationFooter.removeFocusOnId('chat21-main-message-context')
  }

  /** CALLED BY: conv-content component */
  onBeforeMessageRenderFN(event){
    this.onBeforeMessageRender.emit(event)
  }
  /** CALLED BY: conv-content component */
  onAfterMessageRenderFN(event){
    this.onAfterMessageRender.emit(event)
  }
  /** CALLED BY: conv-content component */
  onAttachmentButtonClicked(event: any) {
    this.logger.debug('[CONV-COMP] eventbutton', event)
    if (!event || !event.target.type) {
      return;
    }
    switch (event.target.type) {
      case 'url':
        try {
          this.openLink(event.target.button);
        } catch (err) {
          this.logger.error('[CONV-COMP] url > Error :' + err);
        }
        return;
      case 'action':
        try {
          this.actionButton(event.target.button);
        } catch (err) {
          this.logger.error('[CONV-COMP] action > Error :' + err);
        }
        return false;
      case 'text':
        try{
          const text = event.target.button.value
          const metadata = { 'button': true };
          this.conversationFooter.sendMessage(text, TYPE_MSG_TEXT, metadata);
        }catch(err){
          this.logger.error('[CONV-COMP] text > Error :' + err);
        }
      default: return;
    }
  }

  /** CALLED BY: conv-content component */
  onScrollContent(event: boolean){
    this.showBadgeScroollToBottom = !event;
    this.logger.debug('[CONV-COMP] scroool eventtt', event)
    //se sono alla fine (showBadgeScroollBottom === true) allora imposto messageBadgeCount a 0
    if(!this.showBadgeScroollToBottom){
      this.messagesBadgeCount = 0;
      this.updateConversationBadge();
    }
    
  }

  /** CALLED BY: conv-internal-frame component */
  onOpenExternalFrame(event){
    window.open(event.link, '_blank');
  }
  /** CALLED BY: conv-internal-frame component */
  onCloseInternalFrame(event){
    this.isButtonUrl = false
    this.buttonClicked = null;
    this.restoreDefaultWidgetSize();
  }

  /** CALLED BY: conv-preview component */
  onSendAttachment(messageText: string){
    this.isOpenAttachmentPreview = false
    this.conversationFooter.uploadSingle(this.attachments[0].metadata, this.attachments[0].file, messageText)
    // send message to footer-component
  }
  /** CALLED BY: conv-preview component */
  onCloseModalPreview(){
    this.isOpenAttachmentPreview = false
    this.conversationFooter.isFilePendingToUpload = false;
    this.logger.debug('[CONV-COMP] onCloseModalPreview::::', this.isOpenAttachmentPreview, this.conversationFooter)
  }
  
  /** CALLED BY: conv-footer conv-content component */
  onEmojiiPickerShow(event:boolean){
    this.isEmojiiPickerShow = event
  }
  /** CALLED BY: conv-footer component */
  onBeforeMessangeSentFN(messageModel){
    this.onBeforeMessageSent.emit(messageModel)
  }
  /** CALLED BY: conv-footer component */ 
  onAfterSendMessageFN(message: MessageModel){
    this.onAfterSendMessage.emit(message)
  }
  /** CALLED BY: conv-footer component */ 
  onChangeTextArea(event){
    if(event && event.textAreaEl){
      const scrollDiv = this.conversationContent.scrollMe
      const height = +event.textAreaEl.style.height.substring(0, event.textAreaEl.style.height.length - 2);
      if(height > 20 && height < 110){
        scrollDiv.nativeElement.style.height = 'calc(100% - ' + (height - 20)+'px'
        // document.getElementById('chat21-button-send').style.right = '18px'
        this.scrollToBottom()
      } else if(height <= 20) {
        scrollDiv.nativeElement.style.height = '100%'
      } else if(height > 110){
        // document.getElementById('chat21-button-send').style.right = '18px'
      }
    }
  }
  /** CALLED BY: conv-footer component */
  onAttachmentFileButtonClicked(event: any){
    this.logger.debug('[CONV-COMP] onAttachmentButtonClicked::::', event)
    this.attachments = event.attachments
    this.textInputTextArea= event.message
    this.logger.debug('[CONV-COMP] onAttachmentButtonClicked::::', this.textInputTextArea)
    this.isOpenAttachmentPreview = true
  }
  /** CALLED BY: conv-footer floating-button component */
  onNewConversationButtonClickedFN(event){
    this.logger.debug('[CONV-COMP] floating onNewConversationButtonClicked')
    this.onNewConversationButtonClicked.emit()
  }
  /** CALLED BY: conv-footer floating-button component */
  onBackButton(event: boolean){
    this.hideTextAreaContent = event;
    try{
      const tiledeskDiv = document.getElementById('chat21-footer')
      tiledeskDiv.classList.remove('maximize-width')
      // tiledeskDiv.style.width = '376px'
      // tiledeskDiv.style.maxHeight = '620px'
    }catch(e){
      this.logger.error('[CONV-COMP] onBackButton > Error :' + e);
    }

  }
  // =========== END: event emitter function ====== //


  openInputFiles() {
    alert('ok');
    if (document.getElementById('chat21-file')) {
     const docInput = document.getElementById('chat21-file');
     docInput.style.display = 'block';
    }
  }



  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /** elimino tutte le sottoscrizioni */
  ngOnDestroy() {
    this.logger.debug('[CONV-COMP] ngOnDestroy ------------------> this.subscriptions', this.subscriptions);
    //this.storageService.removeItem('activeConversation');
    this.isConversationArchived = false;
    this.hideTextAreaContent = false;
    this.conversationFooter.textInputTextArea='';
    this.hideFooterTextReply = false;
    this.footerMessagePlaceholder = '';
    this.unsubscribe();
  }

  /** */
  unsubscribe() {
    this.logger.debug('[CONV-COMP] ******* unsubscribe *******');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.chatManager.conversationsHandlerService.conversationRemoved.next(null)
    this.conversationHandlerService.messageWait.next(null)
    this.typingService.BSIsTyping.next(null)

    // TODO-GAB: da verificare se eliminarlo
    this.subscriptions.forEach(function (subscription) {
      subscription.value.unsubscribe();
    });
    this.subscriptions = [];
    this.subscriptions.length = 0;
    //this.messagingService.unsubscribeAllReferences();
    this.logger.debug('[CONV-COMP]this.subscriptions', this.subscriptions);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



  /**
   * regola sound message:
   * se lo invio io -> NO SOUND
   * se non sono nella conversazione -> SOUND
   * se sono nella conversazione in fondo alla pagina -> NO SOUND
   * altrimenti -> SOUND
   */
  // soundMessage(timestamp?) {
  //   if (!isJustRecived(this.g.startedAt.getTime(), timestamp)) {
  //     return;
  //   }
  //   const soundEnabled = this.g.soundEnabled;
  //   const baseLocation = this.g.baseLocation;
  //   if ( soundEnabled ) {
  //     const that = this;
  //     this.audio = new Audio();
  //     this.audio.src = baseLocation + '/assets/sounds/justsaying.mp3';
  //     this.audio.load();
  //     // console.log('conversation play');
  //     clearTimeout(this.setTimeoutSound);
  //     this.setTimeoutSound = setTimeout(function () {
  //       that.audio.play();
  //       that.logger.debug('[CONV-COMP] ****** soundMessage 1 *****', that.audio.src);
  //     }, 1000);
  //   }
  // }
  private onIncreaseWith(){
    try{
      const tiledeskDiv = this.g.windowContext.window.document.getElementById('tiledeskdiv') 
      tiledeskDiv.classList.add('increaseSize')
      const chat21conversations = document.getElementById('chat21-conversations')
      chat21conversations.style.borderRadius = '16px'
      // tiledeskDiv.style.width = '696px'
      // tiledeskDiv.style.maxHeight = '712px'
    }catch(e){
      this.logger.error('[CONV-COMP] onIncreaseWith > Error :' + e);
    }
  }

  private restoreDefaultWidgetSize(){
    try{
      const tiledeskDiv = this.g.windowContext.window.document.getElementById('tiledeskdiv') 
      tiledeskDiv.classList.remove('increaseSize')
      tiledeskDiv.classList.remove('decreaseSize')
      // tiledeskDiv.style.width = '376px'
      // tiledeskDiv.style.maxHeight = '620px'
    }catch(e){
      this.logger.error('[CONV-COMP] restoreDefaultWidgetSize > Error :' + e);
    }
  }
  

  /** */
  private openLink(event: any) {
    const link = event.link ? event.link : '';
    const target = event.target ? event.target : '';
    // this.onIncreaseWith()
    if (target === 'self') {
      // window.open(link, '_self');
      this.isButtonUrl= true;
      this.buttonClicked = event
      
    } else if (target === 'parent') {
      window.open(link, '_parent');
    } else {
      window.open(link, '_blank');
    }
  }

  /** */
  private actionButton(event: any) {
    // console.log(event);
    const action = event.action ? event.action : '';
    const message = event.value ? event.value : '';
    const subtype = event.show_echo ?  '' : 'info';

    const attributes = {
      action: action,
      subtype: subtype
    };
    this.conversationFooter.sendMessage(message, TYPE_MSG_TEXT, null, attributes);
    this.logger.debug('[CONV-COMP] > action :');
  }


  // ========= START:: TRIGGER FUNCTIONS ============//
  private onNewConversationComponentInit() {
    this.logger.debug('[CONV-COMP] ------- onNewConversationComponentInit ------- ');
    this.setConversation();
    // this.connectConversation();
    const newConvId = this.conversationWith;
    const default_settings = this.g.default_settings;
    const appConfigs = this.appConfigService.getConfig();

    this.onNewConversationInit.emit({ global: this.g, default_settings: default_settings, newConvId: newConvId, appConfigs: appConfigs })
  }
  // ========= END:: TRIGGER FUNCTIONS ============//

}
