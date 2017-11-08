import {Component, Input, OnInit} from '@angular/core';
import {LoginService} from '../services/LoginService';
import {Router} from '@angular/router';
import {UserAccount} from "../models/UserAccount";
import {FormControl} from "@angular/forms";
import {Filter, FilterType, ListResponse} from "../services/ApiService";
import {Song} from "../models/Song";
import {SpotifyService} from "../services/SpotifyService";
import { NotificationsService } from 'angular2-notifications';
import {PageEvent} from "@angular/material";
import {environment} from "environments/environment";
import {YouTubeService} from "../services/YouTubeService";
import {Party} from "../models/Party";

@Component({
  selector: 'app-search-bar',
  templateUrl: './SearchBar.html',
  styleUrls: ['./SearchBar.scss'],
})
export class SearchBarComponent implements OnInit {
  account: UserAccount;
  loggedIn: Boolean;

  searchTerm = new FormControl();
  searching: boolean = false;

  @Input()
  showSearch: boolean = false;
  @Input()
  title: string = "";

  pageSizeOptions = [5, 10, 25, 100];

  songs: ListResponse<Song> = new ListResponse([], 0, 0);
  songsPageNumber = 0;
  songsLimit = 10;
  songsOffset = 0;
  searchingSongs = false;

  @Input() party: Party;

  constructor(private loginService: LoginService,
              private spotifyService: SpotifyService,
              private youtubeService: YouTubeService,
              private notificationsService: NotificationsService ,
              private router: Router,) {
  }

  ngOnInit() {
    this.loginService.account.subscribe(
      account => {
        this.loggedIn = account != null;
        this.account = account;
        console.log(account);
      },
      err => {
        this.loggedIn = false;
      },
    );

    this.searchTerm.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(term => {
        if (term.length > 0) {
          this.searching = true;
          this.setSongsPage({limit: this.songsLimit, offset: 0});
        }
      });
  }

  logout() {
    this.loginService.logout();
  }


  setSongsPage(nextPage: any) {
    this.searchingSongs = true;

    if(this.party.type == 'SPOTIFY') {

      const filters: Array<Filter> = [
        new Filter(FilterType.OR, null, null, [
          new Filter(FilterType.STARTS_WITH, 'ARTIST', this.searchTerm.value),
          new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value),
        ])
      ];

      this.spotifyService.searchSongs(filters, nextPage.limit, nextPage.offset).subscribe(
        result => {
          this.songs = result;
          this.searchingSongs = false;
        },
        err => {
          console.log(err);
          this.searchingSongs = false;
          this.notificationsService.error('Unable to search songs');
        },
      );
    } else if(this.party.type == 'YOUTUBE') {

      const filters: Array<Filter> = [
        new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value)
      ];

      this.youtubeService.searchSongs(filters, nextPage.limit, nextPage.offset).subscribe(
        result => {
          this.songs = result;
          this.searchingSongs = false;
        },
        err => {
          console.log(err);
          this.searchingSongs = false;
          this.notificationsService.error('Unable to search songs');
        },
      );
    }
  }

  onSongsPageEvent(pageEvent: PageEvent) {
    this.songsPageNumber = pageEvent.pageIndex;
    this.songsLimit = pageEvent.pageSize;
    this.songsOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setSongsPage({limit: this.songsLimit, offset: this.songsOffset});
  }

  login() {
    window.location.href = `${environment.apiHost}/api/v1/login`;
  }

}
