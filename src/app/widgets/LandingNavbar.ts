import {Component, Input, OnInit} from '@angular/core';
import {QueueService} from '../services/QueueService';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import { NotificationsService } from 'angular2-notifications';
import {LoginService} from "../services/LoginService";
import {UserAccount} from "../models/UserAccount";

@Component({
  selector: 'app-landing-navbar',
  templateUrl: './LandingNavbar.html',
  styleUrls: ['./LandingNavbar.scss']
})
export class LandingNavbarComponent implements OnInit {

  account: UserAccount;
  loggedIn: boolean = false;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {

    this.loginService.account.subscribe(
      account => {
        this.loggedIn = account != null;
        this.account = account;
      },
      err => {
        this.loggedIn = false;
      },
    );
  }

}
