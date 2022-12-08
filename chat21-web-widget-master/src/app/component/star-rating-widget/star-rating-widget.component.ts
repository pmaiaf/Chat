import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StarRatingWidgetService } from 'src/app/providers/star-rating-widget.service';
import { Globals } from 'src/app/utils/globals';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';


@Component({
  selector: 'chat-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.scss']
})
export class StarRatingWidgetComponent implements OnInit {

  // ========= begin:: Input/Output values ===========//
  @Input() recipientId: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onClosePage = new EventEmitter();
  @Output() onCloseRate = new EventEmitter();
  // @Input() recipientId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ===========//

  isConversationClosed: boolean;

  private rate: number;
  private logger: LoggerService = LoggerInstance.getInstance();
  mouseRate: number;
  step: number;
  message: string;

  // STRING (FOR TRANSLATION) PASSED IN THE TEMPLATE
  // CUSTOMER_SATISFACTION: string;
  // YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE: string;
  // DOWNLOAD_TRANSCRIPT: string;
  // BACK: string;
  // YOUR_RATING: string;
  // WRITE_YOUR_OPINION: string;
  // SUBMIT: string;
  // THANK_YOU_FOR_YOUR_EVALUATION: string;
  // YOUR_RATING_HAS_BEEN_RECEIVED: string;

  constructor(
    public starRatingWidgetService: StarRatingWidgetService,
    public g: Globals
  ) { }

  ngOnInit() {
    this.step = 0;
  }

  dowloadTranscript() {
    this.starRatingWidgetService._dowloadTranscript(this.recipientId);
  }

  openRate(e) {
    const that = this;
    this.rate = e; // parseInt(e.srcElement.value, 0);
    setTimeout(function () {
      that.step = 1;
    }, 300);
  }

  mouseOverRate(number) {
    const that = this;
    this.mouseRate = number;
  }

  nextStep() {
    this.step = this.step + 1;
  }

  prevStep() {
    this.step = this.step - 1;
  }

  sendRate() {
    this.message = (document.getElementById('chat21-message-rate-context') as HTMLInputElement).value;
    this.logger.debug('[STAR-RATING_COMP] sendRate!!!::', this.message);
    const that = this;
    // chiamo servizio invio segnalazione
    this.starRatingWidgetService.httpSendRate(this.rate, this.message).subscribe(
      response => {
        that.logger.debug('[STAR-RATING_COMP] OK sender', response);
        // pubblico var isWidgetActive
        that.nextStep();
      },
      errMsg => {
        // console.error('httpSendRate ERROR MESSAGE', errMsg);
        // windowContext.alert('MSG_GENERIC_SERVICE_ERROR');
        that.nextStep();
      },
      () => {
        //  that.logger.printDebug('API ERROR NESSUNO');
      }
    );
  }

  // closeRate() {
  //   this.starRatingWidgetService.setOsservable(false);
  //   this.step = 0;
  //   this.returnClosePage();
  // }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.step = 0;
  }

  // ========= begin:: ACTIONS ============//
  returnClosePage() {
    this.logger.debug('[STAR-RATING_COMP] closePage: ', this.mouseRate, this.step, this.rate);
    if(this.rate && this.rate !== 0 && this.step < 2){
      this.sendRate()
    }else{
      this.step = 0;
    }
    this.starRatingWidgetService.setOsservable(false);
    this.onClosePage.emit();
  }
  // ========= end:: ACTIONS ============//

}
