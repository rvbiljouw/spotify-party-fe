import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
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
  selector: 'parties',
  templateUrl: './Parties.html',
  styleUrls: ['./Parties.scss'],
  animations: [routerTransition()],
})
export class PartiesComponent implements OnInit {
  yourParties: PartyList;
  spotifyGroup = new PartyGroup();
  youtubeGroup = new PartyGroup();
  account: UserAccount;
  limit: number = 25;
  offset: number = 0;

  searchTerm = new FormControl('', []);
  searching: boolean;
  searchResults: ListResponse<Party>;
  loggedIn: boolean;

  selectedTab = 0;

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
      this.loggedIn = acc != null;
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

    this.route.queryParams.subscribe((params: Params) => {
      const tab = params['tab'];

      if (tab === 'youtube') {
        this.selectedTab = 1;
      } else {
        this.selectedTab = 0;
      }
    });

    this.searchTerm.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(term => {
        if (term.length > 0) {
          this.searching = true;

          let spotifyFilters = [
            new Filter(FilterType.CONTAINS, "name", term),
            new Filter(FilterType.EQUALS, "type", "SPOTIFY")
          ];
          this.partyService.getParties(this.limit, this.offset, spotifyFilters).subscribe(result => {
            this.spotifyGroup.searchResults = result;
          });

          let youtubeFilters = [
            new Filter(FilterType.CONTAINS, "name", term),
            new Filter(FilterType.EQUALS, "type", "YOUTUBE")
          ];
          this.partyService.getParties(this.limit, this.offset, youtubeFilters).subscribe(result => {
            this.youtubeGroup.searchResults = result;
          });
        }
      });
  }

  setActiveParty(party: Party) {
    this.partyService.joinParty(party.id).subscribe(res => {
      this.notificationsService.info('Joined party ' + party.name);
      this.router.navigate(['party', party.id]);
    }, err => {
      this.notificationsService.error('Couldn\'t join party - please try again later.');
    });
  }

  loadGroup(group: PartyGroup, type: string) {
    this.partyService.getMostPopular(this.limit, this.offset, type).subscribe(res => {
      group.popularParties = res;
    });

    this.partyService.getNew(this.limit, this.offset, type).subscribe(res => {
      group.newParties = res;
    });
  }

  getState() {
    return this.route.data['state'];
  }
}

export class PartyGroup {
  popularParties: ListResponse<Party>;
  newParties: ListResponse<Party>;
  searchResults: ListResponse<Party>;
}
