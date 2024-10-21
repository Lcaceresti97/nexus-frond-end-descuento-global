export interface DataTable {
    id?:any;
    resourceClient?:any;
    resourceName?:any;
    resourceDesc?:any
    resourceDisp?:any;
    resourceuentaServicio?:any;
    resourceLine?:any;
    resourceVigencia?:any;
    resourceEnd?:any;
    logUser?:any;
    fechaRegistro?:any;
    action?:any;
}

export interface LogModel {
    id?:number;
    idclient?:string;
    ctaService?:string;
    clientName?:string;
    ctaName?:string;
    discount?:number;
    useDiscount?:number;
    dispoDiscount?: number;
    floatDiscount?:number;
    initialDate?: Date | string;
    finalDate?: Date | string;
    newLines?:string;
    user?:string;
    date?: Date | string;
    action?: string;
    typeSubsidy?: number;
    typeSubsidyValue?: string;
    comment?: string;
}

export interface AccountServiceModel {
    nombre?:string;
    nombreComercial?:string;
    estado?:string;
    tipoCuenta?:string;
    integrationId?:string;
    location?:string;
    idCuentaServicio?:string;
}

export interface Item{
    id?:number;
    itemName?:string;
}

export interface PresupuestoGlobalModel {
    idclient?:string;
    cuentaServicio?:string;
    clientName?:string;
    ctaName?:string;
    discount?:number;
    useDiscount?:number;
    dispoDiscount?: number;
    floatDiscount?:number;
    initialDate?: Date | string;
    finalDate?: Date | string;
    newLines?:string;
    typeSubsidy?: number;
    typeSubsidyValue?: string;
    comment?: string;
}