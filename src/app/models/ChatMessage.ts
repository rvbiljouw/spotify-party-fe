export class ChatMessage {
  sender: string;
  message: string;
  owner: boolean;
  staff: boolean;
  server: boolean;
  timestamp: Date;
  mentioningMe: boolean;
}

export class PartyChatMessage {
  id: number;
  sender: string;
  message: string;
  owner: boolean;
  stafF: boolean;
  server: boolean;
  mention: boolean;
  created: Date;
}
