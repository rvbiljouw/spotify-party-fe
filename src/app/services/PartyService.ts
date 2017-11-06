import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {environment} from "../../environments/environment";
import {Http} from "@angular/http";
import {Party} from "../models/Party";
import {Observable} from "rxjs/Observable";
import {Filter, ListResponse} from "./ApiService";
import {PartyList} from "../models/PartyList";
import {UserAccount} from "../models/UserAccount";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";

@Injectable()
export class PartyService {
  private endpoint = `${environment.apiHost}/api/v1/parties`;
  private createEndpoint = `${environment.apiHost}/api/v1/party`;

  partyList: BehaviorSubject<PartyList> = new BehaviorSubject(null);

  constructor(private http: Http) {
    IntervalObservable.create(5000).subscribe(res => {
      this.refresh();
    });
  }

  refresh() {
    this.getMyParties().subscribe(result => {
      this.partyList.next(result);
    });
  }

  changeActiveParty(id: number): Observable<Party> {
    return this.http.put(`${this.endpoint}/activate?partyId=${id}`, {}, {withCredentials: true}).map(res => {
      let party = res.json() as Party;
      this.refresh();
      return party;
    });
  }

  createParty(req: CreatePartyRequest) {
    return this.http.post(`${this.createEndpoint}`, req, {withCredentials: true}).map(res => {
      let party = res.json() as Party;
      this.refresh();
      return party;
    });
  }

  leaveParty(id: number): Observable<boolean> {
    return this.http.delete(`${this.endpoint}/${id}/members`, {withCredentials: true}).map(res => {
      this.refresh();
      return true;
    });
  }

  joinParty(id: number, reconnect: boolean = false): Observable<Party> {
    console.log(id);
    return this.http.put(`${this.endpoint}/${id}/members?reconnect=${reconnect}`, {}, {withCredentials: true}).map(res => {
      let party = res.json() as Party;
      this.refresh();
      return party;
    })
  }

  getMostPopular(limit: number, offset: number, type: string): Observable<ListResponse<Party>> {
    return this.http.get(`${this.endpoint}/popular?limit=${limit}&offset=${offset}&type=${type}`, {withCredentials: true}).map(result => {
      const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
      const offset = Number.parseInt(result.headers.get('X-Offset'));
      return new ListResponse<Party>(
        result.json() as Array<Party>,
        maxRecords,
        offset,
      );
    });
  }

  getNew(limit: number, offset: number, type: string): Observable<ListResponse<Party>> {
    return this.http.get(`${this.endpoint}/new?limit=${limit}&offset=${offset}&type=${type}`, {withCredentials: true}).map(result => {
      const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
      const offset = Number.parseInt(result.headers.get('X-Offset'));
      return new ListResponse<Party>(
        result.json() as Array<Party>,
        maxRecords,
        offset,
      );
    });
  }

  getParties(limit: number, offset: number, filters: Array<Filter> = []): Observable<ListResponse<Party>> {
    return this.search(this.endpoint, filters, limit, offset);
  }

  getMyParties(): Observable<PartyList> {
    return this.http.get(`${this.endpoint}/mine`, {withCredentials: true}).map(res => {
      return res.json() as PartyList;
    });
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

  kickUser(party: Party, member: UserAccount): Observable<Party> {
    return this.http.delete(`${this.endpoint}/${party.id}/members/${member.id}`, {withCredentials: true}).map(res => {
      return res.json() as Party;
    })
  }

  updateParty(id: number, value: any) {
    return this.http.put(`${this.endpoint}/${id}`, value, {withCredentials: true}).map(res => {
      return res.json() as Party;
    })
  }
}

export class CreatePartyRequest {
  constructor(name: string, description: string, type: string, access: string) {
  }
}
