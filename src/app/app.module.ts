import {MatButtonModule, MatIconModule, MatIconRegistry, MatNativeDateModule,} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule, RequestOptions} from '@angular/http';

import {AppComponent} from './app.component';
import {LoginComponent} from './views/login/Login';
import {RouterModule, Routes} from '@angular/router';
import {LoginService} from './services/LoginService';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ChartsModule} from 'ng2-charts';


import 'hammerjs';
import {AuthGuard} from './utils/AuthGuard';
import {WebSocketService} from './services/WebSocketService';
import {MaterialModule} from './material.module';
import {DurationPipe} from "./utils/DurationPipe";
import {PartyService} from "./services/PartyService";
import {CreatePartyComponent} from "./views/party/CreateParty";
import {ViewPartyComponent} from "./views/party/ViewParty";
import {QueueService} from "./services/QueueService";
import {QueueListItemComponent} from "./widgets/QueueListItem";
import {PartiesComponent} from "./views/party/Parties";
import {UserAccountService} from "./services/UserAccountService";
import {EmojifyModule} from "angular-emojify";
import {ManagePartyComponent} from "./views/party/ManageParty";
import {SidebarLayoutComponent} from "./views/SidebarLayout";
import {LandingComponent} from "./views/landing/Landing";
import {PartyCardComponent} from "./widgets/PartyCard";
import {SpotifyService} from "./services/SpotifyService";
import {YoutubePlayerComponent} from "./widgets/YoutubePlayer";
import {YouTubeService} from "./services/YouTubeService";
import {SimpleNotificationsModule} from "angular2-notifications";
import {MyAccountComponent} from "./views/account/MyAccount";
import {MentionModule} from "angular2-mentions/mention";
import {EmojiPickerModule} from "angular2-emoji-picker";
import {MyPartiesComponent} from "./views/party/MyParties";
import {PortalModule} from "@angular/cdk/portal";
import {PartyChatComponent} from "./widgets/PartyChat";
import {PartyQueueComponent} from "app/views/party/PartyQueue";
import {SignUpComponent} from "./views/login/SignUp";
import {SongCardComponent} from "./widgets/SongCard";
import {ImageCropperModule} from "ngx-image-cropper";
import {UploadImageModal} from "./widgets/UploadImageModal";
import {ProfileComponent} from "./views/account/Profile";
import {AccountMenuComponent} from "./widgets/AccountMenu";
import {FavouriteService} from "./services/FavouriteService";
import {AccountCardComponent} from "./widgets/AccountCard";
import {UserNotificationService} from "./services/UserNotificationService";
import {NotificationMenuComponent} from "./widgets/NotificationMenu";
import {DefaultRequestOptions} from "./utils/DefaultRequestOptions";
import {CookieService} from "ngx-cookie-service";
import {GenreComponent} from "./views/landing/Genre";
import {PartyHistoryComponent} from "./views/party/PartyHistory";
import {PartySettingsComponent} from "./views/party/PartySettings";

const routes: Routes = [
  {path: '', component: LandingComponent, pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'account', component: MyAccountComponent, canActivate: [AuthGuard]},
  {path: 'parties', component: PartiesComponent},
  {path: 'my-parties', component: MyPartiesComponent, canActivate: [AuthGuard]},
  {path: 'party/create', component: CreatePartyComponent, canActivate: [AuthGuard]},
  {path: 'party/:id', component: ViewPartyComponent, canActivate: [AuthGuard]},
  {path: 'profiles/:id', component: ProfileComponent, canActivate: [AuthGuard]},
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreatePartyComponent,
    ViewPartyComponent,
    DurationPipe,
    QueueListItemComponent,
    PartiesComponent,
    ManagePartyComponent,
    SidebarLayoutComponent,
    AccountCardComponent,
    LandingComponent,
    PartyCardComponent,
    YoutubePlayerComponent,
    MyAccountComponent,
    MyPartiesComponent,
    NotificationMenuComponent,
    PartyChatComponent,
    PartyQueueComponent,
    PartyHistoryComponent,
    SignUpComponent,
    SongCardComponent,
    UploadImageModal,
    ProfileComponent,
    AccountMenuComponent,
    GenreComponent,
    PartySettingsComponent
  ],
  imports: [
    PortalModule,
    MatNativeDateModule,
    FlexLayoutModule,
    NgxDatatableModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MaterialModule,
    // BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ChartsModule,
    RouterModule.forRoot(routes, {useHash: true}),
    MatIconModule,
    EmojifyModule,
    SimpleNotificationsModule.forRoot(),
    MentionModule,
    EmojiPickerModule.forRoot(),
    ImageCropperModule,
    BrowserModule.withServerTransition({appId: 'awsumio'})
  ],
  providers: [
    {provide: RequestOptions, useClass: DefaultRequestOptions},
    CookieService,
    LoginService,
    WebSocketService,
    UserAccountService,
    UserNotificationService,
    AuthGuard,
    MatIconRegistry,
    SpotifyService,
    PartyService,
    QueueService,
    YouTubeService,
    FavouriteService,
  ],
  entryComponents: [ManagePartyComponent, UploadImageModal],
  bootstrap: [AppComponent],
})
export class AppModule {
}
