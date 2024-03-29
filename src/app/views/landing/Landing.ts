import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {NotificationsService} from 'angular2-notifications';
import {UserAccount} from "../../models/UserAccount";
import {environment} from "../../../environments/environment";
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {ListResponse} from "../../services/ApiService";
import {DomSanitizer} from "@angular/platform-browser";
import {Genre} from "../../models/Genre";

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

  spotifyEnabled: boolean = false;
  youtubeEnabled: boolean = false;

  genres: Genre[] = [];

  constructor(private router: Router,
              private loginService: LoginService,
              private notificationsService: NotificationsService,
              private partyService: PartyService,
              private route: ActivatedRoute,
              private domSanitizer: DomSanitizer,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    this.partyService.getParties(2, 0).subscribe(result => {
      this.parties = result;
    });

    this.partyService.getGenres().subscribe(res => {
      this.genres = res;
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

  toggleSpotify() {
    this.spotifyEnabled = !this.spotifyEnabled;
    this.partyService.getGenres().subscribe(res => {
      this.genres = res;
    });
  }

  toggleYouTube() {
    this.youtubeEnabled = !this.youtubeEnabled;
    this.partyService.getGenres().subscribe(res => {
      this.genres = res;
    });
  }

}
