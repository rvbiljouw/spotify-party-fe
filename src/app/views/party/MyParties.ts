import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import { NotificationsService } from 'angular2-notifications';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue} from "../../models/PartyQueue";
import {QueueService} from "../../services/QueueService";
import {Filter, FilterType, ListResponse} from "../../services/ApiService";
import {UserAccount} from "../../models/UserAccount";
import {LoginService} from "../../services/LoginService";
import {PartyList} from "../../models/PartyList";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-my-parties',
  templateUrl: './MyParties.html',
  styleUrls: ['./MyParties.scss'],
  animations: [routerTransition()],
})
export class MyPartiesComponent implements OnInit {
  yourParties: PartyList;
  spotifyGroup = new PartyGroup();
  youtubeGroup = new PartyGroup();
  account: UserAccount;
  limit: number = 25;
  offset: number = 0;

  searchTerm = new FormControl('', []);
  searching: boolean;
  searchResults: ListResponse<Party>;

  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService ,
              private queueService: QueueService,
              private loginService: LoginService,
              private domSanitizer: DomSanitizer,
              private route: ActivatedRoute,
              fb: FormBuilder) {
  }

  ngOnInit() {
    this.loginService.account.subscribe(acc => {
      this.account = acc;
    });

    this.loadGroup(this.spotifyGroup, "SPOTIFY");
    this.loadGroup(this.youtubeGroup, "YOUTUBE");

    this.partyService.partyList.subscribe(partyList => {
      if (partyList != null) {
        this.yourParties = partyList;
      } else {
        this.yourParties = new PartyList();
      }
    });

    this.searchTerm.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(term => {
        if (term.length > 0) {
          this.searching = true;

          this.partyService.searchAllMyParties(this.limit, this.offset, 'SPOTIFY', term, this.account).subscribe(result => {
            this.spotifyGroup.searchResults = result;
          });

          this.partyService.searchAllMyParties(this.limit, this.offset, 'YOUTUBE', term, this.account).subscribe(result => {
            this.youtubeGroup.searchResults = result;
          });
        }
      });
  }

  loadGroup(group: PartyGroup, type: string) {
    this.partyService.searchAllMyParties(this.limit, this.offset, type, "", this.account).subscribe(res => {
      group.popularParties = res;
    });
  }

  getState() {
    return this.route.data['state'];
  }
}

export class PartyGroup {
  popularParties: ListResponse<Party>;
  searchResults: ListResponse<Party>;
}
