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
		this.auth.isAuthenticated$.subscribe(
			(isAuthenticated) => {
				console.log('Is authenticated:', isAuthenticated);
				if (isAuthenticated) {
					this.auth.getUser$().subscribe(
						(user) => {
							console.log('User:', user);
						},
						(error) => {
							console.error('Error getting user:', error);
						}
					);
				}
			}
		);
	}
}