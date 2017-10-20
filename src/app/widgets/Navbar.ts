import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {AccountService} from '../services/LoginService';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';
import {UserAccount} from "../models/VenueAccount";
import {FormControl} from "@angular/forms";
import {Filter, FilterType, ListResponse} from "../services/ApiService";
import {Song} from "../models/Song";
import {Artist} from "../models/Artist";
import {Album} from "../models/Album";
import {MusicService} from "../services/SongService";
import {ToastyService} from "ng2-toasty";
import {PageEvent} from "@angular/material";

@Component({
  selector: 'app-navbar',
  templateUrl: './Navbar.html',
  styleUrls: ['./Navbar.scss'],
})
export class NavbarComponent implements OnInit {
  account: UserAccount;
  loggedIn: Boolean;

  searchTerm = new FormControl();
  searching: boolean = false;

  pageSizeOptions = [5, 10, 25, 100];

  songs: ListResponse<Song> = new ListResponse([], 0, 0);
  songsPageNumber = 0;
  songsLimit = 10;
  songsOffset = 0;
  searchingSongs = false;

  artists: ListResponse<Artist> = new ListResponse([], 0, 0);
  artistsPageNumber = 0;
  artistsLimit = 10;
  artistsOffset = 0;
  searchingArtists = false;

  albums: ListResponse<Album> = new ListResponse([], 0, 0);
  albumsPageNumber = 0;
  albumsLimit = 10;
  albumsOffset = 0;
  searchingAlbums = false;

  constructor(private loginService: AccountService,
              private musicService: MusicService,
              private toastyService: ToastyService,
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
        this.searching = true;
        this.setSongsPage({limit: this.songsLimit, offset: 0});
        this.setArtistsPage({limit: this.artistsLimit, offset: 0});
        this.setAlbumsPage({limit: this.albumsLimit, offset: 0});
      });
  }

  logout() {
    this.loginService.logout();
  }


  setSongsPage(nextPage: any) {
    this.searchingSongs = true;

    const filters: Array<Filter> = [
      new Filter(FilterType.OR, null, null, [
        new Filter(FilterType.STARTS_WITH, 'ARTIST', this.searchTerm.value),
        new Filter(FilterType.STARTS_WITH, 'TRACK', this.searchTerm.value),
      ])
    ];

    this.musicService.searchSongs(filters, nextPage.limit, nextPage.offset).subscribe(
      result => {
        this.songs = result;
        this.searchingSongs = false;
      },
      err => {
        console.log(err);
        this.searchingSongs = false;
        this.toastyService.error('Unable to search songs');
      },
    );
  }

  onSongsPageEvent(pageEvent: PageEvent) {
    this.songsPageNumber = pageEvent.pageIndex;
    this.songsLimit = pageEvent.pageSize;
    this.songsOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setSongsPage({limit: this.songsLimit, offset: this.songsOffset});
  }

  setArtistsPage(nextPage: any) {
    this.searchingArtists = true;

    const filters: Array<Filter> = [
      new Filter(FilterType.CONTAINS, 'ARTIST', this.searchTerm.value),
    ];

    this.musicService
      .searchArtists(filters, nextPage.limit, nextPage.offset)
      .subscribe(
        result => {
          this.artists = result;
          this.artistsPageNumber = this.artists.offset / this.artistsLimit;
          this.searchingArtists = false;
        },
        err => {
          console.log(err);
          this.searchingArtists = false;
          this.toastyService.error('Unable to search artists');
        },
      );
  }

  onArtistsPageEvent(pageEvent: PageEvent) {
    this.artistsPageNumber = pageEvent.pageIndex;
    this.artistsLimit = pageEvent.pageSize;
    this.artistsOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setArtistsPage({
      limit: this.artistsLimit,
      offset: this.artistsOffset,
    });
  }

  setAlbumsPage(nextPage: any) {
    this.searchingAlbums = true;

    const filters: Array<Filter> = [
      new Filter(FilterType.CONTAINS, 'ALBUM', this.searchTerm.value),
    ];

    this.musicService
      .searchAlbums(filters, nextPage.limit, nextPage.offset)
      .subscribe(
        result => {
          this.albums = result;
          this.albumsPageNumber = this.albums.offset / this.albumsLimit;
          this.searchingAlbums = false;
        },
        err => {
          console.log(err);
          this.searchingAlbums = false;
          this.toastyService.error('Unable to search albums');
        },
      );
  }

  onAlbumsPageEvent(pageEvent: PageEvent) {
    this.albumsPageNumber = pageEvent.pageIndex;
    this.albumsLimit = pageEvent.pageSize;
    this.albumsOffset = pageEvent.pageIndex * pageEvent.pageSize;

    this.setAlbumsPage({limit: this.albumsLimit, offset: this.albumsOffset});
  }

  login() {
    window.location.href = 'http://localhost:8080/api/v1/login';
  }


  toggleDarkTheme() {
    const darkTheme = localStorage.getItem('darkTheme');
    if (darkTheme == 'true') {
      localStorage.setItem('darkTheme', 'false');
    } else {
      localStorage.setItem('darkTheme', 'true');
    }

    AppComponent.refresh();
  }

  isDarkTheme() {
    return AppComponent.darkTheme;
  }
}
