import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
	router: any;
  constructor(
    private auth: AuthService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
		// Check if there's a callback to handle
		if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
			this.auth.handleRedirectCallback$.subscribe(
				() => {
					console.log('Successfully handled redirect');
					// Navigate to the user page or dashboard after successful login
					this.router.navigate(['/tabs/user-page']);
				},
				(error) => {
					console.error('Error handling redirect callback:', error);
				}
			);
		}
	}
}