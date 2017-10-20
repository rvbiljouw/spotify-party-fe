import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {UserAccount} from '../models/UserAccount';
import {DefaultRequestOptions} from "./util/DefaultRequestOptions";
import {ApiService} from "./ApiService";

@Injectable()
export class UserAccountService extends ApiService<UserAccount> {

  constructor(http: Http) {
    super(
      http,
      environment.apiHost,
      '/api/v1/account',
    );
  }
}
