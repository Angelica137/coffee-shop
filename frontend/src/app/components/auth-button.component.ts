import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-button',
  template: `
     <ion-button (click)="auth.login()" *ngIf="!(auth.isAuthenticated$ | async)">Log In</ion-button>
     <ion-button (click)="auth.logout()" *ngIf="auth.isAuthenticated$ | async">Log Out</ion-button>
		`
})
export class AuthButtonComponent {
  constructor(public auth: AuthService) {}

  login() {
    this.auth.login();
  }
}
