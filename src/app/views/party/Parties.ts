import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue} from "../../models/PartyQueue";
import {QueueService} from "../../services/QueueService";
import {ListResponse} from "../../services/ApiService";
import {UserAccount} from "../../models/VenueAccount";
import {AccountService} from "../../services/LoginService";

@Component({
  selector: 'parties',
  templateUrl: './Parties.html',
  styleUrls: ['./Parties.scss'],
  animations: [routerTransition()],
})
export class PartiesComponent implements OnInit {
  parties: ListResponse<Party>;
  account: UserAccount;
  limit: number = 25;
  offset: number = 0;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private queueService: QueueService,
              private accountService: AccountService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    this.accountService.account.subscribe(acc => {
      this.account = acc;
    });
    this.partyService.getParties(this.limit, this.offset).subscribe(res => {
      this.parties = res;
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
