//import * as GlobalVars from '../../globals';
import * as _ from 'lodash';

//import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
//import { HttpClientModule, HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
//import {HttpModule} from '@angular/http';

// thought we needed to do it this way, but now it seems to work with the original line
//import { HttpModule } from '@angular/http';
//import { HttpClientModule } from '@angular/common/http';
//import { HttpClient } from '@angular/common/http';
//import { HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';

//do we need this first due to a bug/feature??  now in main app
//import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';


import { Injectable, Output } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpEventType } from '@angular/common/http';

import { Subscription } from 'rxjs/Subscription';

export enum FileQueueStatus {
    Pending,
    Success,
    Error,
    ErrorPrint,
    Progress
}

export class FileQueueObject {
    public file: any;
    public comment: string = "default comment 1";
    public status: FileQueueStatus = FileQueueStatus.Pending;
    public progress: number = 0;
    public request: Subscription = null;
    public response: HttpResponse<any> | HttpErrorResponse = null;
    public result: string = "pending...";

    constructor(file: any) {
        this.file = file;
    }


    // actions
    public upload = () => { /* set in service */ };
    public cancel = () => { /* set in service */ };
    public remove = () => { /* set in service */ };

    // statuses
    public isPending = () => this.status === FileQueueStatus.Pending;
    public isSuccess = () => this.status === FileQueueStatus.Success;
    public isError = () => this.status === FileQueueStatus.Error;
    public isErrorPrint = () => this.status === FileQueueStatus.ErrorPrint;
    public inProgress = () => this.status === FileQueueStatus.Progress;
    public isUploadable = () => this.status === FileQueueStatus.Pending || this.status === FileQueueStatus.Error;

}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
export class FileUploaderService {

    public url: string = `http://10.2.2.140:8000/file/upload/`;

    //private _boolean: inProcess  = false;

    private _queue: BehaviorSubject<FileQueueObject[]>;
    private _files: FileQueueObject[] = [];

    constructor(private http: HttpClient) {
        this._queue = <BehaviorSubject<FileQueueObject[]>> new BehaviorSubject(this._files);
    }

    // the queue

    public get queue() {
        return this._queue.asObservable();
    }

    // public events

    public onCompleteItem(queueObj: FileQueueObject, response: any): any {
        return {queueObj, response};
    }

    // public functions

    public addToQueue(data: any) {
        // add file to the queue
        _.each(data, (file: any) => this._addToQueue(file));

	// to ahead and just print, don't make them click again
        this.uploadAll();
	//var inputElement = <HTMLInputElement>document.getElementById("report-done");
        //inputElement.style.visiblity="visible";

    }
   
    public isQueueEmpty() {
       //return this._files == [];
       //return false;
       //console.log(this._files.length);
       if ( this._files.length == 0 ) {
          return true;
       } else {
            return false;
       }
    }



    public clearQueue() {
        // clear the queue
        this._files = [];
        //this._username ="";

        //<HTMLInputElement>document.getElementById("username").value = "" ;
	var usernameElement = <HTMLInputElement>document.getElementById("username");
	usernameElement.value = "";

        this._queue.next(this._files);
        // also clear text in input type file selector
        //document.getElementById("input-file-chooser").value = "";
        //<HTMLInputElement>document.getElementById("input-file-chooser").value = "";
	var inputElement = <HTMLInputElement>document.getElementById("input-file-chooser");
	inputElement.value = "";
    }

/* doesn't work since "upload" just kicks off uploads and immediately returned, - would have to loop through queue and look at status of each object to know when we're really done processing all
    public doneProcessing() {
       if ( this._files.length == 0 ) {
          return false;
       } 
       return !this.inProcess;
    }
*/

    public uploadAll() {

/* doesn't work since "upload" just kicks off uploads and immediately returned, - would have to loop through queue and look at status of each object to know when we're really done processing all
/*       this.inProcess=true; */

        // upload all except already successfull or in progress
        _.each(this._files, (queueObj: FileQueueObject) => {
            if (queueObj.isUploadable()) {
                this._upload(queueObj);
            }
        });
/* this.inProcess=false;*/
    }

    // private functions

