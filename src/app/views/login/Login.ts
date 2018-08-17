import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {NotificationsService} from 'angular2-notifications';
import {UserAccount} from "../../models/UserAccount";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'login',
  templateUrl: './Login.html',
  styleUrls: ['./Login.scss'],
  animations: [routerTransition()],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;

  loggingIn = false;
  loggedIn = false;
  signingUp = false;

  referrer: string = null;

  constructor(private router: Router,
              private loginService: LoginService,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.loginForm = fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
    this.signupForm = fb.group({
      displayName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.referrer = params['referrer'];
    });

    this.loginService.account.subscribe(
      (token: UserAccount) => {
        if (token != null && token.id > 0) {
          this.loggedIn = true;
          this.router.navigate(['/parties']);
        }
      },
      err => {
        this.loggedIn = false;
      },
    );
  }

  spotifyLogin() {
    this.loggingIn = true;

    if (this.referrer != null) {
      window.location.href = `${environment.apiHost}/api/v1/spotify/login?redirectUrl=${this.referrer}`;
    } else {
      window.location.href = `${environment.apiHost}/api/v1/spotify/login`;
    }
  }

  emailLogin() {
    this.loggingIn = true;

    this.loginService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(res => {
      this.loggingIn = false;
    }, error => {
      this.loggingIn = false;
      this.notificationsService.error("Unable to login, please check your details");
    });
  }

  emailSignup() {
    this.signingUp = true;

    this.loginService.register(this.signupForm.value).subscribe(res => {
      this.signingUp = false;
      this.notificationsService.info('Your account has been created. Logging you in...');
      this.loginService.setToken(res.loginToken);
      this.router.navigate(['parties']).then(() => {
        window.location.reload(true);
      });
    }, err => {
      this.notificationsService.error(`Sign up failed. ${err}`);
      this.signingUp = false;
    });
  }

  getState() {
    return this.route.data['state'];
  }
}
