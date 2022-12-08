
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';

import { Subscription } from 'rxjs'


import { Globals } from '../../utils/globals';
import { setColorFromString, avatarPlaceholder, convertMessage } from '../../utils/utils';


// models
import { ConversationModel } from '../../../chat21-core/models/conversation';
// import * as moment from 'moment/moment';
// import 'moment-duration-format';
import {HumanizeDurationLanguage, HumanizeDuration} from 'humanize-duration-ts';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslatorService } from 'src/app/providers/translator.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { UserAgent } from 'src/models/userAgent';
import { WaitingService } from 'src/app/providers/waiting.service';


@Component({
  selector: 'chat-home-conversations',
  templateUrl: './home-conversations.component.html',
  styleUrls: ['./home-conversations.component.scss']
})


export class HomeConversationsComponent implements OnInit, OnDestroy {
  
  // ========= begin:: Input/Output values ============//
  @Input() listConversations: Array<ConversationModel>; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  @Input() archivedConversations: Array<ConversationModel>;
  @Input() hideNewConversationButton: boolean;
  @Input() stylesMap: Map<string, string>
  @Output() onNewConversation = new EventEmitter<string>();
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onOpenAllConvesations = new EventEmitter();
  @Output() onImageLoaded = new EventEmitter<ConversationModel>();
  @Output() onConversationLoaded = new EventEmitter<ConversationModel>();
  
  // ========= end:: Input/Output values ============//

  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */
  // subOpenConversations;
  subListConversations;
  subArchivedConversations;
  // ========= end:: sottoscrizioni ======= //
  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  // ========= end:: dichiarazione funzioni ========= //


  // ========= begin:: variabili del componente ======= //
  // conversations: ConversationModel[];
  //listConversations: Array<ConversationModel>;
  // archivedConversations: Array<ConversationModel>;
  tenant = '';
  themeColor = '';
  themeForegroundColor = '';
  LABEL_START_NW_CONV: string;
  availableAgents: Array<UserAgent> = [];
  // ========= end:: variabili del componente ======== //

  waitingTime: Number;
  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration;
  humanWaitingTime: string;
  WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER: string //new

  translationMapConversation: Map<string, string>;
  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    public g: Globals,
    public imageRepoService: ImageRepoService,
    public chatManager: ChatManager,
    public waitingService: WaitingService,
    public translatorService: TranslatorService,
    private customTranslateService: CustomTranslateService,
  ) {
    // console.log(this.langService);
    // https://www.npmjs.com/package/humanize-duration-ts
    // https://github.com/Nightapes/HumanizeDuration.ts/blob/master/src/humanize-duration.ts
    this.humanizer = new HumanizeDuration(this.langService);
    this.humanizer.setOptions({round: true});
    this.initialize();
  }

  ngOnInit() {
    this.logger.debug('[HOMECONVERSATIONS]---ngOnInit--- ', this.listConversations);
    
  }

  private initTranslations() {
    const keysConversation = ['CLOSED'];
    this.translationMapConversation = this.customTranslateService.translateLanguage(keysConversation);
  }

  

  // ========= begin:: ACTIONS ============//
  onConversationSelectedFN(conversation: ConversationModel) {
    if(conversation){
      // rimuovo classe animazione
      //this.removeAnimation();
      this.onConversationSelected.emit(conversation);
    }
  }

  // ========= end:: ACTIONS ============//

  initialize() {
    this.logger.debug('initialize: ListConversationsComponent');
    this.initTranslations();

    //this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV; // IN THE TEMPLATE REPLACED LABEL_START_NW_CONV WITH g.LABEL_START_NW_CONV
    this.listConversations = [];
    this.archivedConversations = [];
    this.waitingTime = -1;
    this.availableAgents = this.g.availableAgents.slice(0, 5)
    this.availableAgents.forEach(agent => {
      agent.imageurl = this.imageRepoService.getImagePhotoUrl(agent.id)
    })

    //this.logger.debug('senderId: ', this.senderId]);
    this.logger.debug('[HOMECONVERSATIONS] tenant: ', this.tenant, this.availableAgents);
    // this.conversationsService.initialize(this.senderId, this.tenant);
    // this.conversationsService.checkListConversations();
    // this.conversationsService.checkListArchivedConversations();
    // this.listConversations = this.conversationsService.listConversations;

    // this.conversationsHandlerService.initialize(this.tenant,this.senderId, translationMap)
    // this.conversationsHandlerService.connect();
    // this.listConversations = this.conversationsHandlerService.conversations;
    // 6 - save conversationHandler in chatManager
    // this.chatManager.setConversationsHandler(this.conversationsHandlerService);
    
    this.logger.debug('[HOMECONVERSATIONS] this.listConversations.length', this.listConversations.length);
    this.logger.debug('[HOMECONVERSATIONS] this.listConversations', this.listConversations);
    // if (this.g.supportMode) {
    //   this.showWaitingTime();
    // }
    this.showWaitingTime();
    //this.showConversations();
  }

  showWaitingTime() {
    const that = this;
    const projectid = this.g.projectid;
    if(projectid){
      this.waitingService.getCurrent(projectid).subscribe(response => {
        that.logger.debug('[HOMECONVERSATIONS] response waiting', response);
        if (response && response.length > 0 && response[0].waiting_time_avg) {
          const wt = response[0].waiting_time_avg;

          that.waitingTime = wt;
          that.logger.debug('[HOMECONVERSATIONS] that.waitingTime',  that.waitingTime);
          // console.log('that.waitingTime', that.waitingTime);

          const lang = that.translatorService.getLanguage();
          that.humanWaitingTime = this.humanizer.humanize(wt, {language: lang});
          // console.log('LIST CONVERSATION humanWaitingTime ', that.humanWaitingTime);
          // console.log('LIST CONVERSATION g.WAITING_TIME_FOUND ',  this.g.WAITING_TIME_FOUND)
          // console.log('LIST CONVERSATION g.WAITING_TIME_FOUND contains $reply_time',  this.g.WAITING_TIME_FOUND.includes("$reply_time") )
        
          // REPLACE
          if (this.g.WAITING_TIME_FOUND.includes("$reply_time")) {
            // REPLACE if exist
            this.WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER = this.g.WAITING_TIME_FOUND.replace("$reply_time", that.humanWaitingTime);
          }
          // console.log('LIST CONVERSATION WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER',  this.WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER)
          // console.log('LIST CONVERSATION g.dynamicWaitTimeReply ',  this.g.dynamicWaitTimeReply )
          // console.log('LIST CONVERSATION typeof g.dynamicWaitTimeReply ', typeof this.g.dynamicWaitTimeReply )

          // console.log('xxx', this.humanizer.humanize(wt));
          // 'The team typically replies in ' + moment.duration(response[0].waiting_time_avg).format();
        }
        //  else {
        //   that.waitingTimeMessage = 'waiting_time_not_found';
        //   // that.waitingTimeMessage = 'Will reply as soon as they can';
        //  }
      });
    }
    
}

