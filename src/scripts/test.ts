import snap7 from "node-snap7";

const client = new snap7.S7Client();

// Configuración del PLC 
// const IP: string = "192.168.1.133";
// const IP: string = "192.168.224.218"
const IP:string = "10.20.30.90"
const RACK: number = 0;
const SLOT: number = 1;
// for nº3
const DB_NUMBER: number = 1;
const START_ADDRESS: number = 0;
const SIZE: number = 14;

// Función para conectar al PLC
const connectPLC = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        client.ConnectTo(IP, RACK, SLOT, (err: number) => {
            if (err) {
                reject(new Error(client.ErrorText(err)));
            } else {
                resolve();
            }
        });
    });
};

// Función para obtener el estado de la CPU
const getPlcStatus = (): string => {
    const status = client.PlcStatus();
    
    if (status === false) {
        return "Error obteniendo estado de la CPU";
    }

    switch (status) {
        // case Status.S7CpuStatusRun:
        case 0x08:
            return "CPU RUN";
        // case Status.S7CpuStatusStop:
        case 0x04:
            return "CPU STOP";
        // case Status.S7CpuStatusUnknown:
        default:
            return "CPU UNKNOWN";
    }
};

// Función para leer datos de la DB
const readDB = (dbNumber: number, start: number, size: number): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        client.DBRead(dbNumber, start, size, (err: number, buffer: Buffer) => {
            if (err) {
                reject(new Error(client.ErrorText(err)));
            } else {
                resolve(buffer);
            }
        });
    });
};

// Función principal
const main = async (): Promise<void> => {
    try {
        await connectPLC();
        console.log("✅ Conectado al PLC");

        // Obtener información de la CPU
        const plcInfo = client.GetCpuInfo();
        console.log(`Module Type: ${plcInfo.ModuleTypeName}`);

        // Obtener estado de la CPU
        const statusMessage: string = getPlcStatus();
        console.log(`Estado de la CPU: ${statusMessage}`);

         // Leer datos de la DB
         const buffer: Buffer = await readDB(DB_NUMBER, START_ADDRESS, SIZE);

         //For 's300' example db configuration
         // Leer el valor STRING (del byte 2 al 256)
        //  const productName: string = buffer.toString("utf-8", 2, 256).replace(/\x00/g, "");
        //  console.log(`PRODUCT NAME: ${productName}`);
 
        //  // Leer el valor INT (bytes 256-257)
        //  const productValue: number = buffer.readUInt16BE(256);
        //  console.log(`PRODUCT VALUE: ${productValue}`);
 
        //  // Leer el valor BOOL (byte 258)
        //  const productStatus: boolean = Boolean(buffer[258]);
        //  console.log(`PRODUCT STATUS: ${productStatus}`);

         
    } catch (error) {
        console.error("❌ Error:", (error as Error).message);
    } finally {
        client.Disconnect(); // Desconectar del PLC
        console.log("🔌 Desconectado del PLC");
    }
};

// Ejecutar
main();
