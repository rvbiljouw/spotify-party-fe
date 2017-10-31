import {Component,} from '@angular/core';
import {ToastyConfig} from 'ng2-toasty';
import {Router,} from '@angular/router';
import {ObservableMedia} from '@angular/flex-layout';
import {LoginService} from './services/LoginService';
import {PartyService} from "./services/PartyService";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private toastyConfig: ToastyConfig,
              private media: ObservableMedia,
              private router: Router,
              private loginService: LoginService,
              private partyService: PartyService,
              private domSanitizer: DomSanitizer) {
    toastyConfig.theme = 'material';
    toastyConfig.position = 'top-center';
    AppComponent.refresh();
  }

  static refresh() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('dark-theme');
  }

}
