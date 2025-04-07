import { ReadDB } from "../app/readDb";
import readline from 'readline';
import { WriteDB, WriteDbOpt } from "../app/writeDb";
import { ReadArea } from "../app/readArea";
import { WriteArea, WriteAreaOpt } from "../app/writeArea";

export const askForSecondInput = (readDb: ReadDB, rl: readline.Interface, writeDbOpt: WriteDbOpt) => {
    rl.question('Enter the byte and bit position (e.g., "10.3" or "25.6"):\n=> ', async (position) => {
        const [byteStr, bitStr] = position.split('.');
        const byte = parseInt(byteStr, 10);
        const bit = parseInt(bitStr, 10);
        
        if (isNaN(byte) || isNaN(bit)) {
            console.log('Invalid input. Please enter two numbers separated by a dot (e.g., "10.3" or "25.6")');
        } else {
            try {
                const actualBit = await readDb.readDBBit(byte, bit);
                console.log(`Actual bit value: ${actualBit}`);
                
                console.log(`\n🛞 Toggling bit at byte ${byte}, bit ${bit}...`);
                const writeDB = new WriteDB(writeDbOpt);
                await writeDB.writeDBBit(byte, bit, !actualBit);
            } catch (error) {
                console.log('Error writing bit:', error);
            }
        }
        rl.prompt();
    });
};
export const toggleBitForDuration = async (byte: number, bit: number, duration: number, readArea: ReadArea, writeAreaOpt: WriteAreaOpt) => {
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