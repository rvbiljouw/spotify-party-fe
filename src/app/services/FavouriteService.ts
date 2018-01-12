import {Http, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {ApiService, Filter, FilterType, ListResponse} from './ApiService';
import {environment} from '../../environments/environment';
import {Song} from '../models/Song';
import {Observable} from "rxjs/Observable";
import {Artist} from "../models/Artist";
import {Album} from "../models/Album";
import {FavouriteSong} from "../models/FavouriteSong";

@Injectable()
export class FavouriteService extends ApiService<FavouriteSong> {

  constructor(http: Http) {
    super(http, environment.apiHost, '/api/v1/favourites');
  }

}
