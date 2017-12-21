import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {environment} from "../../environments/environment";
import {Http} from "@angular/http";
import {Party} from "../models/Party";
import {Observable} from "rxjs/Observable";
import {Filter, FilterType, ListResponse} from "./ApiService";
import {PartyList} from "../models/PartyList";
import {UserAccount} from "../models/UserAccount";
import {IntervalObservable} from "rxjs/observable/IntervalObservable";

@Injectable()
export class PartyService {
  private endpoint = `${environment.apiHost}/api/v1/parties`;
  private createEndpoint = `${environment.apiHost}/api/v1/party`;

  partyList: BehaviorSubject<PartyList> = new BehaviorSubject(null);

  constructor(private http: Http) {
    this.refresh();

    IntervalObservable.create(5000).subscribe(res => {
      this.refresh();
    });
  }

  refresh() {
    this.getMyParties().subscribe(result => {
      this.partyList.next(result);
    });
  }

  createParty(req: CreatePartyRequest) {
    return this.http.post(`${this.createEndpoint}`, req, {withCredentials: true}).map(res => {
      let party = res.json() as Party;
      this.refresh();
      return party;
    });
  }

  leaveParty(id: number, remove: boolean): Observable<boolean> {
    return this.http.delete(`${this.endpoint}/${id}/members?remove=${remove}`, {withCredentials: true}).map(res => {
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
    return this.search(this.endpoint, [new Filter(FilterType.EQUALS, "type", type, [])],
      limit, offset, {sort: "activeMemberCount", order: "desc"});
  }

  getNew(limit: number, offset: number, type: string): Observable<ListResponse<Party>> {
    return this.search(this.endpoint, [new Filter(FilterType.EQUALS, "type", type, [])],
      limit, offset, {sort: "created", order: "desc"});
  }

  getParties(limit: number, offset: number, filters: Array<Filter> = []): Observable<ListResponse<Party>> {
    return this.search(this.endpoint, filters, limit, offset);
  }

  searchAllMyParties(limit: number, offset: number, type: string, name: string, account: UserAccount): Observable<ListResponse<Party>> {
    return this.search(this.endpoint, [
        new Filter(FilterType.EQUALS, "type", type, []),
        new Filter(FilterType.CONTAINS, "name", name, []),
        new Filter(FilterType.EQUALS, "members.account.id", account.id, []),
      ],
      limit, offset, {sort: "activeMemberCount", order: "desc"}
    );
  }

  getMyParties(): Observable<PartyList> {
    return this.http.get(`${this.endpoint}/mine`, {withCredentials: true}).map(res => {
      return res.json() as PartyList;
    });
  }

  getById(id: number): Observable<Party> {
    return this.http
      .get(`${this.createEndpoint}/${id}`, {withCredentials: true})
      .map(result => result.json() as Party)
      .catch(error => {
        return Observable.of(null);
      });
  }

  search(url: string,
         filters: Array<Filter>,
         limit: number = 10,
         offset: number = 0,
         params: any = {}): Observable<ListResponse<Party>> {
    let queryParams = '';
    for (const key in params) {
      queryParams += `${key}=${params[key]}&`;
    }
    queryParams += `limit=${limit}&offset=${offset}`;

    return this.http
      .post(`${url}?${queryParams}`, filters, {withCredentials: true})
      .map(result => {
        const maxRecords = Number.parseInt(result.headers.get('X-Max-Records'));
        const offset = Number.parseInt(result.headers.get('X-Offset'));
        return new ListResponse<Party>(
          result.json() as Array<Party>,
          maxRecords,
          offset,
        );
      })
      .catch(error => {
        return Observable.of(null);
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
