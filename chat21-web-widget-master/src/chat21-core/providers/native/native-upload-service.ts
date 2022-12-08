import { UploadService } from '../abstract/upload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadModel } from '../../models/upload';
import { AppStorageService } from '../abstract/app-storage.service';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class NativeUploadService extends UploadService {

    BSStateUpload: BehaviorSubject<any> = new BehaviorSubject<any>(null)

    private tiledeskToken: string;
    private URL_TILEDESK_IMAGES: string;
    private URL_TILEDESK_FILE: string;
    private logger: LoggerService = LoggerInstance.getInstance()

    constructor(
        public http: HttpClient,
        public appStorage: AppStorageService
    ) {
        super();
    }

    initialize(): void {
        this.logger.debug('[NATIVE UPLOAD] initialize')
        this.URL_TILEDESK_FILE = this.getBaseUrl() + 'files'
        this.URL_TILEDESK_IMAGES = this.getBaseUrl() + 'images'
        this.tiledeskToken = this.appStorage.getItem('tiledeskToken')
    }


    upload(userId: string, upload: UploadModel): Promise<any>  {
        this.logger.debug('[NATIVE UPLOAD] - upload new image/file ... upload', upload)
        const headers = new HttpHeaders({
            Authorization: this.tiledeskToken,
            //'Content-Type': 'multipart/form-data',
        });
        const requestOptions = { headers: headers };
        const formData = new FormData();
        formData.append('file', upload.file);

        const that = this;
        if ((upload.file.type.startsWith('image') && (!upload.file.type.includes('svg')))) {
            this.logger.debug('[NATIVE UPLOAD] - upload new image')
            //USE IMAGE API
            const url = this.URL_TILEDESK_IMAGES + '/users'
            return new Promise((resolve, reject) => {
                that.http.post(url, formData, requestOptions).subscribe(data => {
                    const downloadURL = this.URL_TILEDESK_IMAGES + '?path=' + data['filename'];
                    resolve(downloadURL)
                    // that.BSStateUpload.next({upload: upload});
                }, (error) => {
                    reject(error)
                });
            });
        } else {
            this.logger.debug('[NATIVE UPLOAD] - upload new file')
            //USE FILE API
            const url = this.URL_TILEDESK_FILE + '/users'
            return new Promise((resolve, reject) => {
                that.http.post(url, formData, requestOptions).subscribe(data => {
                    let downloadURL = this.URL_TILEDESK_FILE + '/download' + '?path=' + encodeURI(data['filename']);
                    if(upload.file.type.includes('pdf')){
                        downloadURL = this.URL_TILEDESK_FILE + '?path=' + encodeURI(data['filename']);
                    }
                    resolve(downloadURL)
                    // that.BSStateUpload.next({upload: upload});
                }, (error) => {
                    this.logger.error('[NATIVE UPLOAD] - ERROR upload new file ', error)
                    reject(error)
                });
            });
        }
        
    }
}