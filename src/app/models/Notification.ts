import {UserAccount} from "./UserAccount";

export type NotificationAction = "FOLLOWED";

export const NotificationAction = {
  FOLLOWED: "FOLLOWED" as NotificationAction,
};

export class Notification {
  id: number;
  account: UserAccount;
  interactingAccount: UserAccount;
  text: string;
  action: NotificationAction;
  read: boolean;
  created: number;
}
