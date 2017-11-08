import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {environment} from "../../../environments/environment";
import {DropzoneConfigInterface} from "ngx-dropzone-wrapper";
import { NotificationsService } from 'angular2-notifications';
import {Party} from "../../models/Party";
import {UserAccount} from "../../models/UserAccount";
import {PartyService} from "../../services/PartyService";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-manage-party',
  templateUrl: 'ManageParty.html',
  styleUrls: ['ManageParty.scss']
})
export class ManagePartyComponent {
  config: DropzoneConfigInterface = {
    url: `${environment.apiHost}/api/v1/party/`,
    maxFilesize: 50,
    acceptedFiles: 'image/jpeg,image/png',
    headers: {},
    autoReset: 0,
    createImageThumbnails: false,
    withCredentials: true
  };

  partyForm: FormGroup;
  party: Party;
  accessTypeOptions: Array<any> = [{
    name: 'Public',
    value: 'PUBLIC'
  }, {
    name: 'Private',
    value: 'PRIVATE'
  }];
  saving: boolean;

  constructor(public dialogRef: MatDialogRef<ManagePartyComponent>,
              private notificationsService: NotificationsService ,
              private partyService: PartyService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.config.url = `${environment.apiHost}/api/v1/party/${data.party.id}/background`;
    this.party = data.party;
    this.partyForm = fb.group({
      name: fb.control(this.party.name, [Validators.required]),
      description: fb.control(this.party.description, []),
      access: fb.control(this.party.access, [Validators.required]),
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onUploadError(args: any) {
    this.notificationsService.error(`Upload failed`);
  }

  onUploadSuccess(args: any) {
    this.notificationsService.success('Upload successful.');
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
