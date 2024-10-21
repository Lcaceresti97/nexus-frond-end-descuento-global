import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'
import { ToastrService } from "ngx-toastr";
import { DatePipe } from '@angular/common';
import { PluginsService } from '../../services/plugins.service';
import 'rxjs/add/operator/filter';
import { error } from 'util';
import { ConstantPool } from '@angular/compiler';


@Component({
  selector: 'app-log-descuento',
  templateUrl: './log-descuento.component.html',
  styleUrls: ['./log-descuento.component.css']
})
export class LogDescuentoComponent implements OnInit {

  formGroup: FormGroup;
  public dropdownList = [];
  public selectedItems = [];
  public dropdownSettings = {};
  resourceClient;
  resourceName;
  resourceDesde;
  resourceHasta;
  resourseCuentaCliente;
  resourceuentaServicio;
  resourceCta;
  resourceFlot;
  resourceDisp;
  resourceGlob;
  resourceUtil;
  cuentacl;
  cliente;
  lInicio
  lFin
  saving: boolean = false
  today = new Date();
  loading: boolean = false;
  temp;
  rows: any = [];
  entries: number = 10;
  flot: any;
  use: any;
  cuentacliente: any;
  acountData

  constructor(private toastr: ToastrService,
    private _plugService: PluginsService,
    private _activeRouter: ActivatedRoute,
    public frm: FormBuilder
  ) {
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
  }

  ngOnInit() {
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

  onItemSelect(item: any) {
    this.loading = true
    this._plugService.Show(this.resourceClient).subscribe(data => {
      this.acountData = data
      let response = data
      let nombre = response[0]['clientName']
      let descuento = response[0]['discount']

      if (descuento != undefined) {

        let cta = response[0]['cuentaServicio']
        this.resourceName = nombre;
        this.dropdownList = []
        for (let i in data) {
          this.dropdownList.push({ id: i, itemName: data[i]['cuentaServicio'], name: data[i]['ctaName'] });
        }
      } else {
        this._plugService.showNotification(0, "No fue posible hacer la consulta")
        this.loading = false
      }
      this.loading = false
    }, (error) => {
      this._plugService.showNotification(0, 'No existe la cuenta en el sistema')
      this.loading = false
    }, () => {
      this.loading = false
      let resp = this.acountData.filter(x => x['cuentaServicio'] == item['itemName'])[0]
      this.resourseCuentaCliente = resp['idcliente']
      this.resourceuentaServicio = resp['ctaName']
      this.cliente = this.resourseCuentaCliente

      this.cuentacl = resp['cuentaServicio'];

      this.resourceUtil = resp['useDiscount']
      this.resourceFlot = resp['floatDiscount']
      this.resourceGlob = resp['discount']
      this.resourceDisp = (this.resourceGlob - this.resourceUtil - this.resourceFlot)
    });



  }

  entriesChange($event) {
    this.entries = $event.target.value; 
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(1), ms)).then();
  }

  getSimpleDate = date => date.year + '-' + date.month + '-' + date.day;

  loadPermiso(permiso) {
    let permisos = this._plugService.loadPermisos();
    if (permisos.filter(x => x == permiso).length > 0) {
      return false
    } else {
      return true
    }
  }

  search(code) {

    this.loading = true

    this.delay(0).then(any => {

      this._plugService.Show(code).subscribe(data => {
        this.acountData = data
        let response = data
        let nombre = response[0]['clientName']
        let descuento = response[0]['discount']

        if (descuento != undefined) {

          let cta = response[0]['cuentaServicio']
          this.resourceCta = []
          this.resourceName = nombre;
          this.dropdownList = []
          for (let i in data) {
            this.dropdownList.push({ id: i, itemName: data[i]['cuentaServicio'], name: data[i]['ctaName'] });
          }
        } else {
          this._plugService.showNotification(0, "No fue posible hacer la consulta")
          this.loading = false
        }

      }, (error) => {
        this._plugService.showNotification(0, 'No existe la cuenta en el sistema')
        this.loading = false
      });

    });
    this.loading = false

    return 1
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

  searchCta(cuenta) {
    this._plugService.GetAcaunt(cuenta).subscribe(data => {
      let resp = JSON.parse(data['parameters']['parameter'][0]['value'])
      //2-C1527
      this.resourseCuentaCliente = resp[0]['value']
      this.resourceuentaServicio = resp[2]['value']
      this.cliente = this.resourseCuentaCliente
      this.cuentacl = cuenta;
      this._plugService.Show(this.resourseCuentaCliente).subscribe(data => {
        let response = data
        this.resourceUtil = response[0]['useDiscount']
        this.resourceFlot = response[0]['floatDiscount']
        this.resourceGlob = response[0]['discount']
        this.resourceDisp = (this.resourceGlob - this.resourceUtil - this.resourceFlot)

      })
    }, (error) => {
    })
  }

  btnConsultar_Click() {
    if (this.formGroup.valid) {
      this.temp = []
      this.rows = []
      let consulta
      this.loading = true

      this.lInicio = this.getSimpleDate(this.resourceDesde)
      this.lFin = this.getSimpleDate(this.resourceHasta)

      let pipe = new DatePipe('en-US')
      let fechitaIni = pipe.transform(this.lInicio, 'yyyy-MM-dd') + 'T00:00:00.000+0000'
      let fechitaFini = pipe.transform(this.lFin, 'yyyy-MM-dd') + 'T23:59:59.000+0000'
      let fechaRegistro

      consulta = JSON.stringify({
        "idclient": this.resourseCuentaCliente,
        "ctaService": this.cuentacl,
        "initialDate": fechitaIni,
        "finalDate": fechitaFini
      });



      this._plugService.AssetList(consulta).subscribe(data => {

        this.rows = []
        let datarow = data
        let rows = new Array();

        for (let i in datarow) {
          rows = new Array();
          fechaRegistro = pipe.transform(datarow[i]["date"], 'yyyy-MM-dd hh:mm:ss a')
          rows['resourceEquipo'] = datarow[i]["asset"],
            rows['resourceFecha'] = fechaRegistro,
            rows['resourceDesc'] = datarow[i]["discount"],
            rows['action'] = datarow[i]["action"],
            rows['resourceCanal'] = datarow[i]["channel"],
            rows['resourceTrans'] = datarow[i]["transaction"]

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
        this._plugService.showNotification(0, '<b>No existen datos con el rango de fecha especificado</b>')
        this.loading = false
      });
    } else {
      this._plugService.showNotification(0, '<b><strong>!Cuidado!</strong> uno o mas campos requeridos estan vacíos</b>')
      this.loading = false
    }

  }

}
