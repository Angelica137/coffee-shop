import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.page.html',
  styleUrls: ['./user-page.page.scss'],
})
export class UserPagePage {
  constructor(public auth: AuthService) {}

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}
