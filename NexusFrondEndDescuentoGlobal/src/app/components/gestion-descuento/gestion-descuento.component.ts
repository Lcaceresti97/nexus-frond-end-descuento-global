import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'
import { EventEmitter } from 'events';
import { DatePipe } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { PluginsService } from '../../services/plugins.service';
import 'rxjs/add/operator/filter';
import { error } from 'util';
import { HttpErrorResponse } from '@angular/common/http';
import { messages } from 'src/app/utils/enum';
import { AccountServiceModel, Item, LogModel, PresupuestoGlobalModel } from 'src/app/model/model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogsModalComponent } from '../module/logs/logs-modal/logs-modal.component';

@Component({
  selector: 'app-gestion-descuento',
  templateUrl: './gestion-descuento.component.html',
  styleUrls: ['./gestion-descuento.component.css']
})

export class GestionDescuentoComponent implements OnInit {

  // Props

  // Table
  rowsCurrent: LogModel[] = [];
  rowsFilter: LogModel[] = [];
  loadingIndicator: boolean = true;
  resultsPerPage: number = 5;
  searchedValue: string = "";
  typeValue: string = "";

  // Form
  formGroup: FormGroup;
  messages = messages;
  accountCustomer: string = null;

  // Para el tipo de subsidio
  subsidy: any = 0;

  // Para la cuenta de servicio
  accountService: any = 0;

  id;
  logUser;
  fechaRegistro;
  resourceID;
  action;

  // Valores de búsqueda de las cuentas servicios
  resourseCuentaCliente;
  resourCuentaName;



  resourceClient;
  resourceName;

  // Valores que se muestra en pantalla
  resourceDesc: any = 0; // Descuento
  resourceVigencia; // Fecha inicial
  resourceEnd; // Fecha final
  resourceLine; // Checkbox
  resourceDisp; // Disponible
  resourceuentaServicio; // Valor que aparece a la par del multi-select
  comment

  resourceCuenta;

  valorDiabled = null
  lInicio
  disabled: boolean = false
  lFin
  cheked: boolean = false
  saving: boolean = false
  today = new Date();
  loading: boolean = false;

  // Security
  temp;
  sub;

  // Table - No está en uso
  rows: any = [];
  entries: number = 10;
  found: number = 0;
  use: any = 0;
  flot: any = 0;
  loadingB = false

  // Angular-Select

  // Estos son para los tipos o motivos de subsidios
  public dropsownSettingsTypeSubsidy = {};
  public dropDownListTypeSubsidy = [
    { id: 1, itemName: "Análisis de Rentabilidad" }, { id: 2, itemName: "Presupuesto Global" }
  ];

  public selectedItem = [];

  // Estos son para las cuentas servicios
  public dropsownSettingsAccountService = {};
  public dropDownListService = [];

  public selectedItemAccountService = [];

  //Disabled Buttons
  disabledSave: boolean = true; // Inhabilita si es true
  disabledOther: boolean = true; // Habilita si es false

