import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';
import { from, Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, concatMap, shareReplay } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _idToken: string;
  private _accessToken: string;
  private _payload: any;
  url = environment.auth0.domain;
  audience = environment.auth0.authorizationParams.audience;
  clientId = environment.auth0.clientId;
  callbackURL = environment.auth0.authorizationParams.redirect_uri;

  auth0Client$ = (from(
    createAuth0Client({
      domain: this.url,
      client_id: this.clientId,
      audience: this.audience,
      redirect_uri: this.callbackURL
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );

  isAuthenticated$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated()))
  );

  private userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  isAuthenticatedObservable$ = this.isAuthenticatedSubject$.asObservable();

  constructor(public jwtHelper: JwtHelperService) {
    this._idToken = '';
    this._accessToken = '';
    this._payload = null;
    this.localAuthSetup();
  }

  private localAuthSetup() {
    const checkAuth$ = this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.isAuthenticated())),
      tap(res => this.isAuthenticatedSubject$.next(res))
    );

    checkAuth$.subscribe();
  }

  login(redirectPath: string = '/') {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.loginWithRedirect({
        redirect_uri: `${window.location.origin}`,
        appState: { target: redirectPath }
      });
    });
  }

  async handleRedirectCallback() {
    const client = await this.auth0Client$.toPromise();
    const result = await client.handleRedirectCallback();
    const user = await client.getUser();
    this.setUser(user);
    return result;
  }

  logout() {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.logout({
        returnTo: `${window.location.origin}`
      });
    });
  }

  private setUser(user) {
    if (user) {
      this._accessToken = user.access_token;
      this._idToken = user.id_token;
      this.decodeToken(this._idToken);
      this.userProfileSubject$.next(user);
    }
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get idToken(): string {
    return this._idToken;
  }

	private generateNonce(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

  build_login_link(callbackPath = '') {
		const redirectUri = this.callbackURL + callbackPath;
		const responseType = 'token id_token';
		const scope = 'openid profile email';
		const nonce = this.generateNonce();
	
		// Store the nonce in localStorage so we can verify it later
		localStorage.setItem('auth_nonce', nonce);
	
		return `https://${this.url}/authorize?audience=${this.audience}&response_type=${responseType}&client_id=${this.clientId}&redirect_uri=${redirectUri}&scope=${scope}&nonce=${nonce}`;
  }

	verifyNonce(idToken: string): boolean {
		const payload = this.jwtHelper.decodeToken(idToken);
		const storedNonce = localStorage.getItem('auth_nonce');
		const tokenNonce = payload.nonce;
	
		if (tokenNonce !== storedNonce) {
			throw new Error('Invalid nonce!');
		}
	
		// Clear the stored nonce
		localStorage.removeItem('auth_nonce');
	
		return true;
	}

  decodeToken(token: string) {
    this._payload = this.jwtHelper.decodeToken(token);
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this._idToken);
  }

  loggedIn(): boolean {
    return this._idToken && !this.isTokenExpired();
  }

  can(permission: string): boolean {
    return this._payload && this._payload.permissions && this._payload.permissions.length && this._payload.permissions.indexOf(permission) >= 0;
  }

  load_jwts() {
    this.token = localStorage.getItem('JWTS_LOCAL_KEY') || null;
    if (this.token) {
      this.decodeToken(this.token);
    }
  }

  check_token_fragment() {
    const fragment = window.location.hash.substr(1).split('&')[0].split('=');
    if (fragment[0] === 'access_token') {
      this.token = fragment[1];
      this.set_jwt();
    }
  }

  set_jwt() {
    localStorage.setItem('JWTS_LOCAL_KEY', this.token);
    if (this.token) {
      this.decodeToken(this.token);
    }
  }

  get token(): string {
    return this._accessToken;
  }

  set token(value: string) {
    this._accessToken = value;
  }

  get activeJWT(): string {
    return this.token;
  }

  async loginWithPopup() {
    const client = await this.auth0Client$.toPromise();
    await client.loginWithPopup();
    const user = await client.getUser();
    this.setUser(user);
  }

  async loginWithRedirect() {
    const client = await this.auth0Client$.toPromise();
    await client.loginWithRedirect();
  }

	setTokens(accessToken: string, idToken: string) {
		if (this.verifyNonce(idToken)) {
			this._accessToken = accessToken;
			this._idToken = idToken;
			this.decodeToken(this._idToken);
		} else {
			// Handle the error - the nonce didn't match
			console.error('Nonce verification failed');
		}
	}
}
