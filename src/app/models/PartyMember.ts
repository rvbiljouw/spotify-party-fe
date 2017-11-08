import {UserAccount} from "./UserAccount";
import {Party} from "./Party";

export type PartyMemberRank = "VISITOR" | "MODERATOR" | "HOST";

export const PartyMemberRank = {
VISITOR: "VISITOR" as PartyMemberRank,
  MODERATOR: "MODERATOR" as PartyMemberRank,
  HOST: "HOST" as PartyMemberRank
};

export class PartyMember {
  id: number;
  rank: PartyMemberRank;
  party: Party;
  account: UserAccount;
  lastSeen: Date;
  active: boolean;
  created: Date;
  updated: Date;
}