  constructor(
    private toastr: ToastrService,
    private _plugService: PluginsService,
    private _activeRouter: ActivatedRoute,
    public frm: FormBuilder,
    private modalService: NgbModal
  ) {

    this._activeRouter.queryParams.subscribe(params => {
      this.sub = JSON.stringify(params['sub']);
      if (this.sub)
        sessionStorage.setItem('sub', this.sub)
    });

    // Inicio del formulario
    this.formGroup = this.frm.group(
      {
        txtid: [''],
        txtClient: ['', Validators.required],
        txtName: [''],
        txtDesc: ['', Validators.required],
        dtVigencia: ['', Validators.required],
        dtEnd: ['', Validators.required],
        txtCuenta: ['', Validators.required],
        txtCuentaServicio: [''],
        txtDisp: [''],
        chkLine: [''],
        txtDisponible: [''],
        additionalSubsidy: ['', Validators.required],
        comment: ['', Validators.required],
      }
    );

    // Iniciando el select personalizado
    this.dropsownSettingsTypeSubsidy = {
      singleSelection: true,
      text: "Seleccione un valor",
      selectAllText: "Todos",
      unSelectAllText: "Ninguno",
      enableSearchFilter: true,
      classes: ""
    };

    this.dropsownSettingsAccountService = {
      singleSelection: true,
      text: "Seleccione un valor",
      selectAllText: "Todos",
      unSelectAllText: "Ninguno",
      enableSearchFilter: true,
      classes: ""
    };

    // Se valida si se ingreso una cuenta o no
    this._activeRouter.params.subscribe(async (params) => {
      if (params["num"]) {
        this.accountCustomer = params["num"];

        // Buscamos la cuenta facturación
        const VALIDATE_BILLING_ACCOUNT = await this.searchBillingAccount(params["num"]);

        // Validamos si existe para buscar las cuentas de servicios
        if (VALIDATE_BILLING_ACCOUNT) {
          const VALIDATE_ACCOUNT_SERVICE = await this.getAccountService(params["num"]);

          if (!VALIDATE_ACCOUNT_SERVICE) {
            this._plugService.showNotification(0, `No se encontraron cuentas servicios con la cuenta cliente ${this.accountCustomer}`);
          }

        } else {
          
        }

        //this.search(params["num"])
      }
      this.resourceClient = params["num"];
    })

  }

  ngOnInit() {

  }

  // New Methods
  // Select Personalizados

  // Metodos para los subsidios
  onItemSelectTypeSubsidy(event: any) {
    // Actualizar el valor de selectedItemBrancheOffices
    //console.log(event);
    this.subsidy = event.id;
  }

  onItemDeSelectTypeSubsidy(event: any) {
    // Actualizar el valor de selectedItemBrancheOffices
    this.subsidy = 0;
    this.selectedItem = [];
    //console.log(this.selectedItem);
  }


  // Métodos para las cuentas de servicios
  onItemSelectAccountService(event: any) {
    // Actualizar el valor de selectedItemBrancheOffices
    //console.log(event);
    this.resourceCuenta = event.itemName;
    //console.log(this.resourceCuenta);
    this.searchCta(event.itemName);
  }

  onItemDeSelectAccountService(event: any) {
    //this.subsidy = 0;

  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }

  /**
   * Método que filtra en la tabla
   * 
   */
  filterTable($event) {
    let val = $event.target.value;
    this.temp = this.rows.filter(function (d) {
      for (var key in d) {
        if (d[key].toString().toLowerCase().indexOf(val.toString()) !== -1) {
          return true;
        }
      }
      return false;
    });
  }

  searchData() {
    this.rowsCurrent = this.rowsFilter.filter((rowsSimcardControl) => {
      return JSON.stringify(rowsSimcardControl)
        .toLowerCase()
        .includes(this.searchedValue.toString().toLowerCase());
    });
  }

  getTotalText() {
    return this.rowsCurrent.length == 1 ? "Registro" : "Registros";
  }

