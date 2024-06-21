import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const params = window.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      this.auth.handleRedirectCallback().subscribe({
        next: () => this.router.navigate(['/tabs/user-page']),
        error: (error) => console.error(error)
      });
    }
  }
}