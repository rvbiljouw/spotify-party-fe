import {Party} from "./Party";
import {UserAccount} from "./UserAccount";

export class PartyQueue {
  nowPlaying: PartyQueueEntry;
  party: Party;
  entries: Array<PartyQueueEntry>;
  nowPlaying: PartyQueueEntry;
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
  playedAt: number;
  duration: number;
  created: Date;
  updated: Date;
}