    private _addToQueue(file: any) {
        const queueObj = new FileQueueObject(file);

        // set the individual object events
        queueObj.upload = () => this._upload(queueObj);
        queueObj.remove = () => this._removeFromQueue(queueObj);
        queueObj.cancel = () => this._cancel(queueObj);

        // push to the queue
        this._files.push(queueObj);
        this._queue.next(this._files);
    }

    private _removeFromQueue(queueObj: FileQueueObject) {
        _.remove(this._files, queueObj);
    }

    private _upload(queueObj: FileQueueObject) {
	var usernamePattern = /[0-9a-z]+/i ;
        //var usernameInput = <HTMLInputElement>document.getElementById("username").value;
        var usernameInputObj = <HTMLInputElement>document.getElementById("username");
        //var usernameInput=usernamePattern.match(usernameInputObj.value);
        var usernameInputMatch=usernameInputObj.value.match(usernamePattern);
        if ( usernameInputMatch ) {
        	var usernameInput=usernameInputObj.value.match(usernamePattern)[0];
	} else {
        	var usernameInput="web-print-user";
	}

        
       
        // create form data for file
        const form = new FormData();
        form.append('file', queueObj.file, queueObj.file.name);
        // NOTE: specifying a user makes the test pdf printer not work!  but normal printers seem OK, probably a permissions issue with where it puts the pdfs
        //form.append('username', "");
        //form.append('username', queueObj.username);
        //form.append('username', document.getElementById("username").value );

        form.append('username', usernameInput );
        form.append('password', "1234");
        form.append('something', "abcd");
        //form.append('printer', "PDF");
        var printerElement = <HTMLInputElement>document.getElementById("printer")
        form.append('printer', printerElement.value );

        // upload file and report progress
        const req = new HttpRequest('POST', this.url, form, {
            reportProgress: true,
        });

        // upload file and report progress
        queueObj.request = this.http.request(req).subscribe(
            (event: any) => {
                if (event.type === HttpEventType.UploadProgress) {
                    this._uploadProgress(queueObj, event);
                } else if (event instanceof HttpResponse) {
                    this._uploadComplete(queueObj, event);
                }
            },
            (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    this._uploadFailed(queueObj, err);
                } else {
                    // The backend returned an unsuccessful response code.
                    this._uploadFailed(queueObj, err);
                }
            }
        );

        return queueObj;
    }

    private _cancel(queueObj: FileQueueObject) {
        // update the FileQueueObject as cancelled
        queueObj.request.unsubscribe();
        queueObj.progress = 0;
        queueObj.status = FileQueueStatus.Pending;
        this._queue.next(this._files);
    }

    private _uploadProgress(queueObj: FileQueueObject, event: any) {
        // update the FileQueueObject with the current progress
        //const progress = Math.round(100 * event.loaded / event.total);
        // this displays file upload process - but we still have to print
       //   ideally we should submit a whole nother second request to have the file printed so we can know exactly what is going on
        const progress = Math.round(90 * event.loaded / event.total);
        queueObj.result = "processing...";
        queueObj.progress = progress;
        queueObj.status = FileQueueStatus.Progress;
        this._queue.next(this._files);
    }

    private _uploadComplete(queueObj: FileQueueObject, response: HttpResponse<any>) {
        // update the FileQueueObject as completed
        queueObj.progress = 100;
        queueObj.status = FileQueueStatus.Success;
        queueObj.response = response;
        this._queue.next(this._files);
        this.onCompleteItem(queueObj, response.body);
        //console.log(response.body.rc);
        //console.log(response.body.rs);
        if ( response.body.rc == 0 ) {
        	queueObj.status = FileQueueStatus.Success;
	} else {
        	queueObj.status = FileQueueStatus.ErrorPrint;
	}
        queueObj.result = response.body.rs;
    }

    private _uploadFailed(queueObj: FileQueueObject, response: HttpErrorResponse) {
        // update the FileQueueObject as errored
        queueObj.progress = 0;
        queueObj.result = "error";
        queueObj.status = FileQueueStatus.Error;
        queueObj.response = response;
        this._queue.next(this._files);
    }

}
