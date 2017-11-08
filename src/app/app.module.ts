import {MatButtonModule, MatIconModule, MatIconRegistry, MatNativeDateModule,} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {LoginComponent} from './views/login/Login';
import {RouterModule, Routes} from '@angular/router';
import {LoginService} from './services/LoginService';
import {SearchBarComponent} from './widgets/SearchBar';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ChartsModule} from 'ng2-charts';
import {DropzoneModule} from 'ngx-dropzone-wrapper';


import 'hammerjs';
import {AuthGuard} from './utils/AuthGuard';
import {WebSocketService} from './services/WebSocketService';
import {MaterialModule} from './material.module';
import {DurationPipe} from "./utils/DurationPipe";
import {PartyService} from "./services/PartyService";
import {CreatePartyComponent} from "./views/party/CreateParty";
import {ViewPartyComponent} from "./views/party/ViewParty";
import {QueueService} from "./services/QueueService";
import {SongListItemComponent} from "./widgets/SongListItem";
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
import {LandingNavbarComponent} from "./widgets/LandingNavbar";
import {EmojiPickerModule} from "angular2-emoji-picker";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: LandingComponent},
  {path: 'login', component: LoginComponent},
  {path: 'account', component: MyAccountComponent, canActivate: [AuthGuard]},
  {path: 'parties', component: PartiesComponent},
  {path: 'party/create', component: CreatePartyComponent, canActivate: [AuthGuard]},
  {path: 'party/:id', component: ViewPartyComponent, canActivate: [AuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SearchBarComponent,
    CreatePartyComponent,
    ViewPartyComponent,
    DurationPipe,
    SongListItemComponent,
    QueueListItemComponent,
    PartiesComponent,
    ManagePartyComponent,
    SidebarLayoutComponent,
    LandingComponent,
    PartyCardComponent,
    YoutubePlayerComponent,
    MyAccountComponent,
    LandingNavbarComponent
  ],
  imports: [
    MatNativeDateModule,
    FlexLayoutModule,
    NgxDatatableModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MaterialModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    ChartsModule,
    DropzoneModule.forRoot({}),
    RouterModule.forRoot(routes, {useHash: true}),
    MatIconModule,
    EmojifyModule,
    SimpleNotificationsModule.forRoot(),
    MentionModule,
    EmojiPickerModule.forRoot(),
  ],
  providers: [
    LoginService,
    WebSocketService,
    UserAccountService,
    AuthGuard,
    MatIconRegistry,
    SpotifyService,
    PartyService,
    QueueService,
    YouTubeService
  ],
  entryComponents: [ManagePartyComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
}
