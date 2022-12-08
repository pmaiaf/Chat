import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Globals } from 'src/app//utils/globals';
import { AppConfigService } from 'src/app/providers/app-config.service';
import { convertColorToRGBA } from 'src/chat21-core/utils/utils';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-conversation-header',
  templateUrl: './conversation-header.component.html',
  styleUrls: ['./conversation-header.component.scss']
})
export class ConversationHeaderComponent implements OnInit, OnChanges {

  // ========= begin:: Input/Output values
  @Input() idConversation: string;
  @Input() senderId: string;
  @Input() soundEnabled: boolean;
  @Input() isMenuShow: boolean;
  @Input() isTypings: boolean;
  @Input() nameUserTypingNow: string;
  @Input() typingLocation: string;
  @Input() isTrascriptDownloadEnabled: boolean;
  @Input() hideCloseConversationOptionMenu: boolean;
  @Input() hideRestartConversationOptionsMenu: boolean;
  @Input() hideHeaderCloseButton: boolean;
  @Input() hideHeaderBackButton: boolean;
  @Input() hideHeaderConversationOptionsMenu: boolean;
  @Input() hideSignOutOptionMenu: boolean;
  @Input() windowContext;
  @Input() stylesMap: Map<string, string>
  @Input() translationMap: Map< string, string>;
  @Input() widgetTitle: string;
  @Output() onBack = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  @Output() onSoundChange = new EventEmitter();
  @Output() onCloseChat =  new EventEmitter();
  @Output() onRestartChat =  new EventEmitter();
  @Output() onWidgetHeightChange = new EventEmitter<string>();
  @Output() onSignOut = new EventEmitter();
  @Output() onMenuOptionShow = new EventEmitter();
  // ========= end:: Input/Output values

  // ============ BEGIN: SET FUNCTION BY UTILS ==============//
  convertColorToRGBA = convertColorToRGBA;
  // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
  
  isButtonsDisabled = true;
  
  // public isTypings = false;
  public isDirect = false;
  public writingMessage: string;
  // public nameUserTypingNow: string;
  private setTimeoutWritingMessages;

  subscriptions = [];
  
  membersConversation = ['SYSTEM'];
  heightStatus: string = 'min'

  // text used within the html
  private API_URL: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(
    public g: Globals,
    public appConfigService: AppConfigService,) {
      this.API_URL = this.appConfigService.getConfig().apiUrl;
     }

  ngOnInit() {
    this.logger.debug('[CONV-HEADER] ngOnInit: conversation-header COMPONENT ', this.translationMap);
    this.membersConversation.push(this.senderId)
    //this.initializeTyping();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes['idConversation'] && changes['idConversation'].currentValue !== undefined){
      this.logger.debug('[CONV-HEADER] onChanges -- Conversation-header.component-> start initializeTyping()', this.idConversation)
      // this.initializeTyping();
    }
  }

  ngAfterViewInit() {
    // this.isShowSpinner();
    this.logger.debug('[CONV-HEADER] --------ngAfterViewInit: conversation-header-------- ');
    // this.appStorageService.setItem('activeConversation', this.conversation.uid);
    // --------------------------- //
    // after animation intro
    // setTimeout(() => {
      // this.initAll();
      // this.setFocusOnId('chat21-main-message-context');

      // this.g.currentConversationComponent = this;
      // if (this.g.newConversationStart === true) {
      //   this.onNewConversationComponentInit();
      //   this.g.newConversationStart = false;
      // }
      //this.subscriptionTyping();
      // if (this.afConversationComponent) {
      //   this.afConversationComponent.nativeElement.focus();
      // }
      this.isButtonsDisabled = false;
    // }, 300);
    this.setSubscriptions();

  }


  // initializeTyping() {
  //   this.logger.debug('[CONV-HEADER] membersconversation', this.membersConversation)
  //   this.typingService.isTyping(this.idConversation, this.senderId, this.isDirect);
    
  // }

  // /** */
  private setSubscriptions() {
    // const that = this;
    // const conversationSelected = this.subscriptions.find(item => item.key === this.idConversation);
    // if (!conversationSelected) {
    //   const subscribeBSIsTyping =  this.typingService.BSIsTyping.subscribe((data: any) => {
    //     this.logger.debug('[CONV-HEADER] ***** BSIsTyping *****', data);
    //     if (data) {
    //       const isTypingUid = data.uid; //support-group-...
    //       if (this.idConversation === isTypingUid) {
    //         that.subscribeTypings(data);
    //       }
    //     }
    //   });
    //   const subscribe = {key: this.idConversation, value: subscribeBSIsTyping };
    //   this.subscriptions.push(subscribe);
    // }
  }

  /** */
  // subscribeTypings(data: any) {
  //   const that = this;
  //   try {
  //     const key = data.uidUserTypingNow; 
  //     this.nameUserTypingNow = null;
  //     if (data.nameUserTypingNow) {
  //       this.nameUserTypingNow = data.nameUserTypingNow;
  //     }
  //     this.logger.debug('[CONV-HEADER] subscribeTypings data:', data);
  //     const userTyping = this.membersConversation.includes(key);
  //     if ( !userTyping) {
  //       this.isTypings = true;
  //       clearTimeout(this.setTimeoutWritingMessages);
  //       this.setTimeoutWritingMessages = setTimeout(() => {
  //           that.isTypings = false;
  //       }, 2000);
  //     }
  //   } catch (error) {
  //     this.logger.error('[CONV-HEADER] error: ', error);
  //   }

  // }


  // =========== BEGIN: event emitter function ====== //
  returnHome() {
    // this.appStorageService.removeItem('activeConversation');
    // this.g.setParameter('activeConversation', null, false);
    this.onBack.emit();
  }

  closeChat(){
    this.onCloseChat.emit();
  }

  restartChat(){
    this.onRestartChat.emit();
    this.onMenuOptionShow.emit(false)
  }

  closeWidget() {
    //this.g.setParameter('activeConversation', null, false);
    this.onCloseWidget.emit();
  }
  // =========== END: event emitter function ====== //

  dowloadTranscript() {
    const url = this.API_URL + 'public/requests/' + this.idConversation + '/messages-user.html';
    const windowContext = this.windowContext;
    windowContext.open(url, '_blank');
    // this.isMenuShow  = false;
    this.onMenuOptionShow.emit(false)
  }
  
  toggleSound() {
    //this.isMenuShow  = false;
    this.onMenuOptionShow.emit(false)
    this.onSoundChange.emit(!this.soundEnabled)
  }

  signOut(){
    this.onSignOut.emit(true)
  }

  toggleMenu() {
    this.onMenuOptionShow.emit(!this.isMenuShow)
    // this.isMenuShow = !this.isMenuShow;   
  }

  /**
   * 
   * @param status : string 'max' || 'min'
   */
  maximizeMinimize(status){
    this.heightStatus = status
    this.onWidgetHeightChange.emit(status)
  }




  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /**
   * elimino tutte le sottoscrizioni
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.logger.debug('[CONV-HEADER] ngOnDestroy ------------------> this.subscriptions', this.subscriptions);
    //this.appStorageService.removeItem('activeConversation');
    // this.unsubscribe();
    this.unsubescribeAll()
  }


  /** */
  private unsubescribeAll() {
    this.logger.debug('[CONV-HEADER] unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      this.logger.debug('[CONV-HEADER] unsubescribe: ', subscription);
      subscription.value.unsubscribe();
    });
    this.subscriptions.length = 0;
    this.subscriptions = [];
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//


}
