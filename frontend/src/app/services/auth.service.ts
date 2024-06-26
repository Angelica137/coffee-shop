import { Injectable } from '@angular/core';
import createAuth0Client, { Auth0Client, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, tap, map, shareReplay, take, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0Client$ = from(createAuth0Client({
    domain: environment.auth0.domain,
    client_id: environment.auth0.clientId,
    redirect_uri: `${window.location.origin}/callback`,
    audience: environment.auth0.authorizationParams.audience
  })).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );

  isAuthenticated$ = new BehaviorSubject<boolean>(false);

	private token: string = '';
	private auth0Client: Auth0Client;

  constructor() {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      this.auth0Client = client;
      this.checkAuth();
    });
  }

	getToken(): string {
    return this.token;
  }

	can(permission: string): Observable<boolean> {
		return this.getTokenClaims().pipe(
			map(claims => {
				console.log('Full Token Claims:', JSON.stringify(claims, null, 2));
				if (!claims) {
					console.error('No claims found');
					return false;
				}
				const permissions = claims['permissions'] || [];
				console.log('Permissions:', permissions);
				console.log('Checking for permission:', permission);
				return permissions.includes(permission);
			}),
			catchError(err => {
				console.error('Error in can method:', err);
				return of(false);
			})
		);
	}

  private checkAuth(): void {
    this.auth0Client$.pipe(
      switchMap((client: Auth0Client) => from(client.isAuthenticated())),
      tap(isAuthenticated => {
        this.isAuthenticated$.next(isAuthenticated);
        console.log('Is authenticated:', isAuthenticated);
        if (isAuthenticated) {
          this.getTokenClaims().subscribe();
        }
      })
    ).subscribe();
  }

	getTokenClaims(): Observable<any> {
		return this.auth0Client$.pipe(
			switchMap((client: Auth0Client) => from(client.getTokenSilently())),
			switchMap(token => from(this.parseJwt(token))),
			tap(claims => {
				console.log('Token claims:', claims);
				if (claims) {
					this.token = claims.__raw;
				}
			}),
			catchError(error => {
				console.error('Error getting token claims:', error);
				return of(null);
			})
		);
	}
	
	private parseJwt(token: string): Promise<any> {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
		return Promise.resolve(JSON.parse(jsonPayload));
	}

  login() {
		this.auth0Client$.pipe(take(1)).subscribe((client: Auth0Client) => {
			client.loginWithRedirect({
				redirect_uri: `${window.location.origin}/callback`,
				audience: environment.auth0.authorizationParams.audience,
				scope: 'openid profile email get:drinks-detail',
				state: this.generateRandomState()
			});
		});
	}
	
	private generateRandomState(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

  logout() {
    this.auth0Client$.pipe(
      take(1)
    ).subscribe(client => {
      client.logout({
        returnTo: window.location.origin
      });
    });
  }

  handleRedirectCallback(): Observable<void> {
		return this.auth0Client$.pipe(
			take(1),
			switchMap((client: Auth0Client) => {
				console.log('Handling redirect callback');
				return from(client.handleRedirectCallback()).pipe(
					tap((redirectResult) => {
						console.log('Redirect result:', redirectResult);
						this.isAuthenticated$.next(true);
					}),
					catchError(error => {
						console.error('Error handling redirect callback:', error);
						console.error('Error details:', JSON.stringify(error, null, 2));
						this.isAuthenticated$.next(false);
						return throwError(error);
					}),
					map(() => undefined)
				);
			})
		);
	}

  getTokenSilently(options?: GetTokenSilentlyOptions): Observable<string> {
    return this.auth0Client$.pipe(
      take(1),
      switchMap(client => from(client.getTokenSilently(options)))
    );
  }

  getActiveJWT(): Observable<string> {
    return this.getTokenSilently();
  }

  getUser$(): Observable<any> {
    return this.auth0Client$.pipe(
      take(1),
      switchMap(client => from(client.getUser()))
    );
  }
  
}