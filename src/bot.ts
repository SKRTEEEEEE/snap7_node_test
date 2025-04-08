import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { ReadDB } from "./app/readDb";
import { plcOpt } from "./app/config";
import { switchBitDB } from "./app/toggleBit";
import { WriteDB } from "./app/writeDb";


config();

if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN no está definido en las variables de entorno');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN!);
enum DBOpt {DB1 = 1, DB2}
const dbOpt = {
  [DBOpt.DB1]: {
      dbNumber: 1,         
      start: 0,            
      size: 4              
  },
  [DBOpt.DB2]: {
      dbNumber: 2,
      start: 0,
      size: 14
  }
}
let readDb1: ReadDB;
let readDb2: ReadDB;

bot.use((ctx, next) => {
  const chat = ctx.message?.chat
  console.log(`Mensaje recibido de ${ctx.from?.username || ctx.from?.first_name}: ${ {chat}}`);
  return next();
});

bot.start((ctx) => {
  ctx.reply('¡Bienvenido a tu bot de información! Usa /help para ver los comandos disponibles.');
});

bot.help((ctx) => {
  ctx.reply(`
Comandos disponibles:

/info - Mostrar información general

/hora - Mostrar la hora actual

/connect - Conectar al PLC y ver el estado de la conexión

/errores - Mostrar errores en la PLC

/tv - Mostrar tiempos de cada ciclo Grafcet

/tm1 - Modificar el tiempo del ciclo 1 de la PLC

/tm2 - Modificar el tiempo del ciclo 2 de la PLC

/tm3 - Modificar el tiempo del ciclo 3 de la PLC

/pm - Activar el programa (3) si esta desactivado, o desactivarlo (cambiar a programa 1) si esta activado

/pv - Ver el estado del programa 3

  `);
});

bot.command('info', (ctx) => {
  ctx.reply('Esta es la información general de la aplicación.');
});

bot.command("connect", async (ctx) => {
  readDb1 = new ReadDB({...dbOpt[DBOpt.DB1], clientOpt: plcOpt})
  readDb2 = new ReadDB({...dbOpt[DBOpt.DB2], clientOpt: plcOpt})
  try {
    await readDb1.connectPLC();
    await readDb2.connectPLC();
    ctx.reply(`Conexión establecida con el PLC. Estado1: ${readDb1.getPlcStatus()} Estado2: ${readDb2.getPlcStatus()}`);
  } catch (error) {
    console.error('Error al conectar al PLC:', error);
    ctx.reply('Error al conectar al PLC. Verifica la configuración y el estado del PLC.');
  }
})

bot.command("errores", async (ctx) => {
  if (!readDb1) {
    ctx.reply('Conéctate al PLC primero usando /connect.');
    return;
  }

  try {
    const error = await readDb1.readDBInt(2);
    ctx.reply(`Errores en la PLC: ${error}`);
  } catch (error) {
    console.error('Error al leer errores:', error);
    ctx.reply('Error al leer errores del PLC.');
  }
})

bot.command("pv", async (ctx) => {
  if (!readDb2) {
    ctx.reply('Conéctate al PLC 2 usando /connect.');
    return;
  }

  try {
    const program = await readDb2.readDBBit(0,2);
    ctx.reply(`Estado del programa: ${program}`);
  } catch (error) {
    console.error('Error al leer el estado del programa:', error);
    ctx.reply('Error al leer el estado del programa.');
  }
})

bot.command("pm", async (ctx) => {
  if (!readDb2) {
    ctx.reply('Conéctate al PLC 2 usando /connect.');
    return;
  }
  try {
          await readDb2.connectPLC(); 
          const actualBitPrograma1 = await readDb2.readDBBit(0,0);
          const writeDb2 = new WriteDB({...dbOpt[DBOpt.DB2], clientOpt: plcOpt});
          await writeDb2.connectPLC();
          Promise.all([
            await writeDb2.writeDBBit(0, 0, !actualBitPrograma1),
            await writeDb2.writeDBBit(0, 2, actualBitPrograma1)
          ])
          ctx.reply(`Estado del programa cambiado al estado contrario: ${!actualBitPrograma1}`);
      }catch (error) {
    console.error('Error al cambiar el estado del programa:', error);
    ctx.reply('Error al cambiar el estado del programa.');
  }
}
)

bot.command('hora', (ctx) => {
  const ahora = new Date().toLocaleString('es-ES');
  ctx.reply(`La hora actual es: ${ahora}`);
});


// ⬇️🐐

bot.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase().includes('hola')) {
    ctx.reply('¡Hola! ¿En qué puedo ayudarte?');
    return;
  }
  
  ctx.reply('No entiendo ese comando. Usa /ayuda para ver las opciones disponibles.');
});

bot.launch()
  .then(() => {
    console.log('\nBot iniciado correctamente');
  })
  .catch((err) => {
    console.error('Error al iniciar el bot:', err);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));