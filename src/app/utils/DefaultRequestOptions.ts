import {Injectable} from '@angular/core';
import {
  BaseRequestOptions,
  RequestOptions,
  RequestOptionsArgs,
} from '@angular/http';
import {LoginToken} from "../models/LoginToken";

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
  public static token: LoginToken;

  merge(options?: RequestOptionsArgs): RequestOptions {
    let newOptions = super.merge(options);
    if (DefaultRequestOptions.token != null) {
      newOptions.headers.set(
        'Authorization',
        `Bearer ${DefaultRequestOptions.token.token}`,
      );
    } else {
      console.log("no token present");
    }
    return newOptions;
  }
}
