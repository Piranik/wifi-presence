import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ClientListComponent } from './clientList.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ ClientListComponent ],
  bootstrap:    [ ClientListComponent ]
})
export class AppModule { }
