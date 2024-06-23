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
    this.auth0Client$.subscribe(client => {
      this.auth0Client = client;  // THIS IS NEW!!!
      client.getIdTokenClaims().then(claims => {
        this.token = claims.__raw;
      });
    });
  }

	getToken(): string {
    return this.token;
  }

  private async checkAuth() {
    const client = await this.auth0Client$.toPromise();
    if (client) {
      const isAuthenticated = await client.isAuthenticated();
      this.isAuthenticated$.next(isAuthenticated);
      if (isAuthenticated) {
        const token = await client.getTokenSilently();
        this.token = token;
      }
    }
  }

	can(permission: string): Observable<boolean> {
		return this.auth0Client$.pipe(
			take(1),
			switchMap(client => from(client.getIdTokenClaims())),
			map(claims => {
				console.log('ID Token Claims:', claims);
				if (!claims) {
					console.error('No claims found');
					return false;
				}
				const permissions = claims['permissions'] || [];
				console.log('Permissions:', permissions);
				return permissions.includes(permission);
			}),
			catchError(err => {
				console.error('Error in can method:', err);
				return of(false);
			})
		);
	}

  login() {
    this.auth0Client$.pipe(
      take(1)
    ).subscribe(client => {
      client.loginWithRedirect({
        redirect_uri: `${window.location.origin}/callback`,
      });
    });
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
      switchMap(client => from(client.handleRedirectCallback())),
      tap(() => {
        this.isAuthenticated$.next(true);
      }),
      map(() => void 0)
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