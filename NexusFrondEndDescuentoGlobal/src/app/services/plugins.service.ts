import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})

export class PluginsService {

  headers: HttpHeaders;
  urlNew = "/budget/new/"
  urlDelete = "/budget/assets/delete"
  urlEdit = "/budget/edit/"
  urlShow = "/budget/show/"
  urlLog = "/budget/logs/"
  urlBalance = "/budget/balance/"
  urlListA = "/budget/assets/list"
  urlListAll = "/budget/assets/all"
  urlNewA = "/budget/assets/new"
  urlA = "/budget/assets/"
  url = "/adapter/subscriber/execute/"
  urlAcaunt = "/adapter/attributes/execute"
  urlHist = "/budget/hist/all"
  private readonly localService = "/sibiel/";

  sub: string;
  public headersP;
  token: any[] = [];
  apiRequest: any[] = [];

  constructor(
    private _activeRouter: ActivatedRoute, private _http: HttpClient, private toastr: ToastrService, private router: Router
  ) {

    /*
     this._activeRouter.queryParams.subscribe(params => {
       this.sub = JSON.stringify(params['sub']);
       if (this.sub)
         sessionStorage.setItem('sub', this.sub)
     });
     */
  }

  public Show(codeClient) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.urlShow + codeClient).map((res) => res)
  }

  getShow(values:any): Observable<any> {
    return this._http
      .get(`${this.urlShow}${values}`, {
        observe: "response",
        headers: this.headers,
      });
  }

  public New(values) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.urlNew, values, { headers: this.headersP })
  }

  public Edit(values) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.urlEdit, values, {
      headers: this.headersP
    })
  }

  public delete(values) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.urlDelete, values, { headers: this.headersP })
  }

  public Logs(codeClient, Account) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.urlLog + codeClient + "/" + Account).map((res) => res)
  }

  public Balance(codeClient, Account) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.urlBalance + codeClient + '/' + Account).map((res) => res)
  }

  public Assets(Transaction) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.urlA + Transaction).map((res) => res)
  }

  public AssetsNew(values) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.urlNewA, values, {
      headers: this.headersP
    })
  }

  public AssetList(values) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.urlListA, values, {
      headers: this.headersP
    })
  }

  public AllAssetList(idclient, account) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(`${this.urlListAll}?account=${account}&idClient=${idclient}`)
  }

  getHist(idClient) {
    this.headersP = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(`${this.urlHist}?idClient=${idClient}`)
  }

  callApi(formGroup: FormGroup, value, valueEdit) {
    this.token = JSON.parse(sessionStorage.getItem('sub')).toString().split(",");
    let form = formGroup.getRawValue();
    let jsonForm = JSON.stringify(form);
    jsonForm = JSON.parse(jsonForm)

    this.apiRequest['sub'] = this.token[0]
    this.apiRequest['resourceClient'] = jsonForm['txtClient']
    this.apiRequest['resourceDesc'] = jsonForm['txtDesc']
    this.apiRequest['resourceVigencia'] = jsonForm['dtVigencia']
    this.apiRequest['resourceEnd'] = jsonForm['dtEnd']

    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (!jsonForm['txtid']) {
      this.New(value).subscribe(data => {
        this.showNotification(1, 'Se ha Guardado con &Eacute;xito.')
      }, (error) => {
        this.showNotification(0, 'No ha sido Posible Guardar la Informaci&oacute;n')
      });
    } else {
      this.apiRequest['id'] = jsonForm['txtid']
      this.Edit(valueEdit).subscribe(data => {
        this.showNotification(1, 'Se ha Editado con &Eacute;xito.')
      }, (error => {
        this.showNotification(0, 'No se ha podido guardar la infotmaci&oacute;n')
      }))
    }
  }

  public GetParam(code) {
    let subscriber: Subscriber;
    let parameter: parameter;
    let parameters: parameter[] = [];
    let params: parameters

    parameter = {
      name: "CUSTOMER_CODE",
      value: code
    }

    parameters.push(parameter);

    params = {
      parameter: parameters
    }

    subscriber = {
      parameters: params,
      transactionId: "1"
    }

    this.headersP = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let header = { headers: this.headersP };

    return this._http.post(this.url, {
      "parameters": params,
      "transactionId": "1"
    }, header)
      .map((res) => res)
  }

  public GetAcaunt(code) {
    let subscriber: Subscriber;
    let parameter: parameter;
    let parameters: parameter[] = [];
    let params: parameters

    parameter = {
      name: "SUBSCRIBER",
      value: code
    }

    parameters.push(parameter);

    parameter = {
      name: "PROFILE",
      value: "C_SERVICIO"
    }

    parameters.push(parameter);

    params = {
      parameter: parameters
    }

    subscriber = {
      parameters: params,
      transactionId: "1"
    }

    this.headersP = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let header = { headers: this.headersP };

    return this._http.post(this.urlAcaunt, {
      "parameters": params
    }, header)
      .map((res) => res)
  }

  getSimpleDate = date => date.year + '-' + date.month + '-' + date.day;

  loadPermisos() {
    let subs = sessionStorage.getItem('sub').toString().split(",")
    let permisos = subs[2]

    return permisos.split('_')
  }

  showNotificationError(code) {
    let text
    let text2
    if (code == 302) {
      text = '<b>Error</b> la cuenta ya existe en base de datos';
      text2 = "alert alert-danger alert-with-icon";
    } else if (code == 400) {
      text = '<b>Error</b> La informacion enviada es incorrecta';
      text2 = "alert alert-danger alert-with-icon";
    } else if (code == 404) {
      text = '<b>Error</b> Registro no encontrado en base de datos';
      text2 = "alert alert-danger alert-with-icon";
    } else if (code == 401) {
      text = '<b>Error</b> No esta autorizado para realizar esta accion';
      text2 = "alert alert-danger alert-with-icon";
    } else if (code == 403) {
      text = '<b>Error</b> Forbidden';
      text2 = "alert alert-danger alert-with-icon";
    } else if (code == 500) {
      text = '<b>Error</b> Interno del servidor';
      text2 = "alert alert-danger alert-with-icon";
    }
    this.toastr.info(
      text,
      "",
      {
        timeOut: 2000,
        closeButton: true,
        enableHtml: true,
        toastClass: text2,
        positionClass: "toast-top-right"
      }
    );

  }

  showNotification(code, msj) {
    let text
    let text2 = "alert alert-success alert-with-icon"
    if (code == 1) {
      text = '<span class="now-ui-icons emoticons_satisfied"></span><b>Gesti&oacute;n &nbsp;</b>' + msj;;
      text2 = "alert alert-success alert-with-icon";
    } else {
      text = '<span class="now-ui-icons emoticons_times-circle"></span><strong>!Error!</strong> ' + msj;
      text2 = "alert alert-danger alert-with-icon";
    }
    if (code == 2) {
      text = '<b>Error</b> ' + msj;
      text2 = "alert alert-danger alert-with-icon";
    }
    setTimeout(() => {
      this.toastr.info(
        text,
        "", {
        timeOut: 20000,
        closeButton: true,
        enableHtml: true,
        toastClass: text2,
        positionClass: "toast-top-right"
      }
      );
    }, 1);
  }

  /**
 * Método encargado de consumir un servicio rest para traer los logs
 * por la cuenta del cliente y por la cuenta servicio
 * 
 */
  getLogs(customerAccount: any, serviceAccount: any): Observable<any> {
    return this._http
      .get(`${this.urlLog}${customerAccount}/${serviceAccount}`, {
        observe: "response",
        headers: this.headers,
      });
  }

  getAccountService(customerAccount:any): Observable<any> {
    return this._http
      .get(`${this.localService}query/service/accounts/customer/${customerAccount}`, {
        observe: "response",
        headers: this.headers,
      });
  }

}



export interface Subscriber {
  parameters: parameters,
  transactionId: string
}

export interface parameters {
  parameter: parameter[]
}

export interface parameter {
  name: string,
  value: string
}