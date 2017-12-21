import {Component,} from '@angular/core';
import {Router,} from '@angular/router';
import {LoginService} from './services/LoginService';
import {PartyService} from "./services/PartyService";
import {DomSanitizer} from "@angular/platform-browser";
import {ObservableMedia} from "@angular/flex-layout";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  notificationOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    theClass: "notification",
    showProgressBar: true,
    pauseOnHover: true,
    maxStack: 3,
    animate: "fromRight",
    clickToClose: true
  };

  constructor(private media: ObservableMedia,
              private router: Router,
              private loginService: LoginService,
              private partyService: PartyService,
              private domSanitizer: DomSanitizer) {
    AppComponent.refresh();
  }

  static refresh() {
    const body = document.getElementsByTagName('body')[0];
    // body.classList.add('dark-theme');
  }

}