checkShowAllConversation() {
  if (this.archivedConversations && this.archivedConversations.length > 0) {
    return true;
  } else if (this.listConversations && this.listConversations.length > 0) {
    return true;
  }
  return false;
}
// msToTime(duration) {
//   let milliseconds = parseInt((duration % 1000) / 100),
//     seconds = parseInt((duration / 1000) % 60),
//     minutes = parseInt((duration / (1000 * 60)) % 60),
//     hours = parseInt((duration / (1000 * 60 * 60)) % 24);

//   hours = (hours < 10) ? "0" + hours : hours;
//   minutes = (minutes < 10) ? "0" + minutes : minutes;
//   seconds = (seconds < 10) ? "0" + seconds : seconds;

//   return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
// }


//  dhm(t) {
//   let cd = 24 * 60 * 60 * 1000,
//       ch = 60 * 60 * 1000,
//       d = Math.floor(t / cd),
//       h = Math.floor( (t - d * cd) / ch),
//       m = Math.round( (t - d * cd - h * ch) / 60000),
//       pad = function(n){ return n < 10 ? '0' + n : n; };
// if ( m === 60 ) {
//   h++;
//   m = 0;
// }
// if ( h === 24 ) {
//   d++;
//   h = 0;
// }
// return [d, pad(h), pad(m)].join(':');
// }


  // setImageProfile(agent) {
  //   //console.log(agent);
  //   this.contactService.setImageProfile(agent)
  //   .then(function (snapshot) {
  //     if (snapshot.val().trim()) {
  //       agent.image = snapshot.val();
  //     }
  //   })
  //   .catch(function (err) {
  //       console.log(err);
  //   });
  // }



  // ========= begin:: ACTIONS ============//
  openNewConversation() {
    this.onNewConversation.emit();
  }
  returnOpenAllConversation() {
    this.onOpenAllConvesations.emit();
  }

  onImageLoadedFN(conversation: ConversationModel){
    this.onImageLoaded.emit(conversation)
  }

  onConversationLoadedFN(conversation: ConversationModel){
    this.onConversationLoaded.emit(conversation)
  }

  private openConversationByID(conversation) {
    this.logger.debug('[HOMECONVERSATIONS] openConversationByID: ', conversation);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.onConversationSelected.emit(conversation);
    }
  }
  // ========= end:: ACTIONS ============//


  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
  ngOnDestroy() {
    this.logger.debug('[HOMECONVERSATIONS] ngOnDestroy list conv subscriptions', this.subscriptions);
    this.unsubscribe();
  }

 /** */
 unsubscribe() {
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions = [];
    // this.subOpenConversations = null;
    this.subListConversations = null;
    this.subArchivedConversations = null;
    this.logger.debug('[HOMECONVERSATIONS] this.subscriptions', this.subscriptions);
 }
 // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
