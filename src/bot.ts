import { Telegraf } from "telegraf";
import { config } from "dotenv";


config();

if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN no está definido en las variables de entorno');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN!);
enum DBOpt {DB1 = 1, DB2}
const dbOpt = {
    [DBOpt.DB1]: {
        DB_NUMBER: 1,
        START_ADDRESS: 0,
        SIZE: 4
    },
    [DBOpt.DB2]: {
        DB_NUMBER: 2,
        START_ADDRESS: 0,
        SIZE: 14
    }
}


bot.use((ctx, next) => {
  console.log(`Mensaje recibido de ${ctx.from?.username || ctx.from?.first_name}: ${ctx.message?.chat }`);
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

/errores - Mostrar errores en la PLC

/t-v - Mostrar tiempos de cada ciclo Grafcet

/t-m1 - Modificar el tiempo del ciclo 1 de la PLC

/t-m2 - Modificar el tiempo del ciclo 2 de la PLC

/t-m3 - Modificar el tiempo del ciclo 3 de la PLC

  `);
});

bot.command('info', (ctx) => {
  ctx.reply('Esta es la información general de la aplicación.');
});



bot.command('hora', (ctx) => {
  const ahora = new Date().toLocaleString('es-ES');
  ctx.reply(`La hora actual es: ${ahora}`);
});

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