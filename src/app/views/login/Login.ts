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

  loggingIn = false;
  loggedIn = false;

  constructor(private router: Router,
              private loginService: LoginService,
              private toastyService: ToastyService,
              private route: ActivatedRoute,
              fb: FormBuilder,) {
    this.loginForm = fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.loginService.account.subscribe(
      (token: UserAccount) => {
        if (token != null) {
          this.loggedIn = true;
          this.router.navigateByUrl('/');
        }
      },
      err => {
        this.loggedIn = false;
        console.log('error ' + err);
      },
    );
  }

  login() {
    this.loggingIn = true;
    window.location.href = `${environment.apiHost}/api/v1/login`;
  }

  getState() {
    return this.route.data['state'];
  }
}
