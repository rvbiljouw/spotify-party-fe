import {Component, OnDestroy, OnInit} from "@angular/core";
import {routerTransition} from "../utils/Animations";
import {MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-upload-image',
  templateUrl: './UploadImageModal.html',
  styleUrls: ['./UploadImageModal.scss'],
  animations: [routerTransition(),
  ],
})
export class UploadImageModal implements OnInit, OnDestroy {
  imageChangedEvent: any = '';
  croppedImage: any = null;


  constructor(public dialogRef: MatDialogRef<UploadImageModal>) {
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(image: string) {
    this.croppedImage = image;
  }
}
