import { PLCClient } from "./client";
import { DbOpt } from "./config";

export type ReadDbOpt = DbOpt

export class ReadDB extends PLCClient {
  // Función para leer datos de la DB
  constructor(protected dbOpt: ReadDbOpt) {
    super(dbOpt.clientOpt);
  }
  protected readDB(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        this.client.DBRead(this.dbOpt.dbNumber, this.dbOpt.start, this.dbOpt.size, (err: number, buffer: Buffer) => {
            if (err) {
                reject(new Error(this.client.ErrorText(err)));
            } else {
                resolve(buffer);
            }
        });
    });
  }
  // Función para string
  public async readDBString(start:number, end: number): Promise<string> {
    const buffer = await this.readDB();
    return buffer.toString("utf-8", start, end);
  }
  // Función para int
  public async readDBInt(start:number): Promise<number> {
    const buffer = await this.readDB();
    return buffer.readInt16BE(start);
  }
  // Función para bit
  public async readDBBit(byte: number, bit: number): Promise<boolean> {
    const buffer = await this.readDB();
    return (buffer[byte] & (1 << bit)) !== 0;
  }
  // Función para byte
  public async readDBByte(byte: number): Promise<number> {
    const buffer = await this.readDB();
    return buffer[byte];
  }
}