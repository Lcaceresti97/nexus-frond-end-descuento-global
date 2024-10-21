import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PluginComponent } from "./components/plugin/plugin.component";
import { GestionDescuentoComponent } from "./components/gestion-descuento/gestion-descuento.component" ;
import { from } from 'rxjs';

const routes: Routes = [
  {path: 'mov', component: PluginComponent},
  {path: 'mov/:num', component: PluginComponent},
  {path: 'jj', component: GestionDescuentoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
