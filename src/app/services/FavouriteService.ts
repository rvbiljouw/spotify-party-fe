import {Http, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {ApiService, Filter, FilterType, ListResponse} from './ApiService';
import {environment} from '../../environments/environment';
import {Observable} from "rxjs/Observable";
import {FavouriteSong, SongType} from "../models/FavouriteSong";

@Injectable()
export class FavouriteService extends ApiService<FavouriteSong> {

  constructor(http: Http) {
    super(http, environment.apiHost, '/api/v1/favourites');
  }

  favouriteSong(req: FavouriteSongRequest): Observable<FavouriteSong> {
    return this.http.post(`${this.apiBase}/${this.resource}/add`, req, {withCredentials: true}).map(res => {
      return res.json() as FavouriteSong;
    })
  }
}

export class FavouriteSongRequest {
  type: SongType;
  songId: string;
  artist: string;
  title: string;
  uri: string;
  thumbnail: string;
  duration: number;
  previewUrl: string;
  uploadedBy: string;


  constructor(type: SongType, songId: string, artist: string, title: string, uri: string, thumbnail: string, duration: number, previewUrl: string, uploadedBy: string) {
    this.type = type;
    this.songId = songId;
    this.artist = artist;
    this.title = title;
    this.uri = uri;
    this.thumbnail = thumbnail;
    this.duration = duration;
    this.previewUrl = previewUrl;
    this.uploadedBy = uploadedBy;
  }
}
