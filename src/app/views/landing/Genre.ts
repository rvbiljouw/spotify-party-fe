import {Component, Input, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {NotificationsService} from 'angular2-notifications';
import {UserAccount} from "../../models/UserAccount";
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {Filter, FilterType, ListResponse} from "../../services/ApiService";
import {DomSanitizer} from "@angular/platform-browser";
import {Genre} from "../../models/Genre";

@Component({
  selector: 'app-genre',
  templateUrl: './Genre.html',
  styleUrls: ['./Genre.scss'],
  animations: [routerTransition()],
})
export class GenreComponent implements OnInit {
  parties: ListResponse<Party> = new ListResponse([], 0, 0);
  account: UserAccount;
  loggedIn: boolean = false;


  @Input()
  genre: Genre;

  @Input()
  youtubeEnabled: boolean;

  @Input()
  spotifyEnabled: boolean;

  constructor(private router: Router,
              private loginService: LoginService,
              private notificationsService: NotificationsService,
              private partyService: PartyService,
              private route: ActivatedRoute,
              private domSanitizer: DomSanitizer,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    let filters = [
      new Filter(FilterType.EQUALS, "genres.id", this.genre.id),
      new Filter(FilterType.EQUALS, "show_on_homepage", true),
      new Filter(FilterType.EQUALS, "access", "PUBLIC")
    ];

    if (this.youtubeEnabled && !this.spotifyEnabled) {
      filters.push(new Filter(FilterType.EQUALS, "type", "YOUTUBE"));
    }

    if (this.spotifyEnabled && !this.youtubeEnabled) {
      filters.push(new Filter(FilterType.EQUALS, "type", "SPOTIFY"));
    }

    console.log(filters);

    this.partyService.search(filters, 25, 0, {order: 'desc', sort: 'activeMemberCount'}).subscribe(res => {
      this.parties = res;
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

}
