import { Component, OnInit, HostListener, isDevMode } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfigService } from '../../services/app-config.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../core/notify.service';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project-model';
// import brand from 'assets/brand/brand.json';
import { UserListService } from 'app/services/user-list.service';

import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { Alert } from 'selenium-webdriver';

type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  // companyLogoBlack_Url = brand.company_logo_black__url;
  // companyLogoAllWithe_Url = brand.company_logo_allwhite__url;
  // company_name = brand.company_name;
  // company_site_url = brand.company_site_url;
  companyLogoBlack_Url: string;
  companyLogoAllWithe_Url: string;
  company_name: string;
  company_site_url: string;


  showSpinnerInLoginBtn = false;

  hide_left_panel: boolean;
  bckgndImageSize = 60 + '%'

  public signin_errormsg = '';
  public signin_error_statusZero: boolean;
  display = 'none';

  userForm: FormGroup;
  projects: Project[];
  showSpinner = true;

  public_Key: string;
  SUP: boolean = true;
  isVisibleV1L: boolean = true;

  // newUser = false; // to toggle login or signup form
  // passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'pattern': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  constructor(
    private userListService: UserListService,

    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    private notify: NotifyService,
    public brandService: BrandService,
    private logger: LoggerService,
    private projectService: ProjectService
  ) {
    const brand = brandService.getBrand();

    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.companyLogoAllWithe_Url = brand['company_logo_allwhite__url'];
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];

  }

  ngOnInit() {
    this.getOSCODE();


    // this.redirectIfLogged();
    // this.widgetReInit()

    // this.logger.log('xxxx ', this.userForm)
    this.buildForm();
    this.getWindowWidthAndHeight();


  }

  redirectIfLogged() {

    const storedUser = localStorage.getItem('user')

    if (storedUser) {

      this.router.navigate(['/create-new-project']);
    }

  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (SIGN-IN) - public_Key keys', keys)

    keys.forEach(key => {
      if (key.includes("V1L")) {
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - key', key);
        let v1l = key.split(":");
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l key&value', v1l);

        if (v1l[1] === "F") {
          this.isVisibleV1L = false;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l isVisible', this.isVisibleV1L);
        } else {
          this.isVisibleV1L = true;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - v1l isVisible', this.isVisibleV1L);
        }
      }

      if (key.includes("SUP")) {
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - key', key);
        let sup = key.split(":");
        // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup key&value ', sup);

        if (sup[1] === "F") {
          this.SUP = false;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup is ', this.SUP);
        } else {
          this.SUP = true;
          // this.logger.log('PUBLIC-KEY (SIGN-IN) - sup is ', this.SUP);
        }
      }
      /* this generates bugs: the loop goes into the false until the "key" matches "V1L" */
      // else {
      //   this.isVisibleV1L = false;
      // }
    });

    if (!this.public_Key.includes("V1L")) {
      // this.logger.log('PUBLIC-KEY (SIGN-IN) - key.includes("V1L")', this.public_Key.includes("V1L"));
      this.isVisibleV1L = false;
    }

    if (!this.public_Key.includes("SUP")) {
      this.SUP = false;
      // this.logger.log('PUBLIC-KEY (SIGN-IN) - SUP is', this.SUP);
    }

  }


  getWindowWidthAndHeight() {
    this.logger.log('[SIGN-IN] - ACTUAL INNER WIDTH ', window.innerWidth);
    this.logger.log('[SIGN-IN] - ACTUAL INNER HEIGHT ', window.innerHeight);

    if (this.SUP === true) {
      if (window.innerHeight <= 680) {
        this.bckgndImageSize = 50 + '%'
      } else {
        this.bckgndImageSize = 60 + '%'
      }
    } else {
      this.bckgndImageSize = 80 + '%'
    }

    if (window.innerWidth < 992) {
      this.hide_left_panel = true;
      this.logger.log('[SIGN-IN]- ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      this.logger.log('[SIGN-IN] - ACTUAL INNER WIDTH hide_left_panel ', this.hide_left_panel);
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    const elemLeftPanelSignin = <HTMLElement>document.querySelector('.centered');
    // this.logger.log('SIGN-IN - ACTUAL INNER WIDTH elem Left Panel Signin div offsetTop ', elemLeftPanelSignin.getBoundingClientRect());
    // this.logger.log('SIGN-IN - NEW INNER WIDTH ', event.target.innerWidth);
    // this.logger.log('SIGN-IN - NEW INNER HEIGHT ', event.target.innerHeight);
    if (this.SUP === true) {
      if (event.target.innerHeight <= 680) {

        this.bckgndImageSize = 50 + '%'
      } else {
        this.bckgndImageSize = 60 + '%'
      }
    } else {
      this.bckgndImageSize = 80 + '%'
    }

    if (event.target.innerWidth < 992) {

      this.hide_left_panel = true;
      this.logger.log('[SIGN-IN] - NEW INNER WIDTH hide_left_panel ', this.hide_left_panel);
    } else {
      this.hide_left_panel = false;
      this.logger.log('[SIGN-IN] - NEW INNER WIDTH hide_left_panel ', this.hide_left_panel);
    }

  }




  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        // Validators.email,
        Validators.pattern(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/),
      ]],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(4000),
      ]],
    });

    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }

  signin() {

    console.log("Antes de entrar na auth")
    this.showSpinnerInLoginBtn = true;

    this.auth.showExpiredSessionPopup(true);

    const self = this;


    this.auth.signin(this.userForm.value['email'], this.userForm.value['password'], (error, user) => {

      this.userListService.loggedUser(user._id).subscribe((userLogged: any) => {


        console.log("Depois de entrar na auth")
        if (!error) {
          if (!isDevMode()) {
            if (window['analytics']) {
              try {
                window['analytics'].page("Auth Page, Signin", {

                });
              } catch (err) {
                this.logger.error('Signin page error', err);
              }

              try {
                window['analytics'].identify(user._id, {
                  name: user.firstname + ' ' + user.lastname,
                  email: user.email,
                  logins: 5,

                });
              } catch (err) {
                this.logger.error('track signin event error', err);
              }
              // Segments
              try {
                window['analytics'].track('Signed In', {
                  "username": user.firstname + ' ' + user.lastname,
                  "userId": user._id
                });
              } catch (err) {
                this.logger.error('track signin event error', err);
              }
            }
          }

          this.projectService.getProjects().subscribe((projects: any) => {
            this.showSpinner = false;

            this.projects = projects;

            if (this.projects && this.projects.length != 0) {

              this.projects.forEach(project => {


                if (project.id_project._id) {
                  const _id = project.id_project._id;

                  if (userLogged.email == "admin@tiledesk.com") {

                    this.router.navigate([`/projects`]);
                  }

                  if (userLogged.status == 100) {
                 
                    this.router.navigate([`/project/${_id}/home`]);
                  }
                  else {
                    this.router.navigate(['/login'])
                  }
                }
              });

            }
            else {

              this.router.navigate(['/create-new-project']);


            }
          });


          if (window && window['tiledesk_widget_login']) {
            window['tiledesk_widget_login']();
          }

        } else {
          this.showSpinnerInLoginBtn = false;

          if (error.status === 0) {

            this.display = 'block';

            this.notify.showToast(self.signin_errormsg, 4, 'report_problem')
          } else {
            this.display = 'block';

            this.signin_errormsg = error['error']['msg']


            this.notify.showToast(self.signin_errormsg, 4, 'report_problem')
          }
        }
      })
    });

  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      this.logger.log('[SIGN-IN] SIGNIN PAGE ', window['tiledesk'])

      window['tiledesk'].reInit();
      // alert('signin reinit');
    }
  }

  dismissAlert() {
    this.logger.log('[SIGN-IN] DISMISS ALERT CLICKED')
    this.display = 'none';
  }

  goToTileDeskDotCom() {
    // const url = 'http://tiledesk.com/'
    const url = this.company_site_url;
    window.open(url);
    // , '_blank'
  }

  goToResetPsw() {
    this.logger.log('[SIGN-IN] HAS CLICKED FORGOT PWS ');
    this.router.navigate(['forgotpsw']);
  }

  goToSignupPage() {
    this.router.navigate(['signup']);
  }


  goToTiledekV1() {
    const url = "https://support.tiledesk.com/dashboard/#/login";
    window.open(url);
  }


}
