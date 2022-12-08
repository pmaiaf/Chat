import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { convertColorToRGBA } from 'src/chat21-core/utils/utils';
import { trigger, style, animate, transition } from '@angular/animations';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-internal-frame',
  templateUrl: './conversation-internal-frame.component.html',
  styleUrls: ['./conversation-internal-frame.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('400ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
        // state('in', style({
        //   transform: 'translateX(100%)',
        //   opacity: 0
        // })),
        // state('out',   style({
        //   transform: 'translateX(0)',
        //   opacity: 1
        // })),
        // transition('in => out', animate('400ms', style({transform: 'translateX(0)', opacity: 1}))),
        // transition('out => in', animate('400ms', style({transform: 'translateX(100%)', opacity: 0})))
      ]
    )
    // trigger('enterAnimation', [
    //   state('open', style({
    //     opacity: 1,
    //   })),
    //   state('closed', style({
    //     opacity: 1,
    //   })),
    //   transition('closed => open', [
    //     animate('1s', style({transform: 'translateX(0)', opacity: 1}))
    //   ]),
    //   transition('open => closed', [
    //     animate('0.5s', style({transform: 'translateX(100%)', opacity: 0}))
    //   ]),
    // ]),
  ]
})
export class ConversationInternalFrameComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef;

  @Input() button: any;
  @Input() openExternalLinkButton: boolean;
  @Input() stylesMap: Map<string, string>
  @Input() translationMap: Map< string, string>;
  @Output() onOpenExternal = new EventEmitter<any>();
  @Output() onClose = new EventEmitter();

  public isOpen = 'open'; //used for animation state
  public url: any;
  public hideSpinner: boolean = false;
  private logger: LoggerService = LoggerInstance.getInstance();
  
  convertColorToRGBA = convertColorToRGBA;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if(this.button && this.button.link){
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.button.link);    
    }
  }
  
  ngAfterViewInit(){
    let doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    this.logger.debug('[INTERNALFRAME] ngAfterViewInit', doc, this.iframe.nativeElement.contentWindow, this.iframe.nativeElement.contentWindow.history)

  }

  ngOnDestroy(){
    this.url = null;
    this.hideSpinner = false;
  }

  returnClose(){
    this.isOpen = 'closed'  
    this.onClose.emit();  
  }

  returnOpenExternal(){
    this.onOpenExternal.emit(this.button)
  }

  onIframeLoaded(event){
    this.hideSpinner = true
  }

  onError(event){
    this.logger.error('[INTERNALFRAME] onError ', event)
  }

}
