import { DbOpt } from "./config";
import { ReadDB } from "./readDb";

export type WriteDbOpt = DbOpt

export class WriteDB extends ReadDB {
    constructor(protected writeDbOpt: WriteDbOpt) {super(writeDbOpt);}
  
    private async writeDB(buffer: Buffer): Promise<void> {
      try {
        return new Promise((resolve, reject) => {
          this.client.DBWrite(this.writeDbOpt.dbNumber, this.writeDbOpt.start, this.writeDbOpt.size, buffer, (err: number) => {
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
    
    public async writeTime(start: number, milliseconds: number): Promise<void> {
      try {
        const buffer = await this.readDB();
        buffer.writeInt32BE(milliseconds, start);
        await this.writeDB(buffer);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  
    public async writeBit(byte: number, bit: number, bitValue: boolean): Promise<void> {
      
     try {
      const buffer = await this.readDB();
      if (bitValue) {
        buffer[byte] |= 1 << bit; 
      } else {
        buffer[byte] &= ~(1 << bit); 
      }
      await this.writeDB(buffer);
     } catch (error) {
      return Promise.reject(error);
     }
    }
  }
  