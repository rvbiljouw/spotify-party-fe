import {Component, EventEmitter, OnInit, PipeTransform, ViewChild,} from '@angular/core';
import {ToastyConfig} from 'ng2-toasty';
import {NavigationEnd, RouteConfigLoadEnd, RouteConfigLoadStart, Router,} from '@angular/router';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';
import {AccountService} from './services/LoginService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  static darkTheme: boolean;

  constructor(private toastyConfig: ToastyConfig,
              private media: ObservableMedia,
              private router: Router,
              private loginService: AccountService,) {
    toastyConfig.theme = 'material';
    toastyConfig.position = 'top-center';
    AppComponent.refresh();
  }

  ngOnInit() {
    this.loginService.validate().subscribe(res => {
    });
  }

  static refresh() {
    // if (localStorage.getItem('darkTheme') == 'true') {
    const body = document.getElementsByTagName('body')[0];
    // body.classList.add('dark-theme');
    // this.darkTheme = true;
    // } else {
    //   const body = document.getElementsByTagName('body')[0];
    //   body.classList.remove('dark-theme');
    //   this.darkTheme = false;
    // }
  }
}
