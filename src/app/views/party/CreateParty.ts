import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {NotificationsService} from 'angular2-notifications';
import {CreatePartyRequest, PartyService} from "../../services/PartyService";
import {UserAccount} from "../../models/UserAccount";
import {Genre} from "../../models/Genre";

@Component({
  selector: 'create-party',
  templateUrl: './CreateParty.html',
  styleUrls: ['./CreateParty.scss'],
  animations: [routerTransition()],
})
export class CreatePartyComponent implements OnInit {
  partyForm: FormGroup;
  accessTypeOptions: Array<any> = [{
    name: 'Public',
    value: 'PUBLIC'
  }, {
    name: 'Private',
    value: 'PRIVATE'
  }];
  typeOptions: Array<any> = [{
    name: 'Spotify',
    value: 'SPOTIFY'
  }, {
    name: 'YouTube',
    value: 'YOUTUBE'
  }];

  genres: Array<Genre> = [];

  creating = false;

  account: UserAccount = null;
  loggedIn: boolean = false;

  constructor(private router: Router,
              private partyService: PartyService,
              private notificationsService: NotificationsService,
              private loginService: LoginService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.partyForm = fb.group({
      name: fb.control('', [Validators.required]),
      description: fb.control('', []),
      access: fb.control('PRIVATE', [Validators.required]),
      type: fb.control('SPOTIFY', [Validators.required]),
      genres: fb.control(null, [])
    });
  }

  ngOnInit() {
    this.loginService.account.subscribe(res => {
      if (res != null) {
        this.loggedIn = true;
        this.account = res;
      }
    });

    this.partyService.getGenres().subscribe(res => {
      this.genres = res;
    });
  }

  submit() {
    this.partyService.createParty(this.partyForm.value as CreatePartyRequest).subscribe(res => {
      this.notificationsService.success('Party created.');
      this.router.navigate(['/party', res.id]);
    });
  }

  getState() {
    return this.route.data['state'];
  }
}
