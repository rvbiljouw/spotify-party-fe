import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
import {CreatePartyRequest, PartyService} from "../../services/PartyService";

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

  creating = false;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.partyForm = fb.group({
      name: fb.control('', [Validators.required]),
      description: fb.control('', []),
      access: fb.control('PRIVATE', [Validators.required]),
      type: fb.control('SPOTIFY', [Validators.required])
    });
  }

  ngOnInit() {

  }

  submit() {
    this.partyService.createParty(this.partyForm.value as CreatePartyRequest).subscribe(res => {
      this.toastyService.success('Party created.');
      this.router.navigate(['/party', res.id]);
    });
  }

  getState() {
    return this.route.data['state'];
  }
}
