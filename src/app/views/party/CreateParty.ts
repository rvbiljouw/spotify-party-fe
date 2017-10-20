import {Component, OnInit} from '@angular/core';
import {AccountService} from '../../services/LoginService';
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

  creating = false;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.partyForm = fb.group({
      name: fb.control('', [Validators.required]),
      description: fb.control('', [])
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
