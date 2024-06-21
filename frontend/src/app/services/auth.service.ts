import { Injectable } from '@angular/core';
import createAuth0Client, { Auth0Client, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, tap, map, shareReplay, take, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';


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

  constructor() {
    this.auth0Client$.pipe(
      switchMap((client: Auth0Client) => from(client.isAuthenticated())),
      tap(isAuthenticated => this.isAuthenticated$.next(isAuthenticated))
    ).subscribe();
  }




  private async checkAuth() {
    const client = await this.auth0Client$.toPromise();
    if (client) {
      const isAuthenticated = await client.isAuthenticated();
      this.isAuthenticated$.next(isAuthenticated);
    }
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

  can(permission: string): Observable<boolean> {
    return this.getUser$().pipe(
      switchMap(user => {
        if (!user) {
          return of(false);
        }
        const permissions = user['https://your-domain.com/permissions'] || [];
        return of(permissions.includes(permission));
      }),
      catchError(() => of(false))
    );
  }
}