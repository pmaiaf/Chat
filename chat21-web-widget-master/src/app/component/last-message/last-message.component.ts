import { Component, OnInit, Output, OnDestroy, AfterViewInit, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
// services
import { Globals } from 'src/app/utils/globals';

// utils
import { popupUrl, isPopupUrl, strip_tags } from '../../utils/utils';

import { MAX_WIDTH_IMAGES} from 'src/app/utils/constants';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { isImage } from 'src/chat21-core/utils/utils-message';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';


@Component({
  selector: 'chat-last-message',
  templateUrl: './last-message.component.html',
  styleUrls: ['./last-message.component.scss']
})
export class LastMessageComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() conversation: ConversationModel
  @Input() baseLocation: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onCloseMessagePreview  = new EventEmitter();
  @Output() onSelectedConversation = new EventEmitter<string>();
  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  strip_tags = strip_tags;
  isImage = isImage;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private imageRepoService: ImageRepoService,
    public g: Globals,
    // public conversationsService: ConversationsService
  ) { }

  ngOnInit() {
  }

  /** */
  ngAfterViewInit() {
    // this.logger.debug('isOpenNewMessage: ' + this.g.isOpenNewMessage);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug('[LASTMESSAGE] onChanges', changes)
    if(this.conversation){
      this.conversation.image = this.imageRepoService.getImagePhotoUrl(this.conversation.sender)
    }
  }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    if(metadata.width === undefined){
      metadata.width= MAX_WIDTH_IMAGES
    }
    if(metadata.height === undefined){
      metadata.height = MAX_WIDTH_IMAGES
    }
    // const MAX_WIDTH_IMAGES = 300;
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > (MAX_WIDTH_IMAGES)) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = (MAX_WIDTH_IMAGES) / rapporto;
    }
    return sizeImage; // h.toString();
  }



// ========= begin:: event emitter function ============//

  onAttachmentButtonClicked(event: any){
    // this.onAttachmentButtonClicked.emit(event)
    this.logger.debug('[LASTMESSAGE] onAttachmentButtonClicked', event)
  }
  /** */
  openConversationByID(conversation) {
    this.logger.debug('[LASTMESSAGE] openConversationByID: ', conversation);
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.debug('2 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    if ( conversation ) {
      this.onSelectedConversation.emit(conversation);
    }
  }
  /** */
  closeMessagePreview() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.debug('3 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    this.onCloseMessagePreview.emit();
  }
  // ========= begin:: event emitter function ============//


  /** */
  ngOnDestroy() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.debug('4 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    //this.unsubscribe();
  }

  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /** */
  unsubscribe() {
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.logger.debug('[LASTMESSAGE] this.subscriptions', this.subscriptions);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
