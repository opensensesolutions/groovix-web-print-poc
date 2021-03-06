import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
// need this and in the imports: below or we get Error: StaticInjectorError(AppModule)[FileUploaderService -> HttpClient]: 
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    FileUploaderComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
