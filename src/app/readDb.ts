import { PLCClient } from "./client";
import { DbOpt } from "./config";

export type ReadDbOpt = DbOpt

export class ReadDB extends PLCClient {
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
  public async readString(start:number, end: number): Promise<string> {
    const buffer = await this.readDB();
    return buffer.toString("utf-8", start, end);
  }
  public async readInt(start:number): Promise<number> {
    const buffer = await this.readDB();
    return buffer.readInt16BE(start);
  }
  public async readBit(byte: number, bit: number): Promise<boolean> {
    const buffer = await this.readDB();
    return (buffer[byte] & (1 << bit)) !== 0;
  }
  public async readByte(byte: number): Promise<number> {
    const buffer = await this.readDB();
    return buffer[byte];
  }
  public async readTime(start: number): Promise<number> {
    const buffer = await this.readDB();
    return buffer.readInt32BE(start);
  }
}