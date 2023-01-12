import { AppConfigService } from '../services/app-config.service';
// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ContactsService } from '../services/contacts.service';
import { UserListService } from '../services/user-list.service';

import { User } from '../models/user-model';

import { Contact } from '../models/contact-model';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { UsersService } from '../services/users.service';
import { TranslateService, TranslateLoader, TranslateModule, } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../services/logger/logger.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Subject } from 'rxjs';

declare const $: any;
const swal = require('sweetalert');

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})





export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {



  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];




  users: User[];


  prjct_name: string;
  prjct_profile_name: string;
  profile_name: string;
  profile_name_for_segment: string;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;

  fullText: string;
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  showSpinner: boolean;
  fullTextValue: string;
  queryString: string;
  projectId: string;


  fullName: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  displayDeleteModal = 'none';

  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  fullName_toDelete: string;

  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  fullName_toUpdate: string;
  CONTACT_IS_VERIFIED = false;
  showAdvancedSearchOption = false;

  selectedContactEmail: string;
  selectedContactEmailValue: string;
  IS_CURRENT_USER_AGENT: boolean;
  IS_CURRENT_USER_OWNER: boolean;
  firstnameCurrentValue: string;
  lastnameCurrentValue: string;
  deleteLeadSuccessNoticationMsg: string;
  deleteLeadErrorNoticationMsg: string;


  subscription: Subscription;

  CURRENT_USER: any;
  CURRENT_USER_ID: string


  subscription_is_active: any;
  subscription_end_date: Date;
  trial_expired: boolean;
  browserLang: string;
  hasClickedTrashed: boolean = false;
  trashedContanctCount: any;
  user: any;
  searchInYourContactsPlaceholder: string;
  searchInTrashPlaceholder: string;
  searchPlaceholder: string;
  areYouSure: string;
  contactWillBePermanentlyDeleted: string;
  errorDeleting: string;
  done_msg: string;
  pleaseTryAgain: string;
  contactWasSuccessfullyDeleted: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  deleteContact_msg: string;
  youCannotDeleteThisContact: string
  contactHasBeenMovedToTheTrash: string;
  moveContactToTrash_msg: string;
  moveToTrash_msg: string;
  countOfActiveContacts: number;

  CHAT_BASE_URL: string;
  id_request: string;
  payIsVisible: boolean;
  public_Key: any;
  isChromeVerGreaterThan100: boolean;
  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService,
    private userListService: UserListService,
    private translate: TranslateService,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }



  ngOnInit() {

    this.getTranslation();
    this.getOSCODE();
    this.getAllUsers();


    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;

    // this.getTrashedContactsCount();

    // ----------------------------------------
    //  Bootstrap 3.0 - Keep Dropdown Open
    //  http://jsfiddle.net/KyleMit/ZS4L7/
    // ----------------------------------------
    $('.dropdown.keep-open').on({
      "shown.bs.dropdown": function () { this.closable = false; },
      "click": function () { this.closable = true; },
      "hide.bs.dropdown": function () { return this.closable; }
    });
    this.getBrowserVersion();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("PAY")) {
        this.logger.log('[CONTACTS-COMP] PUBLIC-KEY - key', key);
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
    }
  }


  getTranslation() {
    this.translate.get('DeleteLeadSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.deleteLeadSuccessNoticationMsg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadSuccessNoticationMsg', text)
      });

    this.translate.get('DeleteLeadErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteLeadErrorNoticationMsg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadErrorNoticationMsg', text)
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSure = text;
        // this.logger.log('[CONTACTS-COMP] + + + areYouSure', text)
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });

    this.translate.get('TheContactWillBePermanentlyDeleted')
      .subscribe((text: string) => {
        this.contactWillBePermanentlyDeleted = text;
      });

    this.translate.get('ErrorDeleting')
      .subscribe((text: string) => {
        this.errorDeleting = text;
      });

    this.translate.get('PleaseTryAgain')
      .subscribe((text: string) => {
        this.pleaseTryAgain = text;
      });


    this.translate.get('TheContactWasSuccessfullyDeleted')
      .subscribe((text: string) => {
        this.contactWasSuccessfullyDeleted = text;
      });

    this.translate.get('DeleteContact')
      .subscribe((text: string) => {
        this.deleteContact_msg = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteContact_msg', this.deleteContact_msg)
      });

    this.translate.get('YouCannotDeleteThisContact')
      .subscribe((text: string) => {
        this.youCannotDeleteThisContact = text;
      });

    this.translate.get('TheContactHasBeenMovedToTheTrash')
      .subscribe((text: string) => {
        this.contactHasBeenMovedToTheTrash = text;
      });

    this.translate.get('MoveToTrash')
      .subscribe((text: string) => {
        this.moveToTrash_msg = text;
      });

    this.translatePlaceholder();

  }

  translatePlaceholder() {
    this.translate.get('SearchYourContacts')
      .subscribe((text: string) => {
        this.searchInYourContactsPlaceholder = text;
        // this.logger.log('[CONTACTS-COMP] + + + translatePlaceholder SearchYourContacts', text)
      });


    this.translate.get('SearchInTrash')
      .subscribe((text: string) => {
        this.searchInTrashPlaceholder = text;
        // this.logger.log('[CONTACTS-COMP] + + + DeleteLeadSuccessNoticationMsg', text)
      });
  }

  ngAfterViewInit() {
    this.getElemSearchField();
  }

  getElemSearchField() {
    // const elemSearchField =   (<HTMLInputElement>document.getElementById('#search_field'));
    const elemSearchField = <HTMLInputElement>document.querySelector('#search_field');
    this.logger.log('[CONTACTS-COMP] GET elemSearchField', elemSearchField)
    //  elemSearchField.innerHTML = 'res';
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
}


  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }







  decreasePageNumber() {
    const decreasePageNumberBtn = <HTMLElement>document.querySelector('.decrease-page-number-btn');
    decreasePageNumberBtn.blur()

    this.pageNo -= 1;

    this.logger.log('[CONTACTS-COMP] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getAllUsers();

  }

  increasePageNumber() {
    const increasePageNumberBtn = <HTMLElement>document.querySelector('.increase-page-number-btn');
    increasePageNumberBtn.blur()

    this.pageNo += 1;
    this.logger.log('[CONTACTS-COMP]  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getAllUsers();

  }

  search() {


    // ---------------------------------------------------------------------
    // Programmatically close Dropdown Menu
    // ---------------------------------------------------------------------
    const elemInputGroupDropdown = <HTMLInputElement>document.querySelector('#dropdown_input_group_btn');
    this.logger.log('[CONTACTS-COMP] - elemInputGroupDropdown ', elemInputGroupDropdown);

    const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
    this.logger.log('[CONTACTS-COMP] - elemBtnDropdown ', elemBtnDropdown);

    const isOpen = elemBtnDropdown.getAttribute("aria-expanded")
    this.logger.log('[CONTACTS-COMP] - elemBtnDropdown isOpen ', isOpen);

    if (isOpen === 'true') {
      elemInputGroupDropdown.classList.remove('open');
      elemBtnDropdown.setAttribute("aria-expanded", 'false');
    }



    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    const searchBtn = <HTMLElement>document.querySelector('.searchbtn');
    this.logger.log('[CONTACTS-COMP] - SEARCH BTN ', searchBtn)
    searchBtn.blur();

    this.pageNo = 0

    if (this.fullText) {

      this.logger.log('[CONTACTS-COMP] - SEARCH FULLTEXT CONTAINS email: ', this.fullText.includes('email:'));
      // this.logger.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS index of email: ', this.fullText.substring(0, this.fullText.indexOf('email:')));

      // if (this.fullText.includes('email:') === true) {

      //   const cleanedFullText = this.fullText.substring(0, this.fullText.indexOf('email:'))
      //   this.logger.log('!!!! CONTACTS - FULLTEXT - cleanedFullText', cleanedFullText);
      //   this.fullText = cleanedFullText;
      // }


      this.fullTextValue = this.fullText;


      this.logger.log('[CONTACTS-COMP] - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      this.logger.log('[CONTACTS-COMP] - SEARCH FOR FULL TEXT ', this.fullText);
      this.fullTextValue = ''

      if (this.selectedContactEmail) {
        this.searchInYourContactsPlaceholder = "ADVANCED SEARCH"
      }
    }

    if (this.selectedContactEmail) {
      this.selectedContactEmailValue = this.selectedContactEmail;
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactEmail ', this.selectedContactEmailValue);
    } else {
      this.logger.log('[CONTACTS-COMP]  - SEARCH FOR selectedContactEmail ', this.selectedContactEmailValue);
      this.selectedContactEmailValue = ''
    }

    this.queryString = 'full_text=' + this.fullTextValue + '&email=' + this.selectedContactEmailValue;
    this.logger.log('[CONTACTS-COMP] - SEARCH - QUERY STRING ', this.queryString);

    this.getAllUsers();



    // let search_params_to_dislay_in_fulltext = ''
    // search_params_to_dislay_in_fulltext = this.fullTextValue
    // if (this.selectedContactEmailValue) {

    //   search_params_to_dislay_in_fulltext = this.fullTextValue + ' email:' + this.selectedContactEmailValue
    // }

    // this.fullText = search_params_to_dislay_in_fulltext
  }

  // Not used
  onfocusFullTextSearchField(ev) {

    this.logger.log('[CONTACTS-COMP] + + + translatePlaceholder searchInYourContactsPlaceholder', this.searchInYourContactsPlaceholder)

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     this.logger.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }
    // this.logger.log('!!!! CONTACTS - onfocusFullTextSearchField event ', ev);
    // ev.preventDefault();
    // ev.stopPropagation();

    this.logger.log('[CONTACTS-COMP] - onFocusSearchField fullText ', this.fullText);
    this.logger.log('[CONTACTS-COMP] - onFocusSearchField selectedContactEmail ', this.selectedContactEmail);

    // if (this.fullText.includes('email:') === true) {
    //   this.logger.log('!!!! CONTACTS - SEARCH FULLTEXT CONTAINS replace this: ', 'email:' + this.selectedContactEmail);
    //   const cleanedFullText = this.fullText.replace('email:' + this.selectedContactEmail, '');
    //   this.logger.log('!!!! CONTACTS - FULLTEXT after replace - cleanedFullText', cleanedFullText);
    //   this.fullText = cleanedFullText;
    //   // ---------------------------------------------------------------------
    //   // Programmatically open Dropdown Menu
    //   // ---------------------------------------------------------------------

    if (this.selectedContactEmail) {
      const elemBtnDropdown = <HTMLInputElement>document.querySelector('#dropdown_btn');
      this.logger.log('[CONTACTS-COMP] - elemBtnDropdown ', elemBtnDropdown);

      const isOpen = elemBtnDropdown.getAttribute("aria-expanded");
      this.logger.log('[CONTACTS-COMP] - elemBtnDropdown isOpen ', isOpen);

      if (isOpen === 'false') {
        elemBtnDropdown.click()
        elemBtnDropdown.setAttribute("aria-expanded", 'true')
        elemBtnDropdown.focus();
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  }





  
  clearFullText() {

    if (this.searchInYourContactsPlaceholder === "ADVANCED SEARCH") {

      this.translatePlaceholder()
      // this.translate.get('SearchYourContacts')
      //   .subscribe((text: string) => {
      //     this.searchInYourContactsPlaceholder = text;
      //     this.logger.log('+ + + translatePlaceholder SearchYourContacts', text)
      //   });
    }

    this.pageNo = 0
    this.fullText = '';

    if (this.selectedContactEmail) {
      this.selectedContactEmail = '';
    }


    this.queryString = '';
    this.logger.log('[CONTACTS-COMP] - CLEAR SEARCH - QUERY STRING ', this.queryString);

    this.getAllUsers();
  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    this.logger.log('[CONTACTS-COMP] - CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.getAllUsers();
  }



  getAllUsers() {

    this.userListService.getUsers().subscribe((users: any) => {

      this.showSpinner = false;
      if (users) {
        this.users = users;
        this.users.forEach(userInd => {
          if (userInd._id) {
            const usr: User = {
              _id: userInd._id,
              email: userInd.email,
              firstname: userInd.firstname
            }

            localStorage.setItem(userInd.email, JSON.stringify(usr));
          }
        });
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[Users-COMP] - GET LEADS - ERROR  ', error)
    }, () => {
      this.logger.log('[PROJECTS] - GET PROJECTS * COMPLETE *')
    });
  }












  // --------------------------------------------------
  // TRASH FOREVER METHODS
  // --------------------------------------------------
  openTrashedContact() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.hasClickedTrashed = true
    this.getAllUsers();
  }


  closeTrashContacts() {
    this.pageNo = 0
    this.fullText = '';
    this.selectedContactEmail = '';
    this.queryString = '';
    this.hasClickedTrashed = false;
    this.getAllUsers();
  }

 

  // --------------------------------------------------
  // MOVE TO TRASH
  // --------------------------------------------------
  moveUserToTrash(contactid: string, fullName: string) {

    if (fullName) {
      this.translate.get('MoveTheContactToTheTrash', { contactname: fullName }).subscribe((text: string) => {
        this.moveContactToTrash_msg = text
    
      })
    } else {
      this.translate.get('MoveTheContactToTheTrashNoName').subscribe((text: string) => {
        this.moveContactToTrash_msg = text
      })
    }

    swal({
      title: this.moveToTrash_msg,
      text: this.moveContactToTrash_msg,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.userListService.deleteUser(contactid).subscribe((res: any) => {

          }, (error) => {
            console.log(error)
            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });
          }, () => {
            swal(this.done_msg + "!", this.contactHasBeenMovedToTheTrash, {
              icon: "success",
            }).then((okpressed) => {
              this.getAllUsers();
            });
          });
        }
      });
  }


  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }



  restore_contact(contactid: string) {
    this.userListService.restoreUser(contactid)
      .subscribe((lead: any) => {
        console.log(lead)

      }, (error) => {
        console.log(error)
      }, () => {
        this.getAllUsers();
        // this.notify.showNotification(this.deleteLeadSuccessNoticationMsg, 2, 'done');
      });

  }




  exportContactsToCsv() {
    this.contactsService.exportLeadToCsv(this.queryString, 0, this.hasClickedTrashed).subscribe((leads_object: any) => {
      this.logger.log('!!!! CONTACTS - EXPORT CONTACT TO CSV RESPONSE ', leads_object);

      // this.logger.log('!!!! CONTACTS - CONTACTS LIST ', this.contacts);
      if (leads_object) {
        this.logger.log('[CONTACTS-COMP] - EXPORT CONTACTS TO CSV RESPONSE', leads_object);
        this.downloadFile(leads_object);
      }
    }, (error) => {
      this.logger.error('[CONTACTS-COMP]- EXPORT CONTACT TO CSV - ERROR  ', error);
    }, () => {
      this.logger.log('[CONTACTS-COMP] - EXPORT CONTACT TO CSV * COMPLETE *');
    });

    // if (this.payIsVisible) {
    //   if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //     this.notify.openDataExportNotAvailable()
    //   } else {
    //     const exportToCsvBtn = <HTMLElement>document.querySelector('.export-to-csv-btn');
    //     this.logger.log('[CONTACTS-COMP] - EXPORT TO CSV BTN', exportToCsvBtn)
    //     exportToCsvBtn.blur()

    //     this.contactsService.exportLeadToCsv(this.queryString, 0, this.hasClickedTrashed).subscribe((leads_object: any) => {
    //       this.logger.log('!!!! CONTACTS - EXPORT CONTACT TO CSV RESPONSE ', leads_object);

    //       // this.logger.log('!!!! CONTACTS - CONTACTS LIST ', this.contacts);
    //       if (leads_object) {
    //         this.logger.log('[CONTACTS-COMP] - EXPORT CONTACTS TO CSV RESPONSE', leads_object);
    //         this.downloadFile(leads_object);
    //       }
    //     }, (error) => {
    //       this.logger.error('[CONTACTS-COMP]- EXPORT CONTACT TO CSV - ERROR  ', error);
    //     }, () => {
    //       this.logger.log('[CONTACTS-COMP] - EXPORT CONTACT TO CSV * COMPLETE *');
    //     });
    //   }
    // } else {
    //   this.notify._displayContactUsModal(true, 'upgrade_plan');
    // }
  }

  downloadFile(data) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'contacts.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }



  displayHideFooterPagination(contacts_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (contacts_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-COMP] contacts_count ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[CONTACTS-COMP] contacts_count ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }



  chatWithAgent(contact) {
    this.logger.log("[CONTACTS-COMP] CHAT WITH AGENT > CONTACT : ", contact);


    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + contact._id + '&recipientFullname=' + contact.fullname;
    const url = this.CHAT_BASE_URL + '#/conversation-detail/' + contact._id + '/' + contact.fullname + '/new'
    this.logger.log("[CONTACTS-COMP] CHAT WITH AGENT -> CHAT URL ", url);
    window.open(url, '_blank');
  }




  goToUserPanel(id) {

    this.router.navigate(['user-list/' + 'painel/' + id]);
  }
  goToEditUser(id) {

    this.router.navigate(['user-list/' + 'edit/' + id]);
  }
  goToSignUp(){
    this.router.navigate(['user-list/' + 'signup']);
  }


  toggleAdvancedOption() {
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
  }



  // -----------------=============== NOTE: THE CODE BELOW IS NOT USED ===============-----------------
  /**
   * ADD CONTACT  */
  // createContact() {
  //   this.logger.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
  //   this.contactsService.addMongoDbContacts(this.fullName).subscribe((contact) => {
  //     this.logger.log('POST DATA ', contact);
  //     this.fullName = '';
  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getContacts();
  //     this.ngOnInit();
  //   }, (error) => {

  //     this.logger.log('POST REQUEST ERROR ', error);

  //   }, () => {
  //     this.logger.log('POST REQUEST * COMPLETE *');
  //   });

  // }

}