  // Modal
  openModalCrud(data: LogModel) {

    // Se abre la modal
    const modalRef = this.modalService.open(LogsModalComponent, {
      size: 'lg'
    });

    // Se pasa el input
    modalRef.componentInstance.data = data;

  }


  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(1), ms)).then();
  }

  getSimpleDate = date => date.year + '-' + date.month + '-' + date.day;


  /**
   * Método encargado de llenar loc campos de la pantalla, junto con la tabla 
   * No está en uso
   * 
   */
  async cargarPantall(code, cta) {
    this.loading = true
    this.delay(1).then(any => {

      // Servicio que sirve para llenar la tabla que aparece abajo
      this._plugService.Logs(code, cta).subscribe(data => {
        this.rows = []
        let datarow = data
        let disponible
        let rows = new Array();
        let fechaInicial
        let fechaFin
        let fechaRegistro
        let pipe = new DatePipe('en-US')

        // For que recorre todos los registros para mapear los logs
        for (let i in datarow) {
          rows = new Array();
          fechaInicial = pipe.transform(new Date(datarow[i]["initialDate"]), 'yyyy-MM-dd, h:mm a')
          fechaFin = pipe.transform(new Date(datarow[i]["finalDate"]), 'yyyy-MM-dd, h:mm a')
          fechaRegistro = pipe.transform(new Date(datarow[i]["date"]), 'yyyy-MM-dd, h:mm a')
          disponible = datarow[i]["discount"] - datarow[i]["useDiscount"] - datarow[i]["floatDiscount"]


          rows['id'] = datarow[i]["id"]
          rows['resourceClient'] = datarow[i]["idclient"]
          rows['resourceName'] = datarow[i]["clientName"]
          rows['resourceDesc'] = datarow[i]["discount"]
          rows['resourceDisp'] = disponible
          rows['resourceuentaServicio'] = datarow[i]["ctaService"]
          rows['resourceLine'] = datarow[i]["newLines"]
          rows['resourceVigencia'] = fechaInicial
          rows['resourceEnd'] = fechaFin
          rows['logUser'] = datarow[i]["user"]
          rows['fechaRegistro'] = fechaRegistro
          rows['action'] = datarow[i]["action"]

          this.rows.push(rows)
        }
        this.temp = this.rows
        this.temp = this.rows.map((prop, key) => {
          return {
            ...prop,
            ids: key
          };
        })
        this.loading = false
      }, (error) => {
        this.temp = []
        this.cargarData()
      }, () => {
        this.cargarData()
      });
    });
    this.loading = false
    return this.found
  }


  loadData(): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this._plugService.getShow(this.resourseCuentaCliente).subscribe((response) => {

        if (response.status === 200) {


          //console.log(response.body);

          const presupuestoGlobalResponse = response.body as PresupuestoGlobalModel[];

          //console.log(presupuestoGlobalResponse[0]);


          if (presupuestoGlobalResponse.length > 0) {

            presupuestoGlobalResponse.map((dataOk) => {
            
              /**
              * Validamos si el la información correcta del servicio
              * 
              */
              if (dataOk.cuentaServicio == this.resourceCuenta) {
                this.use = dataOk.useDiscount;
                this.flot = dataOk.floatDiscount;
                let vigencia = dataOk.initialDate.toString();

                // Setea el objeto del input vigencia que se visualiza en pantalla
                this.lInicio = {
                  year: parseInt(vigencia.split('-')[0]),
                  month: parseInt(vigencia.split('-')[1]),
                  day: parseInt(vigencia.split('-')[2])
                }

                // Setea el objeto del input hasta que se visualiza en pantalla
                let hasta = dataOk.finalDate.toString();
                this.resourceEnd = {
                  year: parseInt(hasta.split('-')[0]), month: parseInt(hasta.split('-')[1]),
                  day: parseInt(hasta.split('-')[2])
                }

                this.resourceVigencia = this.lInicio
                this.resourceDesc = dataOk.discount;
                this.resourceDisp = (this.resourceDesc - this.use - this.flot)
                this.comment = dataOk.comment;
                this.subsidy = dataOk.typeSubsidy;

                // Agregamos el campo de tipo de subsidio
                if (dataOk.typeSubsidy == 1) {
                  let item: Item = {
                    id: dataOk.typeSubsidy,
                    itemName: "Análisis de Rentabilidad"
                  }
                  this.selectedItem.push(item);
                  const controlSubsidy = this.formGroup.get('additionalSubsidy') as FormControl;
                  controlSubsidy.setValue(this.selectedItem);
                }

                if (dataOk.typeSubsidy == 2) {
                  let item: Item = {
                    id: dataOk.typeSubsidy,
                    itemName: "Presupuesto Global"
                  }
                  this.selectedItem.push(item);
                  const controlSubsidy = this.formGroup.get('additionalSubsidy') as FormControl;
                  controlSubsidy.setValue(this.selectedItem);
                }

                let line = dataOk.newLines;

                if (line == 'S' || line == 's') {
                  this.resourceLine = true
                } else {
                  this.resourceLine = false
                }


              }
            });

          } else {
            this._plugService.showNotification(0, `No se encontro información con la cuenta servicio ${this.resourceCuenta}`);
          }

          if (this.found == 1) {
            //this.disabled = true
            this.valorDiabled = 'true'
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


  /**
   * No está en uso
   * 
   */
  cargarData() {

    // Consulta la tabla PRESUPUESTO_GLOBAL por la cuenta del cliente
    this._plugService.Show(this.resourseCuentaCliente).subscribe(data => {

      //console.log(data);
      let response = JSON.parse(JSON.stringify(data))
      //console.log(response);

      // Valida si es la cuenta correcta
      response = response.filter(x => x['cuentaServicio'] == this.resourceCuenta)

      if (response.length > 0) {
        this.use = response[0]['useDiscount']
        this.flot = response[0]['floatDiscount']
        let vigencia = response[0]['initialDate']

        // Setea el objeto del input date que se visualiza en pantalla
        this.lInicio = {
          year: parseInt(vigencia.split('-')[0]),
          month: parseInt(vigencia.split('-')[1]),
          day: parseInt(vigencia.split('-')[2])
        }

        let hasta = response[0]['finalDate']
        this.resourceEnd = {
          year: parseInt(hasta.split('-')[0]), month: parseInt(hasta.split('-')[1]),
          day: parseInt(hasta.split('-')[2])
        }

        this.resourceVigencia = this.lInicio
        this.resourceDesc = response[0]['discount']
        this.resourceDisp = (this.resourceDesc - this.use - this.flot)
        let line = response[0]['newLines']

        if (line == 'S' || line == 's') {
          this.resourceLine = true
        } else {
          this.resourceLine = false
        }
      }
    })

    if (this.found == 1) {
      //this.disabled = true
      this.valorDiabled = 'true'
    }
  }

  /**
   * Método que busca por cuenta 
   * 
   * @param cuenta 
   */
  searchCta(cuenta) {

    /**
     * Si no se encontro el dato de cliente entonces
     * no se puede hacer la busquedad de los
     * demás campos
     * 
     */
    if (this.resourceName != null && this.resourceName != undefined) {
      this.found = 0
      this.resetFormError()
      this.temp = []
      this.loadingB = true

      // Valida si existe el registro por la cuenta del cliente y por la cuenta servicio
      this._plugService.Balance(this.resourceClient, this.resourceCuenta).subscribe((data: any) => {
        this.disabled = true
      }, () => {
        this.disabled = false
      })

      // Consume un servicio para traer los datos de la cuenta
      this._plugService.GetAcaunt(cuenta).subscribe(async (data) => {
        let resp = JSON.parse(data['parameters']['parameter'][0]['value'])
        this.loadingB = false

        /**
         * Se valida que la cuenta cliente existe en el cbs según la
         * cuenta de servicio que se selecciono
         * 
         */
        if (this.resourseCuentaCliente == resp[0]['value']) {

          // Encapsulamos la cuenta servicio
          this.resourceuentaServicio = resp[2]['value']

          // Hace una consulta a la tabla principal y valida si es la misma cuenta servicio
          //this.cargarPantall(this.resourseCuentaCliente, this.resourceCuenta)
          const VALIDATE_DATA = await this.loadData();

          /**
           * Si existe información a mostrar en pantalla se mandan a llamar los logs de ese registro
           * 
           */
          if (VALIDATE_DATA) {
            await this.getLogs(this.accountCustomer, this.resourceCuenta);
            /**
            * Esta condición nos ayuda a desactivar o activar los botones,
            * si hay registros para la tabla, entonces, se inhabilita el
            * botón de guardar, sino no hay se inhabilita el botón de
            * modificar y eliminar.
            * 
            */
            if(this.rowsCurrent.length>0){
              this.disabledSave=true;
              this.disabledOther=false;
            }else{
              this.disabledSave=false;
              this.disabledOther=true;
            }

          }



        } else {
          this._plugService.showNotification(0, 'Esta cuenta no pertenece al cliente ingresado.')
          this.resetFormError()
          this.loadingB = false
        }
      }, (error) => {
        this.disabled = false
        this.valorDiabled = null
        this.loadingB = false
        this.resetFormError()
        this.disabledSave=true;
        this.disabledOther=true;
        this._plugService.showNotification(0, 'La cuenta solicitada no existe')
      })
    } else {
      this._plugService.showNotification(0, 'Debe ingresar un cliente para poder continuar')
    }
  }


  loadPermiso(permiso) {
    let permisos = this._plugService.loadPermisos();
    if (permisos.filter(x => x == permiso).length > 0) {
      return false
    } else {
      return true
    }
  }


  searchBillingAccount(code: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._plugService.GetParam(code).subscribe(data => {
        let resp = JSON.parse(data['parameters']['parameter'][1]['value'])
        let tipo = resp["bcs:QueryCustomerInfoResultMsg"]['QueryCustomerInfoResult']['bcs:Customer']['bcs:CustInfo']['bcc:CustType']
        this.loadingB = false
        if (tipo == 2) {
          this.resourceName = resp["bcs:QueryCustomerInfoResultMsg"]['QueryCustomerInfoResult']['bcs:Customer']['bcs:OrgInfo']['bcc:OrgName']
          this.resourseCuentaCliente = code
          this.loading = false
          resolve(true);
        }
        else {
          this._plugService.showNotification(0, 'Este usuario no es Corporativo')
          this.loading = false
          resolve(false);
        }
      }, () => {
        this._plugService.showNotification(0, 'Este cliente solicitado no existe')
        this.loadingB = false
        resolve(false);
      });

    });
  }


  /**
   * Ya no está en uso
   * 
   * @param code 
   */
  search(code) {

    this.loadingB = true
    this.loading = true

    this.delay(1).then(any => {

      this._plugService.GetParam(code).subscribe(data => {
        let resp = JSON.parse(data['parameters']['parameter'][1]['value'])
        let tipo = resp["bcs:QueryCustomerInfoResultMsg"]['QueryCustomerInfoResult']['bcs:Customer']['bcs:CustInfo']['bcc:CustType']
        this.loadingB = false
        if (tipo == 2) {
          this.resourceName = resp["bcs:QueryCustomerInfoResultMsg"]['QueryCustomerInfoResult']['bcs:Customer']['bcs:OrgInfo']['bcc:OrgName']
          this.resourseCuentaCliente = code
        }
        else {
          this._plugService.showNotification(0, 'Este usuario no es Corporativo')
        }
      }, () => {
        this._plugService.showNotification(0, 'Este cliente solicitado no existe')
        this.loadingB = false
      });

    });
    this.loading = false
  }

  btnGuardar_Click() {

    const dataForm: any = this.formGroup.value;
    dataForm.additionalSubsidy = this.subsidy;
    //console.log(dataForm);


    if (this.formGroup.valid) {
      let body;

      let sub = sessionStorage.getItem('sub').toString().split(",");
      let today = new Date();

      this.lInicio = this.getSimpleDate(this.resourceVigencia)
      this.lFin = this.getSimpleDate(this.resourceEnd)

      let pipe = new DatePipe('en-US')
      let fechitaIni = pipe.transform(this.lInicio, 'yyyy-MM-dd', 'GMT')
      let fechitaFini = pipe.transform(this.lFin, 'yyyy-MM-dd', 'GMT')

      let fecha = pipe.transform(today, 'yyyy-MM-dd')
      let chek

      if (this.resourceLine == true) {
        chek = 'S'
      } else {
        chek = 'N'
      }

      if (fechitaIni > fechitaFini) {
        this._plugService.showNotification(0, 'La Fecha Final debe ser mayor a la Fecha Inicial')
      } else {

        if (this.found == 1) {
          this._plugService.showNotification(0, 'La cuenta que desea guardar ya existe en base de datos')
        } else {
          if (fechitaIni < fecha) {
            this._plugService.showNotification(0, 'La Fecha de Inicio debe ser mayor o Igual a la Fecha Actual')
          } else {

            this.loadingB = true

            // Construye el JSON que se necesita
            body = JSON.stringify({
              "idclient": this.resourceClient,
              "ctaService": this.resourceCuenta,
              "clientName": this.resourceName,
              "ctaName": this.resourceuentaServicio,
              "discount": this.resourceDesc,
              "useDiscount": 0.00,
              "floatDiscount": 0.00,
              "initialDate": fechitaIni,
              "finalDate": fechitaFini,
              "newLines": chek,
              "user": sub[0].toString().replace('"', ''),
              "typeSubsidy": this.subsidy,
              "comment": this.comment
            })


            // Método que nos ayuda a crear un nuevo registro

            
            this._plugService.New(body).subscribe(async (data) => {
              this._plugService.showNotification(1, 'Registro guardado con exito')
              await this.getLogs(this.accountCustomer, this.resourceCuenta);

              // Deshabilitamos el botón guardar y habilitamos el de modificar y eliminar
              this.disabledSave=true;
              this.disabledOther=false;
            }, (error: HttpErrorResponse) => {
              this._plugService.showNotificationError(error.status)
              this.loadingB = false
            }, () => {
              this.disabled = true
              this.search(this.resourceClient)
            }
            )
            



          }
        }
      }

    } else {
      this._plugService.showNotification(0, 'Uno o mas campos requeridos se encuentran vacios')
    }

  }

  editBudget() {
    if (this.formGroup.valid) {
      this.resourceDisp = (this.resourceDesc - this.use - this.flot)
      if (this.resourceDisp > 0) {
        let edit;
        let sub = sessionStorage.getItem('sub').toString().split(","); let today = new Date();
        this.lInicio = this.getSimpleDate(this.resourceVigencia)
        this.lFin = this.getSimpleDate(this.resourceEnd)

        let pipe = new DatePipe('en-US')
        let fechitaIni = pipe.transform(this.lInicio, 'yyyy-MM-dd', 'GMT')
        let fechitaFini = pipe.transform(this.lFin, 'yyyy-MM-dd', 'GMT')
        let chek

        if (this.resourceLine == true) {
          chek = 'S'
        } else {
          chek = 'N'
        }

        if (fechitaIni > fechitaFini) {
          this._plugService.showNotification(0, 'La Fecha Final debe ser mayor a la Fecha Inicial')
        } else {

          edit = JSON.stringify({
            "idclient": this.resourceClient,
            "ctaService": this.resourceCuenta,
            "clientName": this.resourceName,
            "ctaName": this.resourceuentaServicio,
            "discount": this.resourceDesc,
            "useDiscount": this.use,
            "floatDiscount": this.flot,
            "initialDate": fechitaIni,
            "finalDate": fechitaFini,
            "newLines": chek,
            "user": sub[0].toString().replace('"', ''),
            "typeSubsidy": this.subsidy,
            "comment": this.comment
          });

          this.loadingB = true
          
          
          this._plugService.Edit(edit).subscribe(async(data) => {
            this._plugService.showNotification(1, 'Registro guardado con exito')
            await this.getLogs(this.accountCustomer, this.resourceCuenta);
          }, (error: HttpErrorResponse) => {
            this._plugService.showNotificationError(error.status)
            this.loadingB = false
          }, () => {
            this.loadingB = false
          })
          
          
        }
      } else {
        this._plugService.showNotification(0, 'El descuento disponible no puede ser negativo. Valor calculado: ' + this.resourceDisp)
      }
    } else {
      this._plugService.showNotification(0, 'Uno o mas campos requeridos se encuentran vacios')
    }
  }

  async deleteBudget() {
    if (this.formGroup.valid) {
      this.loadingB = true
      let sub = sessionStorage.getItem('sub').toString().split(",");
      this.lInicio = this.getSimpleDate(this.resourceVigencia)
      this.lFin = this.getSimpleDate(this.resourceEnd)

      let pipe = new DatePipe('en-US')
      let fechitaIni = pipe.transform(this.lInicio, 'yyyy-MM-dd', 'GMT')
      let fechitaFini = pipe.transform(this.lFin, 'yyyy-MM-dd', 'GMT')
      let request: PresupuestoGlobalHistDto = {
        account: this.resourceCuenta,
        idClient: this.resourceClient,
        user: sub[0].toString().replace('"', ''),
        presupuestoGlobalHist: await this.buildHist(),
        clientName: this.resourceName,
        ctaName: this.resourceuentaServicio,
        discount: this.resourceDesc.toString(),
        useDiscount: this.use,
        flodiscount: this.flot,
        initialDate: fechitaIni,
        finalDate: fechitaFini,
      }

      this._plugService.delete(request).subscribe((data: any) => {
        this._plugService.showNotification(1, 'Registro eliminado con exito')
      }, (error: HttpErrorResponse) => {
        this._plugService.showNotificationError(error.status)
        this.loadingB = false
      }, () => {
        this.resetForm()
        this.resetFormError()
        this.loadingB = false
      })
    } else {
      this._plugService.showNotification(0, 'Uno o mas campos requeridos se encuentran vacios')
    }
  }

  buildHist(): Promise<PresupuestoGlobalHist[]> {
    return new Promise((res) => {
      let histArray: PresupuestoGlobalHist[] = []
      this._plugService.AllAssetList(this.resourceClient, this.resourceCuenta).subscribe((data: any[]) => {
        if (data.length > 0) {
          let pipe = new DatePipe('en-US')

          let lInicio = pipe.transform(this.getSimpleDate(this.resourceVigencia), 'yyyy-MM-dd', 'GMT')
          let lFin = pipe.transform(this.getSimpleDate(this.resourceEnd), 'yyyy-MM-dd', 'GMT')

          let chek
          if (this.resourceLine == true) {
            chek = 'S'
          } else {
            chek = 'N'
          }
          data.forEach(element => {
            histArray.push({
              ACCION: element.action,
              CANAL: element.channel,
              CUENTA_SERVICIO: element.ctaService,
              DESCUENTO: this.resourceDisp,
              DESCUENTO_DETALLE: element.discount,
              DESCUENTO_FLOTANTE: this.flot,
              DESCUENTO_UTILIZADO: this.use,
              EQUIPO: element.asset,
              FECHA_DETALLE: element.date,
              IDCLIENTE: element.idclient,
              LINEAS_NUEVAS: chek,
              NOMBRE_CLIENTE: this.resourceName,
              NOMBRE_CUENTA_SERVICIO: this.resourceuentaServicio,
              TIPO_PRESUPUESTO: element.budgetType,
              TRANSACCION: element.transaction,
              VIGENCIA_FINAL: lInicio,
              VIGENCIA_INICIAL: lFin
            })
          });
        }
      }, () => {
        res([])
      }, () => {
        res(histArray);
      })
    });

  }

  resetForm() {
    this.valorDiabled = null
    this.disabled = false
    this.formGroup.controls['txtName'].reset()
    this.formGroup.controls['txtDesc'].reset()
    this.formGroup.controls['dtVigencia'].reset()
    this.formGroup.controls['dtEnd'].reset()
    this.formGroup.controls['txtCuenta'].reset()
    this.formGroup.controls['txtCuentaServicio'].reset()
    this.formGroup.controls['txtDisp'].reset()
    this.formGroup.controls['chkLine'].reset()
    this.formGroup.controls['txtDisponible'].reset()
    this.formGroup.controls['comment'].reset()
    this.temp = []
    this.loadingB = false

  }

  resetFormError() {
    this.resourceuentaServicio = null
    this.resourceDesc = null
    this.resourceDisp = null
    this.resourceVigencia = null
    this.resourceEnd = null
    this.resourceLine = null
    this.valorDiabled = null
    this.disabled = false
    this.temp = []
    this.selectedItem = [];
    this.comment = null;
    this.rowsCurrent = [];
    this.rowsFilter = [];
  }


  // Nuevos servicios rest

  /**
   * Método que trae las cuentas de servicio activas por 
   * la cuenta cliente que se ingresa en la barra de Nexus
   * 
   */
  getAccountService(customerAccount: any): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this._plugService.getAccountService(customerAccount).subscribe((response) => {

        if (response.status === 200) {

          this.dropDownListService = [];

          const providerResponse = response.body as AccountServiceModel[];
          let id: number = 0;
          providerResponse.map((dataOk) => {
            id = id + 1;
            let dto: Item = {
              id: id,
              itemName: dataOk.nombre
            }
            this.dropDownListService.push(dto)

          });

          this.dropDownListService = this.dropDownListService;

          if (this.dropDownListService.length > 0) {

          } else {
            this._plugService.showNotification(0, ``);
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


  /**
   * Método que trae los Logs filtrado por la cuenta cliente y
   * cuenta de servicio
   * 
   * @param customerAccount 
   * @param serviceAccount 
   * @returns 
   */
  getLogs(customerAccount: any, serviceAccount: any): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this._plugService.getLogs(customerAccount, serviceAccount).subscribe((response) => {

        if (response.status === 200) {

          this.rowsCurrent = [];
          this.rowsFilter = [];
          let pipe = new DatePipe('en-US')

          const providerResponse = response.body as LogModel[];

          providerResponse.map((dataOk) => {

            let dto: LogModel = dataOk;
            dto.dispoDiscount = dto.discount - dto.useDiscount - dto.floatDiscount;
            dto.initialDate = pipe.transform(new Date(dto.initialDate), 'yyyy-MM-dd, h:mm a');
            dto.finalDate = pipe.transform(new Date(dto.finalDate), 'yyyy-MM-dd, h:mm a');
            dto.date = pipe.transform(new Date(dto.date), 'yyyy-MM-dd, h:mm a');
            dto.typeSubsidyValue = dto.typeSubsidy == 1 ? "Análisis de Rentabilidad" : dto.typeSubsidy == 2 ? "Presupuesto Global" : "No contiene";

            this.rowsCurrent.push(dto);

          });

          this.rowsCurrent = this.rowsCurrent;
          this.rowsFilter = this.rowsCurrent;
          this.loadingIndicator = false;

          if (this.rowsCurrent.length > 0) {
            //this._plugService.showNotification(1, "Datos cargados");
          } else {
            //this._plugService.showNotification(0, "No se encontraron registros de transacciones");
          }

          resolve(true);

        } else {
          //this._plugService.showNotification(0, "No se encontraron registros de transacciones");
          resolve(false);
        }

      }, (error) => {
        //this._plugService.showNotification(0, "No se encontraron registros de transacciones");
        resolve(false);
      });

    });

  }



}




interface OnInit {
  ngOnInit(): void
}

export interface PresupuestoGlobalHistDto {
  account: string;
  idClient: string;
  presupuestoGlobalHist: PresupuestoGlobalHist[];
  user: string;
  clientName
  ctaName: string
  discount: string
  useDiscount: string
  initialDate: string
  finalDate: string
  flodiscount: any
}

export interface PresupuestoGlobalHist {
  ACCION: string;
  CANAL: string;
  CUENTA_SERVICIO: string;
  DESCUENTO: number;
  DESCUENTO_DETALLE: number;
  DESCUENTO_FLOTANTE: number;
  DESCUENTO_UTILIZADO: number;
  EQUIPO: string;
  FECHA_DETALLE: Date;
  IDCLIENTE: string;
  LINEAS_NUEVAS: string;
  NOMBRE_CLIENTE: string;
  NOMBRE_CUENTA_SERVICIO: string;
  TIPO_PRESUPUESTO: string;
  TRANSACCION: string;
  VIGENCIA_FINAL: string;
  VIGENCIA_INICIAL: string;
}
