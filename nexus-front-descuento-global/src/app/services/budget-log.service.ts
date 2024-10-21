import { HttpHeaders, HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BudgetLogService {

  // Props
  private readonly localUrl = "/budget/logs/";
  private readonly localService = "/sibiel/query/";
  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
  });

  constructor(private http: HttpClient) { }

  /**
   * Método encargado de consumir un servicio rest para traer los logs
   * por la cuenta del cliente y por la cuenta servicio
   * 
   */
  getLogs(customerAccount:any, serviceAccount: any): Observable<any> {
    return this.http
      .get(`${this.localUrl}${customerAccount}/${serviceAccount}`, {
        observe: "response",
        headers: this.headers,
      });
  }

   /**
   * Método encargado de consumir un servicio rest para traer los logs
   * por la cuenta del cliente y por la cuenta servicio
   * 
   */
   getAccountService(customerAccount:any): Observable<any> {
    return this.http
      .get(`${this.localService}service/accounts/customer/${customerAccount}`, {
        observe: "response",
        headers: this.headers,
      });
  }
  
}
