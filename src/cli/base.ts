import { ReadDB } from "../app/readDb";
import readline from 'readline';
import { WriteDB, WriteDbOpt } from "../app/writeDb";


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
