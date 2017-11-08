export class ChatMessage {
  sender: string;
  message: string;
  owner: boolean;
  staff: boolean;
  server: boolean;
  timestamp: Date;
  mentioningMe: boolean;
}
