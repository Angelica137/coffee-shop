import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthCallbackComponent } from '../app/components/auth-callback.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
  { path: 'tabs/user-page', loadChildren: './pages/user-page/user-page.module#UserPagePageModule' },
  { path: 'callback', component: AuthCallbackComponent },
	{ path: '', redirectTo: 'tabs/user-page', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
