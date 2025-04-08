import { ClientOpt } from "./client";

// Configuración del PLC
// export const IP: string = "192.168.1.133";
// const IP: string = "192.168.224.218"
export const IP: string = "192.168.12.218"
export const RACK: number = 0;
export const SLOT: number = 2;
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