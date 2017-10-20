import {Injectable} from '@angular/core';
import {BaseRequestOptions, RequestOptions, RequestOptionsArgs,} from '@angular/http';
import {UserAccount} from "../../models/VenueAccount";

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
  public static account: UserAccount;

  merge(options?: RequestOptionsArgs): RequestOptions {
    let newOptions = super.merge(options);
    if (DefaultRequestOptions.account != null) {
      newOptions.headers.set(
        'Authorization',
        `Bearer ${DefaultRequestOptions.account.accessToken}`,
      );
    }
    return newOptions;
  }
}
