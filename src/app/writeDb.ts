import { ClientOpt } from "./client";
import { ReadDB } from "./readDb";

export type WriteDbOpt = {
  dbNumber: number;
  start: number;
  size: number;
  clientOpt: ClientOpt;
}

export class WriteDB extends ReadDB {
    constructor(protected writeDbOpt: WriteDbOpt) {super(writeDbOpt.dbNumber, writeDbOpt.start, writeDbOpt.size, writeDbOpt.clientOpt);}
  
    private async writeDB(buffer: Buffer): Promise<void> {
      try {
        return new Promise((resolve, reject) => {
          this.client.DBWrite(this.dbNumber, this.start, this.size, buffer, (err: number) => {
            if (err) {
              reject(new Error(this.client.ErrorText(err)));
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  
    //Poner el bit al contrario de lo que este
    public async writeDBBit(byte: number, bit: number, bitValue: boolean): Promise<void> {
      
     try {
      const buffer = await this.readDB();
      if (bitValue) {
        buffer[byte] |= 1 << bit; // Poner el bit en 1
      } else {
        buffer[byte] &= ~(1 << bit); // Poner el bit en 0
      }
      await this.writeDB(buffer);
     } catch (error) {
      return Promise.reject(error);
     }
    }
  }
  