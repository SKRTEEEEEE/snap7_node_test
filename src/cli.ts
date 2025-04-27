import readline from 'readline';
import { ReadDB } from './core/readDb';
import { ReadArea } from './core/readArea';
import { askForSecondInput } from './cli/base';
import { plcOpt } from './core/config';
import { toggleBitMForDuration } from './core/toggleBit';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


enum DBPrograms {  's300' = 1, 's15001700' = 2, 's1516' = 3 }
const dbProgramsOpt = {
    //1. Ejemplo básico s300 - snap7 py, snap7-tia (1st example) - tia portal house, Plc_snap7_test
    [DBPrograms.s300]: {
        dbNumber: 3,
        start_address: 0,
        size: 259
    },
    //2. Ejemplo ejercicios - snap7 py, NO example - tia portal house, EjerciciosTimers
    [DBPrograms.s15001700]: {
        dbNumber: 14,
        start_address: 0,
        size: 1
    },
    //3. Ejemplo grafcet bot/HMI - snap7 py, NO example - tia portal house, s1500-timer
    [DBPrograms.s1516]: {
        dbNumber: 2,
        start_address: 0,
        size: 14
    }
}


console.log(`PLC CLI mini-app:\n===================`);
let dbNumber:number, start_address:number, size:number;
let readDb: ReadDB;
const askForPLCType = () => {
    rl.question(`Select PLC type:\n1. Enter "1" or "S300" for S300 example\n2. Enter "2" or "S1500" for S1500/S1700 example\n3. Enter "3" or "S1516" for S1516 full example\n=> `, (plcType) => {
        
        
        if (plcType.trim().toLowerCase() === 's300' || plcType.trim() === '1') {
            dbNumber = dbProgramsOpt[DBPrograms.s300].dbNumber;
            start_address = dbProgramsOpt[DBPrograms.s300].start_address;
            size = dbProgramsOpt[DBPrograms.s300].size;
            console.log('Using DB3 for S300');
        } else if(plcType.trim().toLowerCase() === "s1500" || plcType.trim() === '2'){
            dbNumber = dbProgramsOpt[DBPrograms.s15001700].dbNumber;
            start_address = dbProgramsOpt[DBPrograms.s15001700].start_address;
            size = dbProgramsOpt[DBPrograms.s15001700].size;
            console.log('Using DB14 for S1500/S1700');
        } else {
            dbNumber = dbProgramsOpt[DBPrograms.s1516].dbNumber;
            start_address = dbProgramsOpt[DBPrograms.s1516].start_address;
            size = dbProgramsOpt[DBPrograms.s1516].size;
            console.log('Using DB2 for S1516');
        }
        readDb = new ReadDB({dbNumber, start:start_address, size, clientOpt:plcOpt});
        startCLI();
    });
};



const startCLI = () => {
    if(dbNumber=== 3){
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
            if(dbNumber === 3){
                console.log('❌ Invalid command for S300 PLC');
                return true;
            }
            return false
        }
        
        
        switch (command) {
            case 'bit':
                console.log('\nSend the position of a bit to change its value...');
                askForSecondInput(readDb, rl, { dbNumber, start: start_address, size, clientOpt: plcOpt });
                break;
            case 'read':
                console.log('\n🛞 Reading PLC DB values...\n');
                await readDb.connectPLC();
                console.log('PLC Status: ', readDb.getPlcStatus());
                try {
                    if (dbNumber === 3) {
                        const [string, int, byte] = await Promise.all([
                            readDb.readString(2, 256),
                            readDb.readInt(256),
                            readDb.readByte(258)
                        ]);
                        console.log(`✅ String: ${string}, Int: ${int}, Byte: ${byte}\n`);
                    } else if(dbNumber === 14) {
                        const [bit0, bit1, bit2] = await Promise.all([
                            readDb.readBit(0, 0),
                            readDb.readBit(0, 1),
                            readDb.readBit(0, 2)
                        ]);
                        console.log(`✅ Etapa1: ${bit0} Etapa2: ${bit1} Etapa3: ${bit2}\n`);
                    } else if (dbNumber === 2) {
                        const [bit0, bit1, bit2] = await Promise.all([
                            readDb.readBit(0, 0),
                            readDb.readBit(0, 1),
                            readDb.readBit(0, 2)
                        ]);
                        console.log(`✅ Programa1: ${bit0} Programa2: ${bit1} Programa3: ${bit2}\n`);
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
                await toggleBitMForDuration(0, 2, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.2 durante 2 segundos
                rl.prompt();
                break;
            case 'paro':
                if(switchException()) break;
                console.log(`Pulsando paro...`);
                await toggleBitMForDuration(0, 3, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.3 durante 2 segundos
                break;
            case 'rearme':
                if(switchException()) break;
                console.log(`Pulsando rearme...`);
                await toggleBitMForDuration(0, 4, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.4 durante 2 segundos
                break;
            case 'directa':
                if(switchException()) break;
                console.log(`Pulsando directa...`);
                await toggleBitMForDuration(0, 0, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.0 durante 2 segundos
                break;
            case 'inversa':
                if(switchException()) break;
                console.log(`Pulsando inversa...`);
                await toggleBitMForDuration(0, 1, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.1 durante 2 segundos
                break;
            case 'emergencia':
                if(switchException()) break;
                console.log(`Pulsando emergencia...`);
                await toggleBitMForDuration(0, 5, 2000, readArea, {start: start_address, size, clientOpt: plcOpt}); // %M0.5 durante 2 segundos
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
