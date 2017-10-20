import {UserAccount} from "./VenueAccount";

export class Party {
  /*
      var id: Long = 0
    var owner: AccountResponse? = null
    var members: MutableSet<AccountResponse> = mutableSetOf()
    var name: String? = ""
    var description: String? = ""
    var status: PartyStatus? = null
    var created: DateTime? = null
    var updated: DateTime? = null
   */
  id: number;
  owner: UserAccount;
  members: Array<UserAccount>;
  name: string;
  description: string;
  status: string;
  created: Date;
  updated: Date;
}
