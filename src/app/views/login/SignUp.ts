import {Component, OnInit} from '@angular/core';
import {LoginService} from '../../services/LoginService';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {routerTransition} from '../../utils/Animations';
import {NotificationsService} from 'angular2-notifications';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'sign-up',
  templateUrl: './SignUp.html',
  styleUrls: ['./SignUp.scss'],
  animations: [routerTransition()],
})
export class SignUpComponent implements OnInit {
  signupForm: FormGroup;

  loggedIn = false;
  signingUp = false;

  referrer: string = null;

  constructor(private router: Router,
              private loginService: LoginService,
              private notificationsService: NotificationsService ,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
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
  }

  spotifyLogin() {
    if (this.referrer != null) {
      window.location.href = `${environment.apiHost}/api/v1/spotify/login?redirectUrl=${this.referrer}`;
    } else {
      window.location.href = `${environment.apiHost}/api/v1/spotify/login`;
    }
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
