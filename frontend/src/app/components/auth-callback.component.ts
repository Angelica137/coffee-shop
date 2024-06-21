import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-auth-callback',
  template: '<div>Processing login...</div>'
})
export class AuthCallbackComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.handleRedirectCallback$.subscribe({
      next: () => {
        this.router.navigate(['/tabs/user-page']);
      },
      error: (error) => {
        console.error('Error handling redirect callback:', error);
        this.router.navigate(['/']);
      }
    });
  }
}