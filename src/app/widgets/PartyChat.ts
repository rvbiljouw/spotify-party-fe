import {
  AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit,
  ViewChild
} from "@angular/core";
import {UserAccount} from "../models/UserAccount";
import {Party} from "../models/Party";
import {ChatMessage, PartyChatMessage} from "../models/ChatMessage";
import {EmojifyPipe} from "angular-emojify";
import {MessageEnvelope, WebSocketService} from "../services/WebSocketService";
import {LoginService} from "../services/LoginService";
import {EmojiPickerAppleSheetLocator} from "angular2-emoji-picker";
import {EmojiPickerOptions} from "angular2-emoji-picker/lib-dist/services/emoji-picker.service";
import {WSMessage} from "../models/WSMessage";
import {EmojiEvent} from "angular2-emoji-picker/lib-dist/lib/emoji-event";
import {debounce} from 'lodash';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-party-chat',
  templateUrl: './PartyChat.html',
  styleUrls: ['./PartyChat.scss']
})
export class PartyChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  formatMentionOption = (member: UserAccount) => {
    this.setLastMentionInputTime(Date.now());
    return `@${member.displayName} `;
  };


  @Input() party: Party;
  @Input() partyMembers: UserAccount[];

  messages: PartyChatMessage[] = [];

  @ViewChild("chatInput") chatInput: ElementRef;

  account: UserAccount;
  loggedIn: boolean = false;

  mentionConfig = {
    labelKey: "displayName",
    maxItems: 5,
    disableSearch: false,
    triggerChar: '@',
    mentionSelect: this.formatMentionOption,
  };

  lastMentionInput = 0;

  emojiPickerToggled = false;

  chatInputModel = '';

  emojifyPipe: EmojifyPipe = new EmojifyPipe();


  nowPlayingHeight = 0;
  chatContentHeight = 0;

  onAddChatMessageHandler = (e) => this.onAddChatMessage(e);
  onAddChatHistoryHandler = (e) => this.onAddChatHistory(e);
  onPartyJoinedHandler = (e) => this.onPartyJoined(e);

  constructor(private webSocketService: WebSocketService,
              private loginService: LoginService,
              private cdRef: ChangeDetectorRef,
              private emojiPickerOptions: EmojiPickerOptions) {
    this.emojiPickerOptions.setEmojiSheet({
      url: 'sheet_apple_32.png',
      locator: EmojiPickerAppleSheetLocator
    });
  }

  ngOnInit() {
    this.loginService.account.subscribe(acc => {
      this.account = acc;
      this.loggedIn = acc != null;
    });

    this.webSocketService.registerHandler('ADD_CHAT_MESSAGE', this.onAddChatMessageHandler);
    this.webSocketService.registerHandler('ADD_CHAT_HISTORY', this.onAddChatHistoryHandler);
    this.webSocketService.registerHandler('JOIN_PARTY_RESPONSE', this.onPartyJoinedHandler);

  }

  ngOnDestroy() {
    this.webSocketService.unregisterHandler('ADD_CHAT_MESSAGE', this.onAddChatMessageHandler);
    this.webSocketService.unregisterHandler('ADD_CHAT_HISTORY', this.onAddChatHistoryHandler);
    this.webSocketService.unregisterHandler('JOIN_PARTY_RESPONSE', this.onPartyJoinedHandler);
  }

  ngAfterViewChecked(): void {
    this.calculateHeight();
  }

  private onAddChatMessage(env: MessageEnvelope) {
    let message = JSON.parse(env.body) as PartyChatMessage;
    this.renderChatMessage(message, false);
  }

  private onAddChatHistory(env: MessageEnvelope) {
    let messages = JSON.parse(env.body) as PartyChatMessage[];
    messages.forEach(m => this.renderChatMessage(m, true));
  }

  private onPartyJoined(env: MessageEnvelope) {
    this.messages = [];
    this.webSocketService.postEnvelope('CHAT_HISTORY_REQUEST', {});
  }

  calculateHeight() {
    const element = document.getElementById('app-now-playing-container');
    const chatHeader = document.getElementById('app-chat-header');
    const chatFooter = document.getElementById('app-chat-footer');
    if (element != null) {
      const newHeight = element.clientHeight;
      if (newHeight !== this.nowPlayingHeight) {
        this.nowPlayingHeight = newHeight;
        this.chatContentHeight = this.nowPlayingHeight - (chatHeader.clientHeight + chatFooter.clientHeight) - 8; // 8 for padding
        this.cdRef.detectChanges();
      }
    }
  }

  handleEmojiSelection(event: EmojiEvent) {
    const tempNewModel = this.chatInputModel.length === 0 ? `:${event.label}: ` : `${this.chatInputModel} :${event.label}: `;

    this.chatInputModel = this.emojifyPipe.transform(tempNewModel);
    this.chatInput.nativeElement.focus();
    this.emojiPickerToggled = false;
  }

  onChatInput(event) {
    if (event.endsWith(":") && event.length > this.chatInputModel.length) {
      const transformed = this.emojifyPipe.transform(event);
      if (transformed !== event) {
        event = `${event} `;
      }
    }

    this.chatInputModel = this.emojifyPipe.transform(event);
  }

  onMentionInput(text) {
    this.setLastMentionInputTime(Date.now());
  }

  renderChatMessage(message: PartyChatMessage, isBulk: boolean) {
    if (this.messages.length > 100) {
      this.messages.slice(1);
    }

    console.log(this.account);
    console.log(message);
    let _messageText = message.message;
    let users = [];
    while (_messageText.indexOf('@') !== -1 && users.indexOf(this.account.displayName) === -1) {
      const user = this.getUserMentioned(_messageText);
      users = users.concat(user);

      _messageText = _messageText.replace(`@${user}`, "");
    }

    if (users.indexOf(this.account.displayName) !== -1) {
      if (!isBulk) {
        this.spawnNotification(message.message, null, message.sender);
      }

      message.mention = true;
    }

    this.messages = this.messages.concat(message);
  }

  private getUserMentioned(message: string) {
    let user = message.substring(message.indexOf('@') + 1);
    if (user.indexOf(' ') !== -1) {
      user = user.substring(0, user.indexOf(' '));
    }

    return user.trim();
  }

  sendChatMessage = debounce((event) => {
    if (event != null && event.keyCode != 13) {
      return;
    }
    if (Date.now() - this.lastMentionInput < 500) {
      return;
    }

    const message = this.chatInput.nativeElement.value;
    if (message != null) {
      const trimmed = message.trim();
      if (trimmed.length > 0) {
        this.chatInputModel = '';
        this.chatInput.nativeElement.value = "";

        this.webSocketService.postEnvelope('SEND_CHAT_REQUEST', {message: message});
      }
    }
  }, 150);


  private spawnNotification(theBody, theIcon, theTitle) {
    const options = {
      body: theBody,
      icon: theIcon
    };

    if ("Notification" in window) {
      const n = new Notification(theTitle, options);
      setTimeout(n.close.bind(n), 3000);
    }
  }

  getSenderColor(message: ChatMessage) {
    if (message.server) {
      return 'rgb(255, 87, 35)';
    } else if (message.owner) {
      return 'rgb(199, 60, 169)';
    } else if (message.staff) {
      return 'red';
    }
    return '#0075ad';
  }

  getMessageColor(message: ChatMessage) {
    if (message.server) {
      return '#b7b7b7';
    }

    return '#000';
  }

  getMessageStyle(message: ChatMessage) {
    if (message.server) {
      return 'italic';
    }

    return 'normal';
  }

  setLastMentionInputTime(time) {
    if (time > this.lastMentionInput) {
      this.lastMentionInput = time;
    }
  }

}
