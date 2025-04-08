//@ts-nocheck

import { connectPLC, disconnectPLC, getPlcStatus, ReadDB, WriteDB } from "../app";
const DB_NUMBER: number = 3;
const START_ADDRESS: number = 0;
const SIZE: number = 259;
const main = async (): Promise<void> => {
    try {
        await connectPLC();
        console.log("✅ Conectado al PLC");


        // Obtener estado de la CPU
        const statusMessage: string = getPlcStatus();
        console.log(`Estado de la CPU: ${statusMessage}`);

        // Leer datos de la DB
        const readDB = new ReadDB(DB_NUMBER, START_ADDRESS, SIZE);

        // Leer string de la DB
        const string = await readDB.readDBString(2, 256);
        console.log(`String: ${string}`);

        // Leer int de la DB
        const int = await readDB.readDBInt(256);
        console.log(`Int: ${int}`);

        // Leer bit de la DB
        const bit = await readDB.readDBBit(258, 0);
        console.log(`Bit: ${bit}`)

        const writeDB = new WriteDB(DB_NUMBER, START_ADDRESS, SIZE);
        if(bit){
            await writeDB.writeDBBit(258, 1, true);
        } else {
            await writeDB.writeDBBit(258, 1, false);
        }

    } catch (error) {
        console.error(error);
    } finally {
        // Desconectar del PLC
        disconnectPLC();
        console.log("❌ Desconectado del PLC");
    }
}

main()