import { ClientOpt, PLCClient } from "./client";

export class ReadArea extends PLCClient {
  constructor(protected start: number, protected size: number, clientOpt: ClientOpt) {
    super(clientOpt);
  }

  protected readArea(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.client.ReadArea(0x83, 0, this.start, this.size, 0x02, (err: number, buffer: Buffer) => {
        if (err) {
          reject(new Error(this.client.ErrorText(err)));
        } else {
          resolve(buffer);
        }
      });
    });
  }

  public async readAreaBit(byte: number, bit: number): Promise<boolean> {
    const buffer = await this.readArea();
    return (buffer[byte] & (1 << bit)) !== 0;
  }

  public async readAreaByte(byte: number): Promise<number> {
    const buffer = await this.readArea();
    return buffer[byte];
  }

  public async readAreaInt(start: number): Promise<number> {
    const buffer = await this.readArea();
    return buffer.readInt16BE(start);
  }
}

