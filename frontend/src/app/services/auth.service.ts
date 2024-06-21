import { Injectable } from '@angular/core';
import createAuth0Client, { Auth0Client, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';
import { from, Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, concatMap, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth0Client$ = (from(
    createAuth0Client({
      domain: environment.auth0.domain,
      client_id: environment.auth0.clientId,
      audience: environment.auth0.authorizationParams.audience,
      redirect_uri: environment.auth0.authorizationParams.redirect_uri
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );

  isAuthenticated$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap(res => this.loggedIn = res)
  );

  handleRedirectCallback$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
  );

  private userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();

  loggedIn: boolean = false;

  constructor() {
    this.localAuthSetup();
    this.handleAuthCallback();
  }

  getUser$(options?: GetTokenSilentlyOptions): Observable<any> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap(user => this.userProfileSubject$.next(user))
    );
  }

  private localAuthSetup() {
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          return this.getUser$();
        }
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  login() {
		this.auth0Client$.subscribe((client: Auth0Client) => {
			client.loginWithRedirect({
				redirect_uri: `${window.location.origin}/callback`,
				appState: { target: '/tabs/user-page' }
			});
		});
	}

  private handleAuthCallback() {
		// Only handle the callback if there's a code and state in the URL
		if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
			this.handleRedirectCallback$.subscribe({
				next: (redirectResult) => {
					// Get the intended redirect path from appState
					const targetRoute = redirectResult.appState && redirectResult.appState.target ? redirectResult.appState.target : '/';
					
					// Redirect to the intended route
					window.location.replace(targetRoute);
				},
				error: (err) => {
					console.error('Error handling redirect callback:', err);
					// Redirect to a default route or show an error message
					window.location.replace('/');
				}
			});
		}
	}

  logout() {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.logout({
        returnTo: `${window.location.origin}`
      });
    });
  }

  getTokenSilently$(options?: GetTokenSilentlyOptions): Observable<string> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getTokenSilently(options)))
    );
  }

  can(permission: string): Observable<boolean> {
    return this.getUser$().pipe(
      switchMap(user => {
        if (!user) {
          return of(false);
        }
        const permissions = user['https://your-domain.com/permissions'] || [];
        return of(permissions.includes(permission));
      })
    );
  }

	getActiveJWT(): Observable<string> {
    return this.getTokenSilently$();
  }

  // Add this method to simulate the previous build_login_link functionality
  build_login_link(callbackPath: string = ''): string {
    const redirectUri = `${window.location.origin}${callbackPath}`;
    return `${environment.auth0.domain}/authorize?audience=${environment.auth0.authorizationParams.audience}&response_type=token&client_id=${environment.auth0.clientId}&redirect_uri=${redirectUri}`;
  }

  // Add these methods to maintain compatibility with your existing code
  load_jwts() {
    // This method is now a no-op as the SDK handles token management
    console.log('load_jwts called - this is now handled by the Auth0 SDK');
  }

  check_token_fragment() {
    // This method is now a no-op as the SDK handles token parsing
    console.log('check_token_fragment called - this is now handled by the Auth0 SDK');
  }

}