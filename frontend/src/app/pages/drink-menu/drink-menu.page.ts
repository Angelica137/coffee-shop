import { Component, OnInit } from '@angular/core';
import { DrinksService, Drink } from '../../services/drinks.service';
import { ModalController } from '@ionic/angular';
import { DrinkFormComponent } from './drink-form/drink-form.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-drink-menu',
  templateUrl: './drink-menu.page.html',
  styleUrls: ['./drink-menu.page.scss'],
})
export class DrinkMenuPage implements OnInit {
  Object = Object;

  constructor(
    public auth: AuthService,  // Changed to public so it can be accessed in the template
    private modalCtrl: ModalController,
    public drinks: DrinksService
  ) { }

  ngOnInit() {
    this.loadDrinks();
  }

  loadDrinks() {
    console.log('Loading drinks...');
    this.drinks.getDrinks().subscribe(
      (response: any) => {
        console.log('Drinks response:', response);
        this.drinks.drinksToItems(response.drinks);
        console.log('Updated drinks:', this.drinks.items);
      },
      (error) => {
        console.error('Error fetching drinks', error);
      }
    );
  }

  async openForm(activedrink: any = null) { 
		console.log('Checking permission for get:drinks-detail');
		const canOpen = await this.auth.can('get:drinks-detail').toPromise();
		console.log('Can open?', canOpen);
		if (!canOpen) {
			console.log('User does not have permission to view drink details');
			return;
		}
	
		const modal = await this.modalCtrl.create({
			component: DrinkFormComponent,
			componentProps: { drink: activedrink, isNew: !activedrink }
		});
	
		modal.present();
	
		const { data } = await modal.onWillDismiss();
		if (data) {
			this.loadDrinks();
		}
	}
	
	async openModal(drinkDetails?: any) {
		const modal = await this.modalCtrl.create({
			component: DrinkFormComponent,
			componentProps: { drink: drinkDetails, isNew: !drinkDetails }
		});

    modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.loadDrinks();
    }
  }
}