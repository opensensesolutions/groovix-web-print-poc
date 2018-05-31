import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FileQueueObject, FileUploaderService } from '../services/file-uploader.service';

import { Observable } from 'rxjs/Rx';

//import { HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'file-uploader, [file-uploader]',
    templateUrl: 'file-uploader.component.html',
    providers: [FileUploaderService],
    //imports:[HttpClient, HttpModule],
    //providers: [HttpClientModule],
  //imports: [
  // HttpClientModule,
  //],

})









export class FileUploaderComponent implements OnInit {

    @Output() public onCompleteItem = new EventEmitter();

    @ViewChild('fileInput') public fileInput;
    public queue: Observable<any[]>;

    constructor(public uploader: FileUploaderService) { }

    public ngOnInit() {
        this.queue = this.uploader.queue;
        this.uploader.onCompleteItem = this.completeItem;
    }

    public completeItem = (item: FileQueueObject, response: any) => {
        this.onCompleteItem.emit({item, response});
    }

    public addToQueue() {
        let fileBrowser = this.fileInput.nativeElement;
        this.uploader.addToQueue(fileBrowser.files);
    }
}
