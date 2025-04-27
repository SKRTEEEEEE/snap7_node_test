import snap7 from "node-snap7";

export type ClientOpt= {
    IP: string;
    RACK: number;
    SLOT: number;
}

export abstract class PLCClient {
    protected client: snap7.S7Client;
    private clientOpt: ClientOpt

    constructor(clientOpt: ClientOpt) {
        this.client = new snap7.S7Client();
        this.clientOpt = clientOpt;
    }

    public connectPLC(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.ConnectTo(this.clientOpt.IP, this.clientOpt.RACK, this.clientOpt.SLOT, (err: number) => {
                if (err) {
                    reject(new Error(this.client.ErrorText(err)));
                } else {
                    resolve();
                }
            });
        });
    }

    public disconnectPLC() {
        this.client.Disconnect();
    }

    public getPlcStatus(): string {
        const status = this.client.PlcStatus();
        if (status === false) {
            return "Error obteniendo estado de la CPU";
        }
        switch (status) {
            case 0x08:
                return "CPU RUN";
            case 0x04:
                return "CPU STOP";
            default:
                return "CPU UNKNOWN";
        }
    }
}