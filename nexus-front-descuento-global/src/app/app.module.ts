import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgbModule, NgbPaginationModule, NgbAlertModule, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { JwBootstrapSwitchNg2Module } from "jw-bootstrap-switch-ng2";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { ArchwizardModule } from "angular-archwizard";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { HttpClientModule } from '@angular/common/http';
import { TagInputModule } from "ngx-chips";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GestionDescuentoComponent } from './components/gestion-descuento/gestion-descuento.component';
import { LogDescuentoComponent } from './components/log-descuento/log-descuento.component';
import { PluginComponent } from './components/plugin/plugin.component';
import { HistorialDescuentoComponent } from './components/historial-descuento/historial-descuento.component';
import { LogsTableComponent } from './components/module/logs/logs-table/logs-table.component';
import { LogsModalComponent } from './components/module/logs/logs-modal/logs-modal.component';
import { BudgetLogService } from './services/budget-log.service';

@NgModule({
  declarations: [
    AppComponent,
    GestionDescuentoComponent,
    LogDescuentoComponent,
    PluginComponent,
    HistorialDescuentoComponent,
    LogsTableComponent,
    LogsModalComponent,
  ],
  entryComponents: [
    LogsModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    NgbModule,
    NgbPaginationModule,
    NgbAlertModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    TagInputModule,
    AngularMultiSelectModule,
    JwBootstrapSwitchNg2Module,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ArchwizardModule,
    HttpClientModule
  ],
  providers: [NgbActiveModal],
  bootstrap: [AppComponent]
})
export class AppModule { }
