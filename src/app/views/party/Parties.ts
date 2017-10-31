import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
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
  popularParties: ListResponse<Party>;
  newParties: ListResponse<Party>;
  account: UserAccount;
  limit: number = 25;
  offset: number = 0;

  searchTerm = new FormControl('', []);
  searching: boolean;
  searchResults: ListResponse<Party>;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
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

    this.partyService.getMostPopular(this.limit, this.offset).subscribe(res => {
      console.log(res);
      this.popularParties = res;
    });

    this.partyService.getNew(this.limit, this.offset).subscribe(res => {
      this.newParties = res;
    });


    this.partyService.getMyParties().subscribe(res => {
      this.yourParties = res;
    });

    this.searchTerm.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(term => {
        if (term.length > 0) {
          this.searching = true;

          let filters = [new Filter(FilterType.CONTAINS, "name", term)];
          this.partyService.getParties(this.limit, this.offset, filters).subscribe(result => {
            this.searchResults = result;
          });
        }
      });
  }

  setActiveParty(party: Party) {
    let isMember = party.members.map(p => p.id).indexOf(this.account.id) > -1;
    if (isMember) {
      this.partyService.changeActiveParty(party.id).subscribe(res => {
        this.toastyService.info('Joined party ' + party.name);
        this.router.navigate(['party', party.id]);
      }, err => {
        this.toastyService.error('Couldn\'t join party - please try again later.');
      });
    } else {
      this.partyService.joinParty(party.id).subscribe(res => {
        this.toastyService.info('Joined party ' + party.name);
        this.router.navigate(['party', party.id]);
      }, err => {
        this.toastyService.error('Couldn\'t join party - please try again later.');
      });
    }
  }

  getState() {
    return this.route.data['state'];
  }
}
