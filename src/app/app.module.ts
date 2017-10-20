import {
  MatButtonModule,
  MatIconModule,
  MatIconRegistry,
  MatNativeDateModule,
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule, RequestOptions} from '@angular/http';

import {AppComponent} from './app.component';
import {LoginComponent} from './views/login/Login';
import {RouterModule, Routes} from '@angular/router';
import {AccountService} from './services/LoginService';
import {NavbarComponent} from './widgets/Navbar';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ChartsModule} from 'ng2-charts';
import {DropzoneModule} from 'ngx-dropzone-wrapper';
import {ToastyModule} from 'ng2-toasty';


import 'hammerjs';
import {AuthGuard} from './utils/AuthGuard';
import {WebSocketService} from './services/WebSocketService';
import {MaterialModule} from './material.module';
import {DefaultRequestOptions} from "./services/util/DefaultRequestOptions";
import {DurationPipe} from "./utils/DurationPipe";
import {MusicService} from "./services/SongService";
import {PartyService} from "./services/PartyService";
import {CreatePartyComponent} from "./views/party/CreateParty";
import {ViewPartyComponent} from "./views/party/ViewParty";
import {QueueService} from "./services/QueueService";
import {SongListItemComponent} from "./widgets/SongListItem";
import {QueueListItemComponent} from "./widgets/QueueListItem";
import {PartiesComponent} from "./views/party/Parties";

const routes: Routes = [
  {path: '', redirectTo: 'parties', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'parties', component: PartiesComponent},
  {path: 'party/create', component: CreatePartyComponent, canActivate: [AuthGuard]},
  {path: 'party/:id', component: ViewPartyComponent, canActivate: [AuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    CreatePartyComponent,
    ViewPartyComponent,
    DurationPipe,
    SongListItemComponent,
    QueueListItemComponent,
    PartiesComponent
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
    ToastyModule.forRoot(),
    DropzoneModule.forRoot({}),
    RouterModule.forRoot(routes, {useHash: true}),
    MatIconModule,
  ],
  providers: [
    {provide: RequestOptions, useClass: DefaultRequestOptions},
    AccountService,
    WebSocketService,
    AuthGuard,
    MatIconRegistry,
    MusicService,
    PartyService,
    QueueService
  ],
  entryComponents: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
