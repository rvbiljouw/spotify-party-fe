import {Component, Input, OnInit} from "@angular/core";
import {NotificationsService} from 'angular2-notifications';
import {Party} from "../../models/Party";
import {UserAccount} from "../../models/UserAccount";
import {PartyService} from "../../services/PartyService";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Genre} from "../../models/Genre";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-party-settings',
  templateUrl: 'PartySettings.html',
  styleUrls: ['PartySettings.scss']
})
export class PartySettingsComponent implements OnInit {

  @Input()
  party: Party = new Party();

  partyForm: FormGroup;
  accessTypeOptions: Array<any> = [{
    name: 'Public',
    value: 'PUBLIC'
  }, {
    name: 'Private',
    value: 'PRIVATE'
  }];
  saving: boolean;

  genres: Array<Genre> = [];

  constructor(private notificationsService: NotificationsService,
              private partyService: PartyService,
              private fb: FormBuilder) {
    this.partyForm = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control('', []),
      access: this.fb.control('', [Validators.required]),
      genres: this.fb.control([], [])
    });
  }

  ngOnInit(): void {

    this.partyService.activeParty.subscribe(party => {
      if (party != null) {
        this.party = party;
        this.partyForm = this.fb.group({
          name: this.fb.control(this.party.name, [Validators.required]),
          description: this.fb.control(this.party.description, []),
          access: this.fb.control(this.party.access, [Validators.required]),
          genres: this.fb.control(this.party.genres.map(z => z.id), [])
        });
      }
    });

    this.partyService.getGenres().subscribe(res => {
      this.genres = res;
    });
  }

  kick(member: UserAccount) {
    this.partyService.kickUser(this.party, member).subscribe(res => {
      this.notificationsService.success('User has been kicked.');
      this.party = res;
    }, err => {
      this.notificationsService.error('Couldn\'t kick user');
    });
  }

  submit() {
    this.partyService.updateParty(this.party.id, this.partyForm.value).subscribe(res => {
      this.notificationsService.info('Party settings updated.');
      this.party = res;
    }, err => {
      this.notificationsService.error('Couldn\'t update settings: ' + err);
    })
  }

}
