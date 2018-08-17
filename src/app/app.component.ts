import {Component, OnInit,} from '@angular/core';
import {ActivatedRoute, Router,} from '@angular/router';
import {LoginService} from './services/LoginService';
import {PartyService} from "./services/PartyService";
import {DomSanitizer} from "@angular/platform-browser";
import {ObservableMedia} from "@angular/flex-layout";
import {WebSocketService} from "./services/WebSocketService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  notificationOptions = {
    position: ["top", "center"],
    timeOut: 3000,
    lastOnBottom: false,
    theClass: "notification",
    showProgressBar: true,
    pauseOnHover: true,
    maxStack: 3,
    animate: "fade",
    clickToClose: true,
  };

  static darkTheme: boolean;

  constructor(private media: ObservableMedia,
              private router: Router,
              private loginService: LoginService,
              private partyService: PartyService,
              private socketService: WebSocketService,
              private domSanitizer: DomSanitizer,
              private route: ActivatedRoute) {
    socketService.init();
    AppComponent.refresh();
  }

  ngOnInit() {
    // this.loginService.validate().subscribe(res => {
    //   console.log("Login validation: " + res);
    // })
  }

  static refresh() {
    // if (localStorage.getItem('darkTheme') === 'true') {
    //   const body = document.getElementsByTagName('body')[0];
    //   body.classList.add('dark-theme');
    //   this.darkTheme = true;
    // } else {
    //   const body = document.getElementsByTagName('body')[0];
    //   body.classList.remove('dark-theme');
    //   this.darkTheme = false;
    // }
  }


  static toggleDarkTheme() {
    const darkTheme = localStorage.getItem('darkTheme');
    if (darkTheme == 'true') {
      localStorage.setItem('darkTheme', 'false');
    } else {
      localStorage.setItem('darkTheme', 'true');
    }

    AppComponent.refresh();
  }

  static isDarkTheme() {
    return AppComponent.darkTheme;
  }

}
