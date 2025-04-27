import snap7 from "node-snap7";



const client = new snap7.S7Client();

// Configuración del PLC
const IP = "192.168.1.133"
const RACK = 0;
const SLOT = 2;
// for nº1
const DB_NUMBER = 3;
const START_ADDRESS = 0;
const SIZE = 259; // Cantidad de bytes a leer

// Conectar al PLC
client.ConnectTo(IP, RACK, SLOT, (err) => {
    if (err) {
        console.error("Error de conexión:", client.ErrorText(err));
        return;
    }
    console.log("✅ Conectado al PLC");

    // Obtener información de la CPU
    const plcInfo = client.GetCpuInfo();
    console.log(`Module Type: ${plcInfo.ModuleTypeName}`);

    // Obtener estado de la CPU
    const status = client.PlcStatus();
    console.log(`Full info State: ${{plcInfo}}`);
    if(status == 4){
        console.log("CPU STOP");
    } else if(status == 8){
        console.log("CPU RUN");
    } else if(status == 0){
        console.log("CPU unknown"); 
    }
    console.log(`Status: ${status}`);

    // Leer datos de la DB
    client.DBRead(DB_NUMBER, START_ADDRESS, SIZE, (err, buffer) => {
        if (err) {
            console.error("Error en lectura:", client.ErrorText(err));
            client.Disconnect();
            return;
        }

        // Leer el valor STRING (del byte 2 al 256)
        const productName = buffer.toString("utf-8", 2, 256).replace(/\x00/g, "");
        console.log(`PRODUCT NAME: ${productName}`);

        // Leer el valor INT (bytes 256-257)
        const productValue = buffer.readUInt16BE(256);
        console.log(`PRODUCT VALUE: ${productValue}`);

        // Leer el valor BOOL (byte 258)
        const productStatus = Boolean(buffer[258]);
        console.log(`PRODUCT STATUS: ${productStatus}`);

        client.Disconnect(); // Desconectar del PLC
    });
});
