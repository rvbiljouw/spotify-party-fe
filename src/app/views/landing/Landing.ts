import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import { NotificationsService } from 'angular2-notifications';
import {UserAccount} from "../../models/UserAccount";
import {environment} from "../../../environments/environment";
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {ListResponse} from "../../services/ApiService";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-landing',
  templateUrl: './Landing.html',
  styleUrls: ['./Landing.scss'],
  animations: [routerTransition()],
})
export class LandingComponent implements OnInit {
  parties: ListResponse<Party> = new ListResponse([], 0, 0);
  account: UserAccount;
  loggedIn: boolean = false;
  sidebarShowing: boolean = false;


  constructor(private router: Router,
              private loginService: LoginService,
              private notificationsService: NotificationsService ,
              private partyService: PartyService,
              private route: ActivatedRoute,
              private domSanitizer: DomSanitizer,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    this.partyService.getParties(2, 0).subscribe(result => {
      this.parties = result;
    });

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

  logout() {
    this.loginService.logout();
  }


  getBackground(party: Party) {
    if (party.nowPlaying != null) {
      return this.domSanitizer.bypassSecurityTrustUrl(party.nowPlaying.thumbnail);
    } else if (party.backgroundUrl != null && party.backgroundUrl != null && party.backgroundUrl.length > 0) {
      return this.domSanitizer.bypassSecurityTrustUrl(party.backgroundUrl);
    } else {
      return this.domSanitizer.bypassSecurityTrustUrl('assets/bg3.jpg');
    }
  }


}
