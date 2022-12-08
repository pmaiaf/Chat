import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppStorageService } from '../abstract/app-storage.service';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';

@Injectable()
export class TiledeskRequestsService {

  // private persistence: string;
  public SERVER_BASE_URL: string;

  // private
  private URL_TILEDESK_CLOSE_REQUEST: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(
    public http: HttpClient,
    public appStorage: AppStorageService
  ) { }

  initialize(serverBaseUrl: string, projectId: string,) {
    this.logger.debug('[TILEDESK-REQUEST-SERV] - initialize', projectId);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.URL_TILEDESK_CLOSE_REQUEST = this.SERVER_BASE_URL + projectId +'/requests/';
  }


  closeSupportGroup(supportgroupid: string): Promise<string> {
    this.tiledeskToken = this.appStorage.getItem('tiledeskToken')
    this.logger.debug('[TILEDESK-REQUEST-SERV] - closeSupportGroup', supportgroupid);
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      Authorization: this.tiledeskToken,
    });
    const requestOptions = { headers: headers };
    const that = this;
    const url = this.URL_TILEDESK_CLOSE_REQUEST + supportgroupid + '/closeg'
    return new Promise((resolve, reject) => {
      this.logger.debug('[TILEDESK-REQUEST-SERV] - closeSupportGroup URLLLL', url, requestOptions);
      this.http.put(url, null, requestOptions).subscribe((data) => {
        this.logger.debug('[TILEDESK-REQUEST-SERV] - closeSupportGroup response', data);
        resolve('closed')
      }, (error) => {
        reject(error)
      });
    });
  }
}
