import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {environment} from "../../environments/environment";
import {Http} from "@angular/http";
import {Party} from "../models/Party";
import {Observable} from "rxjs/Observable";
import {Filter, ListResponse} from "./ApiService";

@Injectable()
export class PartyService {
  private endpoint = `${environment.apiHost}/api/v1/party`;
  private pluralEndpoint = `${environment.apiHost}/api/v1/parties`;
  account: BehaviorSubject<Party> = new BehaviorSubject(null);

  constructor(private http: Http) {

  }

  changeActiveParty(id: number): Observable<Party> {
    return this.http.put(`${this.endpoint}/activate?partyId=${id}`, {}, {withCredentials: true}).map(res => {
      return res.json() as Party;
    });
  }

  createParty(req: CreatePartyRequest) {
    return this.http.post(this.endpoint, req, {withCredentials: true}).map(res => {
      return res.json() as Party;
    });
  }

  leaveParty(id: number): Observable<boolean> {
    return this.http.delete(`${this.endpoint}/${id}`, {withCredentials: true}).map(res => {
      return true;
    });
  }

  joinParty(id: number): Observable<Party> {
    console.log(id);
    return this.http.put(this.endpoint, {id: id}, {withCredentials: true}).map(res => {
      return res.json() as Party;
    })
  }

  getParties(limit: number, offset: number): Observable<ListResponse<Party>> {
    return this.search(this.pluralEndpoint, [], limit, offset);
  }

  private search<T>(url: string,
                    filters: Array<Filter>,
                    limit: number = 10,
                    offset: number = 0,): Observable<ListResponse<T>> {
    return this.http
      .post(`${url}?limit=${limit}&offset=${offset}`, filters, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<T>(
          result.json() as Array<T>,
          maxRecords,
          offset,
        );
      })
      .catch(error => {
        return null;
      });
  }
}

export class CreatePartyRequest {
  constructor(name: string, description: string) {
  }
}
