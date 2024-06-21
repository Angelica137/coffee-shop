import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-button',
  template: '<button (click)="login()">Log in</button>',
})
export class AuthButtonComponent {
  constructor(public auth: AuthService) {}

  login() {
    this.auth.login();
  }
}
