import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PluginsService } from 'src/app/services/plugins.service';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-historial-descuento',
  templateUrl: './historial-descuento.component.html',
  styleUrls: ['./historial-descuento.component.css']
})
export class HistorialDescuentoComponent implements OnInit {

  //#region vars
  acountData
  cliente;
  cuentacl;
  cuentacliente: any;
  entries: number = 10;
  flot: any;
  formGroup: FormGroup;
  lFin
  lInicio
  loading: boolean = false;
  public dropdownList = [];
  public dropdownSettings = {};
  public selectedItems = [];
  resourceClient;
  resourceCta;
  resourceDesde;
  resourceDisp;
  resourceFlot;
  resourceGlob;
  resourceHasta;
  resourceName;
  resourceUtil;
  resourceuentaServicio;
  resourseCuentaCliente;
  rows: any[] = [];
  saving: boolean = false
  temp;
  today = new Date();
  use: any;
  selectedItemsExport;
  dropdownListExport;
  dropdownSettingsExport
  //#endregion

  constructor(
    private toastr: ToastrService,
    private _plugService: PluginsService,
    private _activeRouter: ActivatedRoute,
    public frm: FormBuilder
  ) {
    this.dropdownSettings = {
      singleSelection: true,
      text: "Cuenta",
      selectAllText: "Todos",
      unSelectAllText: "Ninguno",
      enableSearchFilter: true,
      classes: ""
    };
    this.selectedItems = [];
    this.dropdownList = []
  }

  ngOnInit() {
    this.formGroup = this.frm.group(
      {
        txtClient: [''],
        txtName: [''],
        dtDesde: ['', Validators.required],
        dtEnd: ['', Validators.required],
        txtCuentaServicio: [''],
        cboCta: [''],
        txtGlobal: [''],
        txtUtilizado: [''],
        txtFlotante: [''],
        txtDisponible: ['']
      }
    );
    this._activeRouter.params.subscribe(params => {
      if (params["num"]) {
        this.search(params["num"])
      }
      this.resourceClient = params["num"];
    })

    this.dropdownListExport = [
      { id: 1, itemName: "Excel" },
      { id: 2, itemName: "Pdf" },
    ];

    this.selectedItemsExport = [
      { id: 1, itemName: "Excel" }
    ]

    this.dropdownSettingsExport = {
      singleSelection: true,
      text: "Exportar a:",
      enableSearchFilter: true
    };
  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }


  search(num) {
    this._plugService.getHist(num).subscribe((data: any[]) => {
      if (data.length > 0) {
        data.forEach(element => {
          this.rows.push({
            accion: element.ACCION,
            canal: element.CANAL,
            cuentaservicio: element.CUENTA_SERVICIO,
            descuento: element.DESCUENTO,
            descuentodetalle: element.DESCUENTO_DETALLE,
            descuentoflotante: element.DESCUENTO_FLOTANTE,
            descuentoutilizado: element.DESCUENTO_UTILIZADO,
            equipo: element.EQUIPO,
            fechadetalle: element.FECHA_DETALLE,
            id: element.ID,
            idcliente: element.IDCLIENTE,
            lineasnuevas: element.LINEAS_NUEVAS,
            nombrecliente: element.NOMBRE_CLIENTE,
            nombrecuentaservicio: element.NOMBRE_CUENTA_SERVICIO,
            tipopresupuesto: element.TIPO_PRESUPUESTO,
            transaccion: element.TRANSACCION,
            vigenciafinal: element.VIGENCIA_FINAL,
            vigenciainicial: element.VIGENCIA_INICIAL
          })
        });
        this.rows
        this.buildAccounts(data)
      } else {
        this._plugService.showNotificationError(404)
      }
    }, (error: HttpErrorResponse) => {
      this._plugService.showNotificationError(error.status)
      this.loading = false
    }, () => {
      this.loading = false
    })
  }

