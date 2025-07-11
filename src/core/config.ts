import { ClientOpt } from "./client";

// Configuración del PLC
// export const IP: string = "192.168.1.133";
// const IP: string = "192.168.163.218"
// export const IP: string = "192.168.0.128"
export const IP: string = "10.20.30.90" // Working with same WiFi network that the PLC
export const RACK: number = 0;
export const SLOT: number = 1;// Working with same WiFi network that the PLC
// export const SLOT: number = 2;
export const plcOpt = {
    IP,
    RACK,
    SLOT
}
export type DbOpt = {
  dbNumber: number;
  start: number;
  size: number;
  clientOpt: ClientOpt;
}