import {Party} from "./Party";
import {UserAccount} from "./VenueAccount";

export class PartyQueue {
  party: Party;
  entries: Array<PartyQueueEntry>;
}

export class PartyQueueEntry {
  id: number;
  party: Party;
  member: UserAccount;
  artist: string;
  title: string;
  thumbnail: string;
  uri: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  status: string;
  created: Date;
  updated: Date;
}