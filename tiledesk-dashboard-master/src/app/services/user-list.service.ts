// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user-model';
import { AuthService } from '../core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { map } from 'rxjs/operators';
@Injectable()
export class UserListService {

  SERVER_BASE_PATH: string;
  UserList_URL: string;
  TOKEN: string;
  user: any;
  currentUserID: string;
  projectID: string;

  public myAvailabilityCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public hasCreatedNewProject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(

    public auth: AuthService,
    public _httpclient: HttpClient,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getAppConfigAndBuildUrl();
    this.getCurrentProject();

  }

  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;

    this.UserList_URL = this.SERVER_BASE_PATH + 'user-list/';

  }



  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        // this.logger.log('[PROJECT-SERV] project ID from AUTH service subscription ', this.projectID)
      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {

      this.currentUserID = this.user._id
      this.TOKEN = this.user.token
      // this.logger.log('[PROJECT-SERV] user is signed in');
    } else {
      this.logger.log('[PROJECT-SERV] - No user is signed in');
    }
  }

  // ------------------------------------------------------
  // READ (GET ALL PROJECTS)
  // ------------------------------------------------------





  public getUsers(): Observable<User[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.UserList_URL;

    return this._httpclient
      .get<User[]>(url, httpOptions)

  }

// ---------------------------------------------
  // @ Delete lead (move to trash)
  // ---------------------------------------------
  /**
    * DELETE PROJECT
    * @param val 
    */
  public getData(val): Observable<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', 
       'Acess-Control- Allow-Origin': '*',
       "Acess-Control-Allow-Methods": "GET",
       "Acess-Control-Allor-Headers": "Content-Type, Authorization"
    })
    };

    return this._httpclient
      .get(`https://receitaws.com.br/v1/cnpj/${val}`, httpOptions)

  }

  // ---------------------------------------------
  // @ Delete lead (move to trash)
  // ---------------------------------------------
  /**
    * DELETE PROJECT
    * @param id 
    */
  public deleteUser(id: string)  {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.UserList_URL + id;


    return this._httpclient
      .delete(url, httpOptions)
  }

  // ---------------------------------------------
  // @ Delete lead from db
  // ---------------------------------------------


  /**
    * DeleUserForever
    * @param id 
    */
  public deleteUserForever(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',      })
    };

    const url = this.UserList_URL + 'forever/' + id;

    return this._httpclient
      .delete(url, httpOptions)
  }


  getLeadsActive(): Observable<User[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    const url = this.UserList_URL + 'active';
    this.logger.log('[CONTACTS-SERV] - GET ACIVE CONTACTS URL', url);

    return this._httpclient
      .get<User[]>(url, httpOptions)
  }

  // -------------------------------
  // @ GET LEADS - TRASHED
  // -------------------------------
  getLeadsTrashed(): Observable<User[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    const url = this.UserList_URL + '/leads?page=0&status=1000';
    this.logger.log('[CONTACTS-SERV] - GET TRASHED CONTACTS URL', url);

    return this._httpclient
      .get<User[]>(url, httpOptions)
  }



  public getRequestsByRequesterId(requesterid: string, pagenumber: number) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    const url = this.SERVER_BASE_PATH + '/requests?lead=' + requesterid + '&page=' + pagenumber + '&status=all' + '&no_populate=true';

    return this._httpclient
      .get(url, httpOptions)
      .pipe(
        map(
          (response) => {
            const data = response
            if (data['requests']) {
              data['requests'].forEach(request => {

                if (request.snapshot && request.snapshot.department) {

                  request.department = request['snapshot']["department"]

                } else if (request.department) {
                  request.department = request.department
                }

              })
            }
            return data;
          })
      )
  }







  // ---------------------------------------------
  // @ Restore lead
  // ---------------------------------------------


  /**
   * RestoreUser
   * @param id 
   */
  public restoreUser(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.UserList_URL + '/restore/' + id;

    const body = { 'status': 100 };

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }



  // ---------------------------------------------
  // @ getUserById 
  // ---------------------------------------------
  /**
    * getUserById 
    * @param id 
    */

  public getUserById(id: string): Observable<User[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.UserList_URL + id;

    return this._httpclient
      .get<User[]>(url, httpOptions)
  }









  // ---------------------------------------------
  // @ Update lead Fullname
  // ---------------------------------------------
  public updateLeadFullname(id: string, firstname: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };
    const url = this.UserList_URL + 'edit/' + id;

    const body = { 'firstname': firstname };
    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Update lead Email
  // ---------------------------------------------
  public updateLeadEmail(id: string, email: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };
    const url = this.UserList_URL + 'edit/' + id;

    const body = {
      'email': email
    };

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }



  // ---------------------------------------------
  // @ UpdateUser 
  // ---------------------------------------------
  /**
    * UpdateUser
    * @param id 
    * @param email
    * @param firstname
    * @param cnpj
    * @param endereco
    * @param bairro
    * @param cidade
    * @param estado
    * @param n 
    * @param complemento
    *  @param responsavel
    * @param emaildoresponsavel
    * @param telefone 
    * @param nota
    */
  public updateUser(
    id: string,
    email: string,
    firstname: string,
    cnpj: string,
    endereco: string,
    bairro: string,
    cidade: string,
    estado: string,
    n: string,
    complemento: string,
    responsavel: string,
    emaildoresponsavel: string,
    telefone: string,
    nota: string,


  ) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
 console.log(email)
 console.log(firstname)
    const url = this.UserList_URL + 'edit/' + id;
 
    const body = {
      'email': email,
      'firstname': firstname,
      'cnpj': cnpj,
      'endereco': endereco,
      'bairro': bairro,
      'cidade': cidade,
      'estado': estado,
      'n': n,
      'complemento': complemento,
      'responsavel': responsavel,
      'emaildoresponsavel': emaildoresponsavel,
      'telefone': telefone,
      'nota': nota,

    };

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }


  /**
   * RestoreUser
   * @param id 
   */
  public loggedUser(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.UserList_URL + 'painel/' + id;



    return this._httpclient
      .put(url, httpOptions)
  }


  


}
