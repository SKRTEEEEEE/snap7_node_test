import { ClientOpt } from "./client";
import { ReadArea } from "./readArea";

export class WriteArea extends ReadArea {
    constructor(start: number, size: number, clientOpt: ClientOpt) {
      super(start, size,clientOpt);
    }
  
    private async writeArea(buffer: Buffer): Promise<void> {
      return new Promise((resolve, reject) => {
        this.client.WriteArea(0x83, 0, this.start, this.size, 0x02, buffer, (err: number) => {
          if (err) {
            reject(new Error(this.client.ErrorText(err)));
          } else {
            resolve();
          }
        });
      });
    }
  
    public async writeAreaBit(byte: number, bit: number, bitValue: boolean): Promise<void> {
      const buffer = await this.readArea();
      if (bitValue) {
        buffer[byte] |= 1 << bit;
      } else {
        buffer[byte] &= ~(1 << bit);
      }
      await this.writeArea(buffer);
    }
  
  //   public async writeAreaByte(byte: number, value: number): Promise<void> {
  //     const buffer = await this.readArea();
  //     buffer[byte] = value;
  //     await this.writeArea(buffer);
  //   }
  
  //   public async writeAreaInt(start: number, value: number): Promise<void> {
  //     const buffer = await this.readArea();
  //     buffer.writeInt16BE(value, start);
  //     await this.writeArea(buffer);
  //   }
  }
  