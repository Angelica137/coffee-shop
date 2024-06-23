import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

export interface Drink {
  id: number;
  title: string;
  recipe: Array<{
          name: string,
          color: string,
          parts: number
        }>;
}

@Injectable({
  providedIn: 'root'
})
export class DrinksService {

  url = environment.apiServerUrl;

  public items: {[key: number]: Drink} = {};
  // = {
  //                             1: {
  //                             id: 1,
  //                             title: 'matcha shake',
  //                             recipe: [
  //                                   {
  //                                     name: 'milk',
  //                                     color: 'grey',
  //                                     parts: 1
  //                                   },
  //                                   {
  //                                     name: 'matcha',
  //                                     color: 'green',
  //                                     parts: 3
  //                                   },
  //                                 ]
  //                           },
  //                           2: {
  //                             id: 2,
  //                             title: 'flatwhite',
  //                             recipe: [

  //                                   {
  //                                     name: 'milk',
  //                                     color: 'grey',
  //                                     parts: 3
  //                                   },
  //                                   {
  //                                     name: 'coffee',
  //                                     color: 'brown',
  //                                     parts: 1
  //                                   },
  //                                 ]
  //                           },
  //                           3: {
  //                             id: 3,
  //                             title: 'cap',
  //                             recipe: [
  //                                   {
  //                                     name: 'foam',
  //                                     color: 'white',
  //                                     parts: 1
  //                                   },
  //                                   {
  //                                     name: 'milk',
  //                                     color: 'grey',
  //                                     parts: 2
  //                                   },
  //                                   {
  //                                     name: 'coffee',
  //                                     color: 'brown',
  //                                     parts: 1
  //                                   },
  //                                 ]
  //                           }
  //   };


  constructor(private auth: AuthService, private http: HttpClient) { }

  getHeaders(): Observable<{ headers: HttpHeaders }> {
    return this.auth.getActiveJWT().pipe(
      map((token) => ({ headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }))
    );
  }

	getDrinks() {
		return this.http.get(`${this.url}/drinks`);
	}

	getDrinkDetails(): Observable<any> {
		return this.auth.getTokenSilently().pipe(
			mergeMap(token => {
				const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
				return this.http.get(`${this.url}/drinks-detail`, { headers });
			}),
			catchError(error => {
				console.error('Error fetching drink details:', error);
				return throwError(error);
			})
		);
	}

  saveDrink(drink: Drink) {
    this.getHeaders().pipe(
      mergeMap(headers => {
        if (drink.id >= 0) { // patch
          return this.http.patch(this.url + '/drinks/' + drink.id, drink, headers);
        } else { // insert
          return this.http.post(this.url + '/drinks', drink, headers);
        }
      })
    ).subscribe((res: any) => {
      if (res.success) {
        this.drinksToItems(res.drinks);
      }
    });
  }

  deleteDrink(drink: Drink) {
    delete this.items[drink.id];
    this.getHeaders().pipe(
      mergeMap(headers => this.http.delete(this.url + '/drinks/' + drink.id, headers))
    ).subscribe((res: any) => {
      // Handle response if needed
    });
  }

  drinksToItems( drinks: Array<Drink>) {
    for (const drink of drinks) {
      this.items[drink.id] = drink;
    }
  }
}