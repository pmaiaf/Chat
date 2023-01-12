import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from '../services/user-list.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
const swal = require('sweetalert');
type UserFields = 'email' | 'password' | 'firstname' | 'cnpj' | 'endereco' | 'bairro' | 'cidade' | 'estado' | 'n' | 'complemento' | 'responsavel'|  'emaildoresponsavel' | 'telefone' | 'nota' | 'terms';
type FormErrors = { [u in UserFields]: string };


@Component({
  selector: 'appdashboard-user-list-edit',
  templateUrl: '/user-list-edit.component.html',
  styleUrls: ['./user-list-edit.component.scss']
})
export class UserListEditComponent implements OnInit, OnDestroy {
  @ViewChild('editleadbtn', { static: false }) edit_lead_btn_ref: ElementRef;
  _id: string;
  firstname: string;
  email: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  n: string;
  complemento: string;
  responsavel: string
 emaildoresponsavel: string
  telefone: string;
  nota: string
  userForm: FormGroup;
  
  subscription: Subscription;


  EMAIL_IS_VALID = true;
  HAS_EDIT_FULLNAME = false;
  HAS_EDIT_EMAIL = false;

  editContactSuccessNoticationMsg: string;
  editContactErrorNoticationMsg: string;
  showSpinner = false;
  isChromeVerGreaterThan100: boolean;
  HIDE_GO_BACK_BTN: boolean;
  formErrors: FormErrors = {
    'email': '',
    'password': '',
    'firstname': '',
    'cnpj': '',
    'endereco': '',
    'bairro': '',
    'cidade': '',
    'estado': '',
    'n': '',
    'complemento': '',
    'responsavel': '',
   'emaildoresponsavel': '',
    'telefone':'',
    'nota':'',
    'terms': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
      'pattern': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
    'firstname': {
      'required': 'First Name is required.',
    },
    'terms': {
      'required': 'Please accept Terms and Conditions and Privacy Policy',
    },
  };
  constructor(
    private fb: FormBuilder,
    public location: Location,
    private route: ActivatedRoute,
    private userListService: UserListService,
    private notify: NotifyService,
    private translate: TranslateService,
    public auth: AuthService,
    private logger: LoggerService,
    private router: Router
   ) { }


  ngOnInit() {
    this.buildForm()
    this.translateEditContactSuccessMsg();
    this.translateEditContactErrorMsg();
    this.getRequesterIdParamAndThenGetContactById();
    this.getBrowserVersion()
    this.getCurrentRouteUrlToHideDisplayGoToBackBtn()
  }


  getCurrentRouteUrlToHideDisplayGoToBackBtn() {
    const currentUrl = this.router.url;

    if ((currentUrl.indexOf('/_edit') !== -1)) {
      // console.log('Hide go back btn')
      this.HIDE_GO_BACK_BTN = true
    } else if ((currentUrl.indexOf('/edit') !== -1)) {
      // console.log('display go back btn')
      this.HIDE_GO_BACK_BTN = false
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }
  // TRANSLATION
  translateEditContactSuccessMsg() {
    this.translate.get('EditContactSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editContactSuccessNoticationMsg = text;
        // this.logger.log('[CONTACT-EDIT] + + + EditContactSuccessNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateEditContactErrorMsg() {
    this.translate.get('EditContactErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editContactErrorNoticationMsg = text;
        // this.logger.log('[CONTACT-EDIT] + + + EditContactErrorNoticationMsg', text)
      });
  }


  getRequesterIdParamAndThenGetContactById() {
    this._id = this.route.snapshot.params['id'];
 

    if (this._id) {
      this.getUserById();
    }
  }

  getUserById() {
    this.userListService.getUserById(this._id)
      .subscribe((user: any) => {

        if (user) {

          this.firstname = user.firstname;
          this.email = user.email;
          this.cnpj = user.cnpj
          this.endereco = user.endereco;
          this.bairro = user.bairro;
          this.cidade = user.cidade;
          this.estado = user.estado;
          this.n = user.n;
          this.complemento = user.complemento
          this.responsavel = user.responsavel;
          this.emaildoresponsavel = user.emaildoresponsavel;
          this.telefone = user.telefone;
          this.nota = user.nota

        }
      }, (error) => {
        this.showSpinner = false;

        this.logger.error('[CONTACT-EDIT]  - GET LEAD BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        this.logger.log('[CONTACT-EDIT]  - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  
  }





  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        // Validators.email,
        Validators.pattern(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/),
      ]],
      'firstname': ['', [
        Validators.required,
      ]],
      'cnpj': ['', [
        Validators.required,
      ]],

      'endereco': ['', [
        Validators.required,
      ]],
      'bairro': ['', [
        Validators.required,
      ]],
      'cidade': ['', [
        Validators.required,
      ]],
      'estado': ['', [
        Validators.required,
      ]],
      'n': ['', [
        Validators.required,
      ]],
      'complemento': ['', [
        Validators.required,
      ]],
      'responsavel': ['', [
        Validators.required,
      ]],
      'emaildoresponsavel': ['', [
        Validators.required,
      ]],
      'telefone': ['', [
        Validators.required,
      ]],
      'nota': ['', [
        Validators.required,
      ]],
   
      'terms': ['',
        [
          Validators.required,
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
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password' || field === 'firstName' || field === 'cnpj' || field === 'endereco' || field === 'bairro' || field === 'cidade' || field === 'n' || field === 'complemento' || field === 'terms')) {
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




  editContact() {

    this.userListService.updateUser(
      this._id,
      this.userForm.value['email'],
      this.userForm.value['firstname'],
      this.userForm.value['cnpj'],
      this.userForm.value['endereco'],
      this.userForm.value['bairro'],
      this.userForm.value['cidade'],
      this.userForm.value['estado'],
      this.userForm.value['n'],
      this.userForm.value['complemento'],
      this.userForm.value['responsavel'],
      this.userForm.value['emaildoresponsavel'],
      this.userForm.value['telefone'],
      this.userForm.value['nota'])
      .subscribe((contact) => {
        swal('Empresa editada com sucesso' + "!", "Aperte na seta acima para voltar", {
          icon: "success",
        })
      }, (error) => {
        swal('Houve um erro ao atualizar a empresa!', 'Tente novamente.', {
          icon: "error",
        });
      }, () => {
        

      });
  }


  emailChange(event) {
    this.logger.log('[CONTACT-EDIT] - EDITING EMAIL ', event);
    this.logger.log('[CONTACT-EDIT] - EDITING EMAIL length ', event.length);


    this.EMAIL_IS_VALID = this.validateEmail(event)
    this.logger.log('[CONTACT-EDIT] - EMAIL IS VALID ', this.EMAIL_IS_VALID);

    if (event.length === 0) {
      this.EMAIL_IS_VALID = true;
    }
  }

  validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }


  goBack() {
    this.location.back();

  }

}
