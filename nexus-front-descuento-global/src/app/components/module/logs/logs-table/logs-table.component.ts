import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountServiceModel, Item, LogModel } from 'src/app/model/model';
import { LogsModalComponent } from '../logs-modal/logs-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PluginsService } from 'src/app/services/plugins.service';
import { BudgetLogService } from 'src/app/services/budget-log.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-logs-table',
  templateUrl: './logs-table.component.html',
  styleUrls: ['./logs-table.component.css']
})
export class LogsTableComponent implements OnInit {

  // Props

  // PARAMS
  param: any = "0";

  // Styles
  inputClasses = "my-auto col-sm-12 col-md-3 col-lg-3";

  // Tables
  rows: LogModel[] = [];
  rows2: LogModel[] = [];
  loadingIndicator: boolean = true;
  resultsPerPage: number = 5;
  searchedValue: string = "";
  typeValue: string = "";

  // Select Service Account
  public dropsownSettings = {};
  public dropDownList = [];

  public selectedItem = [];

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private _plugService: PluginsService) { }

  async ngOnInit() {

    this.param = this.route.snapshot.paramMap.get('num');

    this.dropsownSettings = {
      singleSelection: true,
      text: "Seleccione un valor",
      selectAllText: "Uno",
      unSelectAllText: "Ninguno",
      enableSearchFilter: true,
      classes: ""
    };

    if (this.param != "0" && this.param != undefined && this.param != "undefined") {
      await this.getAccountService(this.param);
      //console.log(this.dropDownList);
    }

  }

  // Methods
  search() {
    this.rows = this.rows2.filter((rowsSimcardControl) => {
      return JSON.stringify(rowsSimcardControl)
        .toLowerCase()
        .includes(this.searchedValue.toString().toLowerCase());
    });
  }

  getTotalText() {
    return this.rows.length == 1 ? "Registro" : "Registros";
  }

  openModalCrud(data: LogModel) {

    // Se abre la modal
    const modalRef = this.modalService.open(LogsModalComponent, {
      size: 'lg'
    });

    // Se pasa el input
    modalRef.componentInstance.data = data;

  }

  /**
   * Método del select
   * 
   * @param event 
   */
  async onItemSelect(event) {

    this.selectedItem = [event];

    if (this.param != "0" && this.param != undefined && this.param != "undefined") {
      //console.log(event.itemName);
      const VALIDATE_DATA = await this.getLogs(this.param, event.itemName);

      if(!VALIDATE_DATA){
        this.rows = [];
        this.rows = this.rows;
        this.rows2 = [];
        this.rows = this.rows2;
      }

    } else {

      this._plugService.showNotification(0, '¡Debe de ingresar un valor en la barra de búsqueda de Nexus!')
    }

  }

  onItemDeSelect(event) {
    this.selectedItem = [];
  }


  // Methods Rest
  getLogs(customerAccount: any, serviceAccount: any): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this._plugService.getLogs(customerAccount, serviceAccount).subscribe((response) => {

        if (response.status === 200) {

          this.rows = [];
          this.rows2 = [];
          let pipe = new DatePipe('en-US')

          const providerResponse = response.body as LogModel[];

          providerResponse.map((dataOk) => {

            let dto: LogModel = dataOk;
            dto.dispoDiscount = dto.discount - dto.useDiscount - dto.floatDiscount;
            dto.initialDate = pipe.transform(new Date(dto.initialDate), 'yyyy-MM-dd, h:mm a');
            dto.finalDate = pipe.transform(new Date(dto.finalDate), 'yyyy-MM-dd, h:mm a');
            dto.date = pipe.transform(new Date(dto.date), 'yyyy-MM-dd, h:mm a');
            dto.typeSubsidyValue = dto.typeSubsidy==1 ? "Análisis de Rentabilidad" : dto.typeSubsidy==2 ? "Presupuesto Global" : "No contiene";

            this.rows.push(dto);

          });

          this.rows = this.rows;
          this.rows2 = this.rows;
          this.loadingIndicator = false;

          if (this.rows.length > 0) {
            this._plugService.showNotification(1, "Datos cargados");
          } else {
            this._plugService.showNotification(0, "No se encontraron datos");
          }

          resolve(true);

        } else {
          this._plugService.showNotification(0, "No se encontraron datos");
          resolve(false);
        }

      }, (error) => {
        this._plugService.showNotification(0, "No se encontraron datos");
        resolve(false);
      });

    });

  }


  getAccountService(customerAccount: any): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this._plugService.getAccountService(customerAccount).subscribe((response) => {

        if (response.status === 200) {

          const providerResponse = response.body as AccountServiceModel[];
          let id: number = 0;
          providerResponse.map((dataOk) => {
            id = id + 1;
            let dto: Item = {
              id: id,
              itemName: dataOk.nombre
            }
            this.dropDownList.push(dto)

          });

          //this.dropDownList = this.dropDownList;

          if (this.dropDownList.length > 0) {

          } else {
            this._plugService.showNotification(0, `La cuenta ${this.param} no tiene cuentas servicios activas`);
          }

          resolve(true);

        } else {
          resolve(false);
        }

      }, (error) => {
        resolve(false);
      });

    });

  }


}
