import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
import {PartyService} from "../../services/PartyService";
import {Party} from "../../models/Party";
import {PartyQueue, PartyQueueEntry} from "../../models/PartyQueue";
import {QueueService} from "../../services/QueueService";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'view-party',
  templateUrl: './ViewParty.html',
  styleUrls: ['./ViewParty.scss'],
  animations: [routerTransition()],
})
export class ViewPartyComponent implements OnInit {
  party: Party;
  queue: PartyQueue;

  constructor(private router: Router,
              private partyService: PartyService,
              private toastyService: ToastyService,
              private queueService: QueueService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              fb: FormBuilder,) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.partyService.joinParty(+params["id"]).subscribe(party => {
        this.party = party;
      });
    });

    setInterval(() => {
      this.refresh();
    }, 10000);
    this.refresh();
  }

  private refresh() {
    this.queueService.getQueue().subscribe(res => {
      this.queue = res;
    }, err => {
      this.toastyService.error("Couldn't retrieve queue for party.");
    });
  }


  getArtistThumbnail(entry: PartyQueueEntry, style: boolean) {
    let thumbnail = 'http://via.placeholder.com/400x400';
    if (entry.thumbnail) {
      thumbnail = entry.thumbnail;
    }

    if (style) {
      return this.sanitizer.bypassSecurityTrustStyle(
        'url(' + thumbnail + ')',
      );
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl(thumbnail);
    }
  }


  calculateProgress(entry: PartyQueueEntry) {
    let date = new Date();
    return ((date.getTime() - entry.playedAt) / entry.duration) * 100;
  }

  getState() {
    return this.route.data['state'];
  }
}
