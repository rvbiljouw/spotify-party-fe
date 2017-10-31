import {UserAccount} from "./UserAccount";
import {PartyQueueEntry} from "./PartyQueue";

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
  nowPlaying: PartyQueueEntry;
  name: string;
  description: string;
  backgroundUrl: string;
  status: string;
  created: Date;
  updated: Date;
  access: string;
}