  buildAccounts(data: any[]) {
    data.forEach(element => {
      if (this.dropdownList.filter(x => x.itemName == element.CUENTA_SERVICIO).length == 0) {
        this.dropdownList.push({
          id: element.ID,
          itemName: element.CUENTA_SERVICIO,
          resourceName: element.NOMBRE_CLIENTE,
          resourceuentaServicio: element.NOMBRE_CUENTA_SERVICIO,
          resourceGlob: element.DESCUENTO,
          resourceUtil: element.DESCUENTO_UTILIZADO,
          resourceFlot: element.DESCUENTO_FLOTANTE,
          resourceDisp: element.DESCUENTO - (element.DESCUENTO_UTILIZADO + element.DESCUENTO_FLOTANTE)
        })
      }
    });
  }

  onItemSelect(event) {

    this.resourceName = event.resourceName
    this.resourceuentaServicio = event.resourceuentaServicio
    this.resourceGlob = event.resourceGlob
    this.resourceUtil = event.resourceUtil
    this.resourceFlot = event.resourceFlot
    this.resourceDisp = event.resourceDisp


    this.temp = this.rows.filter(x => x.CUENTA_SERVICIO == event.itemName)

    this.temp = this.rows.map((prop, key) => {
      return {
        ...prop,
        ids: key
      };
    })
  }

  filterTable($event) {
    let val = $event.target.value;
    this.temp = this.rows.filter(function (d) {
      for (var key in d) {
        if (d[key]) {
          if (d[key].toString().toLowerCase().indexOf(val.toString().toLowerCase()) !== -1) {
            return true;
          }
        }
      }
      return false;
    });
  }

  export() {
    if (this.resourceCta && this.resourceCta.length > 0) {
      if (this.selectedItemsExport[0].id == 1) {
        let fileName = `Cliente${this.resourceClient}-Cuenta${this.resourceCta[0].itemName}.xlsx`;

        /* table id is passed over here */
        let element = document.getElementById('exporTable');

        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element, { raw: true });
        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */
        XLSX.writeFile(wb, fileName);
      } else {
        this.generatePdf()
      }
    } else {
      this._plugService.showNotification(2, "Seleccione una cuenta para poder continuar")
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

  generatePdf() {

    let formatData = new Array();

    formatData.push(
      [
        {text : "Codigo",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Cliente",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Cuenta de Servicio",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Descuento Global",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Descuento Utilizado",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Descuento Flotante",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Vigencia",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Hasta",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Linueas Nuevas",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Fecha de Registro",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Accion",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Canal",  fillColor: '#F6F6F6', color: '#000' },
        {text : "Transaccion",  fillColor: '#F6F6F6', color: '#000' },
      ],
    )

    let data = this.temp
    data.forEach(element => {
      delete element.realDate
      formatData.push([
        element.id,
        element.idcliente,
        element.cuentaservicio,
        element.descuento,
        element.descuentodetalle,
        element.descuentoflotante,
        new Date(element.vigenciainicial).toLocaleString(),
        new Date(element.vigenciafinal).toLocaleString(),
        element.lineasnuevas,
        new Date(element.fechadetalle).toLocaleString(),
        element.accion,
        element.canal,
        element.transaccion
      ]
      )
    });

    const documentDefinition = {
      pageOrientation: 'landscape',
      pageSize: 'LEGAL',
      content: [
        { text: " ", style: 'name' }, { text: " ", style: 'name' }, { text: " ", style: 'name' },
        {
          text: `Cliente: ${this.resourceClient} Cuenta: ${this.resourceCta[0].itemName}`,
          bold: true,
          fontSize: 14,
          alignment: 'center',
          decoration: 'underline',
          margin: [0, 0, 0, 20]
        },
        { text: " ", style: 'name' }, { text: " ", style: 'name' }, { text: " ", style: 'name' },
        {
          table: {
            headerRows: 1,
            body: formatData
          },
          fontSize: 8,
          layout: 'noBorders',
          color: '#354569'
        }
      ]
    }

    pdfMake.tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) {
          if (i === 0 || i === node.table.body.length) {
            return 0;
          }
          return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth: function (i) {
          return 0;
        },
        hLineColor: function (i) {
          return i === 1 ? 'black' : '#aaa';
        },
        paddingLeft: function (i) {
          return i === 0 ? 0 : 8;
        },
        paddingRight: function (i, node) {
          return (i === node.table.widths.length - 1) ? 0 : 8;
        }
      }
    };

    pdfMake.createPdf(documentDefinition).open();
  }

}
