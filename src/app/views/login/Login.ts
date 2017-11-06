import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {ToastyService} from 'ng2-toasty';
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
              private toastyService: ToastyService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.loginForm = fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
    this.signupForm = fb.group({
      displayName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
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
          this.router.navigate(['parties']).then(() => {
            window.location.reload(true);
          });
        }
      },
      err => {
        this.loggedIn = false;
        console.log('error ' + err);
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
      this.loginService.setAccount(res.account);
      this.router.navigate(['parties']).then(() => {
        window.location.reload(true);
      });
    });
  }

  emailSignup() {
    this.signingUp = true;

    this.loginService.register(this.signupForm.value).subscribe(res => {
      this.toastyService.info('Your account has been created. Logging you in...');
      this.loginService.setAccount(res);
      this.router.navigate(['parties']).then(() => {
        window.location.reload(true);
      });
    }, err => {
      this.toastyService.error(`Sign up failed. ${err}`);
    });
  }

  getState() {
    return this.route.data['state'];
  }
}
