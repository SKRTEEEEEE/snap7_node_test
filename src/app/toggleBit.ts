import { ReadArea } from "../app/readArea";
import { WriteArea, WriteAreaOpt } from "../app/writeArea";
import { ReadDB } from "./readDb";
import { WriteDB, WriteDbOpt } from "./writeDb";

export const toggleBitMForDuration = async (byte: number, bit: number, duration: number, readArea: ReadArea, writeAreaOpt: WriteAreaOpt) => {
    try {
        await readArea.connectPLC(); // Asegurarte de que la conexión está activa
        // Leer el estado actual del bit
        const actualBit = await readArea.readAreaBit(byte, bit);
        console.log(`Actual bit value: ${actualBit}`);
        
        // Escribir el bit como "1" para simular la pulsación
        console.log(`Pulsando el bit...`);
        const writeArea = new WriteArea( writeAreaOpt);
        await writeArea.connectPLC(); // Asegurarte de que la conexión está activa
        await writeArea.writeAreaBit(byte, bit, true);  // Seteamos el bit a 1

        // Esperar el tiempo especificado (1 o 2 segundos)
        setTimeout(async () => {
            // Después de la espera, restauramos el bit a su valor original (0)
            console.log(`Liberando el bit...`);
            await writeArea.writeAreaBit(byte, bit, false);  // Seteamos el bit a 0
        }, duration);
    } catch (error) {
        console.log('Error toggling bit:', error);
    }
};

export const switchBitDB = async (byte: number, bit: number, readDb: ReadDB, writeDbOpt: WriteDbOpt) => {
    try {
        await readDb.connectPLC(); 
        const actualBit = await readDb.readDBBit(byte, bit);
        const writeDb = new WriteDB( writeDbOpt);
        await writeDb.writeDBBit(byte, bit, !actualBit); 

        
    } catch (error) {
        console.log('Error toggling bit:', error);
    }
};