import readline from 'readline';
import { ReadDB } from './app/readDb';
import { IP, RACK, SLOT } from './app/config';
import { WriteDB } from './app/writeDb';
import { ReadArea } from './app/readArea';
import { WriteArea } from './app/writeArea';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const plcOpt = {
    IP,
    RACK,
    SLOT
}
enum DBPrograms {  's300' = 1, 's15001700' = 2}
const dbProgramsOpt = {
    [DBPrograms.s300]: {
        DB_NUMBER: 3,
        START_ADDRESS: 0,
        SIZE: 259
    },
    [DBPrograms.s15001700]: {
        DB_NUMBER: 14,
        START_ADDRESS: 0,
        SIZE: 1
    }
}


console.log(`PLC CLI mini-app:\n===================`);
let DB_NUMBER:number, START_ADDRESS:number, SIZE:number;
let readDb: ReadDB;
const askForPLCType = () => {
    rl.question(`Select PLC type:\n1. Enter "1" or "S300" for S300 example\n2. Enter "2" or "S1500" for S1500/S1700 example\n=> `, (plcType) => {
        
        
        if (plcType.trim().toLowerCase() === 's300' || plcType.trim() === '1') {
            DB_NUMBER = dbProgramsOpt[DBPrograms.s300].DB_NUMBER;
            START_ADDRESS = dbProgramsOpt[DBPrograms.s300].START_ADDRESS;
            SIZE = dbProgramsOpt[DBPrograms.s300].SIZE;
            console.log('Using DB3 for S300');
        } else {
            DB_NUMBER = dbProgramsOpt[DBPrograms.s15001700].DB_NUMBER;
            START_ADDRESS = dbProgramsOpt[DBPrograms.s15001700].START_ADDRESS;
            SIZE = dbProgramsOpt[DBPrograms.s15001700].SIZE;
            console.log('Using DB14 for S1500/S1700');
        }
        readDb = new ReadDB(DB_NUMBER, START_ADDRESS, SIZE, plcOpt);
        startCLI();
    });
};

const askForSecondInput = () => {
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
                const writeDB = new WriteDB(DB_NUMBER, START_ADDRESS, SIZE, plcOpt);
                await writeDB.writeDBBit(byte, bit, !actualBit);
            } catch (error) {
                console.log('Error writing bit:', error);
            }
        }
        rl.prompt();
    });
};

const startCLI = () => {
    if(DB_NUMBER === 3){
        rl.setPrompt(`Send an instruction:\n- Enter 'bit' to toggle a bit\n- Enter 'read' to read PLC DB values\n(Type 'exit' to quit)\n=> `);
    } else {
        rl.setPrompt(`Send an instruction:\n- Enter 'bit' to toggle a bit\n- Enter 'read' to read PLC DB values\n- Or enter next names  to play the her buttons: \n'marcha' -> (%M0.2),\n 'paro' -> (%M0.3),\n 'rearme' -> (%M0.4),\n 'directa' -> (%M0.0),\n'inversa' -> (%M0.1) \n-- Type 'exit' to quit --\n=> `);
    }
    rl.prompt();

    rl.on('line', async (input) => {
        const command = input.trim().toLowerCase();
        const readArea = new ReadArea(0,2, plcOpt)
        if (command === 'exit') {
            rl.close();
            return;
        }
        const switchException = () => {
            if(DB_NUMBER === 3){
                console.log('❌ Invalid command for S300 PLC');
                return true;
            }
            return false
        }
        const toggleBitForDuration = async (byte: number, bit: number, duration: number) => {
            try {
                await readArea.connectPLC(); // Asegurarte de que la conexión está activa
                // Leer el estado actual del bit
                const actualBit = await readArea.readAreaBit(byte, bit);
                console.log(`Actual bit value: ${actualBit}`);
                
                // Escribir el bit como "1" para simular la pulsación
                console.log(`Pulsando el bit...`);
                const writeArea = new WriteArea( START_ADDRESS, SIZE, plcOpt);
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
        
        switch (command) {
            case 'bit':
                console.log('\nSend the position of a bit to change its value...');
                askForSecondInput();
                break;
            case 'read':
                console.log('\n🛞 Reading PLC DB values...\n');
                await readDb.connectPLC();
                console.log('PLC Status: ', readDb.getPlcStatus());
                try {
                    if (DB_NUMBER === 3) {
                        const [string, int, byte] = await Promise.all([
                            readDb.readDBString(2, 256),
                            readDb.readDBInt(256),
                            readDb.readDBByte(258)
                        ]);
                        console.log(`✅ String: ${string}, Int: ${int}, Byte: ${byte}\n`);
                    } else {
                        const [bit0, bit1, bit2] = await Promise.all([
                            readDb.readDBBit(0, 0),
                            readDb.readDBBit(0, 1),
                            readDb.readDBBit(0, 2)
                        ]);
                        console.log(`✅ Etapa1: ${bit0} Etapa2: ${bit1} Etapa3: ${bit2}\n`);
                    }
                } catch (error) {
                    console.error('❌ Error reading PLC DB:', error);
                }
                rl.prompt();
                break;

            case "test":
                console.log('\n🛞 Reading PLC DB values...\n');
                await readArea.connectPLC();
                console.log('PLC Status: ', readArea.getPlcStatus());
                // rl.prompt();
                // break;
            case "r-marcha": 
                if (switchException()) break;
            
                console.log(`🛞 Reading 'marcha'...`);
            
                // Verificar la conexión antes de intentar leer el bit
                try {
                    await readArea.connectPLC(); // Asegurarte de que la conexión está activa
            
                    const bit0 = await readArea.readAreaBit(0, 0); // %M0.2
                    console.log(`✅ Actual bit %M0.0 value: ${bit0}`);
                } catch (error) {
                    console.error('Error reading bit %M0.0:', error);
                }
            
                rl.prompt();
                break;
            
            case 'marcha':
                if(switchException()) break;
                console.log(`Pulsando marcha...`);
                await toggleBitForDuration(0, 2, 2000); // %M0.2 durante 2 segundos
                rl.prompt();
                break;
            case 'paro':
                if(switchException()) break;
                console.log(`Pulsando paro...`);
                await toggleBitForDuration(0, 3, 2000); // %M0.3 durante 2 segundos
                break;
            case 'rearme':
                if(switchException()) break;
                console.log(`Pulsando rearme...`);
                await toggleBitForDuration(0, 4, 2000); // %M0.4 durante 2 segundos
                break;
            case 'directa':
                if(switchException()) break;
                console.log(`Pulsando directa...`);
                await toggleBitForDuration(0, 0, 2000); // %M0.0 durante 2 segundos
                break;
            case 'inversa':
                if(switchException()) break;
                console.log(`Pulsando inversa...`);
                await toggleBitForDuration(0, 1, 2000); // %M0.1 durante 2 segundos
                break;
            default:
                console.log(`Unknown command: ${input}`);
                rl.prompt();
                break;
        }
    }).on('close', () => {
        console.log('CLI closed.');
        process.exit(0);
    });
};

askForPLCType();
