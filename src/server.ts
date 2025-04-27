// src/server.ts
import http from 'http';
import fs from 'fs';
import path from 'path';
import { debouncedFetch } from './core/pokemon';
import { ReadDB } from './core/readDb';
import { plcOpt } from './core/config';
import { WriteDB } from './core/writeDb';
import { toggleBitMForDuration } from './core/toggleBit';
import { ReadArea } from './core/readArea';

const hostname = 'localhost';
const port = 4001;

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
const readDb1: ReadDB = new ReadDB({...dbOpt[DBOpt.DB1], clientOpt: plcOpt})
let readDb2: ReadDB = new ReadDB({...dbOpt[DBOpt.DB2], clientOpt: plcOpt})
const readArea = new ReadArea(0,2, plcOpt) // start, size, clientOpt

const serveStaticFile = (filePath: string, res: http.ServerResponse) => {
  const ext = path.extname(filePath);
  const contentTypeMap: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
  };
  const contentType = contentTypeMap[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};
const connectPlcs = async( res:http.ServerResponse) => {
  try {
    await Promise.all([
      await readDb1.connectPLC(),
      await readDb2.connectPLC(),
    ])
    if(readDb1.getPlcStatus() !== readDb2.getPlcStatus()){
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al comparar estados de las bdd' }));
    }

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to connect to PLC' }));
  }
}

const handleReadAll = async ( res:http.ServerResponse ) => {  
      try {
        const responseDb2 = await Promise.all([
          await readDb2.readBit(0,0),
          await readDb2.readBit(0,1),
          await readDb2.readBit(0,2),
          await readDb2.readTime(2),
          await readDb2.readTime(6),
          await readDb2.readTime(10),
        ]);
        const numErr = await readDb1.readInt(2);
        // directa -> 2.0, inversa 2.1, emergencia 2.2, rearme 2.3,
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: readDb2.getPlcStatus(),
          programa1: responseDb2[0],
          programa2: responseDb2[1],
          programa3: responseDb2[2],
          tiempo1: responseDb2[3], tiempo2:responseDb2[4], tiempo3:responseDb2[5], numErr,
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read from PLC' }));
      }   
}

const handleSetProgram = async (req:http.IncomingMessage, res:http.ServerResponse) => { 
  const writeDb2 = new WriteDB({...dbOpt[DBOpt.DB2], clientOpt: plcOpt});
  let body:string = "";
  try {
    //0.0 programa 1, 0.1 programa 2, 0.2 programa 3
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        const program = parseInt(parsedBody.program as string)
        const actualProgram = parseInt(parsedBody.actualProgram as string)

        
        console.log('Programa recibido:', program);
        console.log('Programa actual:', actualProgram);
        Promise.all([
          await writeDb2.connectPLC(),
          await writeDb2.writeBit(0, program-1, true),
          await writeDb2.writeBit(0, actualProgram-1, false),
        ]) 
        if(program === 1){
          await writeDb2.writeBit(0,3, false)
          await writeDb2.writeBit(0,4, false)
          await writeDb2.writeBit(0,5, false)
        }
        if(program === 3){
          await writeDb2.writeBit(0,3, true)
          await writeDb2.writeBit(0,4, false)
          await writeDb2.writeBit(0,5, false)
        }
   

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true,message: `Programa cambiado a ${program}` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });

  }catch (error) {
  res.writeHead(500, { 'Content-Type': 'application/json' }); 
  res.end(JSON.stringify({error: "Failed to change program"}))
  
  }

}

const handleSetTimes = async (req: http.IncomingMessage, res:http.ServerResponse) => {
  const writeDb2 = new WriteDB({...dbOpt[DBOpt.DB2], clientOpt: plcOpt});
  let body:string = "";
  try {
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        const time1 = parseInt(parsedBody.tiempo1 as string)
        const time2 = parseInt(parsedBody.tiempo2 as string)
        const time3 = parseInt(parsedBody.tiempo3 as string)

        console.log('Tiempo 1 recibido:', time1);
        console.log('Tiempo 2 recibido:', time2);
        console.log('Tiempo 3 recibido:', time3);

        await writeDb2.connectPLC()
        // Comparar con tiempos actuales para actualizar solo si son diferentes
        const [actualTime1, actualTime2, actualTime3] = await Promise.all([
          await writeDb2.readTime(2),
          await writeDb2.readTime(6),
          await writeDb2.readTime(10),
        ]);
        await Promise.all([
          actualTime1 !== time1 && await writeDb2.writeTime(2, time1),
          actualTime2 !== time2 && await writeDb2.writeTime(6, time2),
          actualTime3 !== time3 && await writeDb2.writeTime(10, time3),
        ])

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true,message: `Tiempos actuales a ${time1}, ${time2}, ${time3}` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });

  }catch (error) {
  res.writeHead(500, { 'Content-Type': 'application/json' }); 
  res.end(JSON.stringify({error: "Failed to change program"}))
  
  }
}

const handleEmergency = async ( res:http.ServerResponse) => {
  try {
    await toggleBitMForDuration(0, 5, 1000, readArea, {start: dbOpt[DBOpt.DB2].start, size: dbOpt[DBOpt.DB2].size, clientOpt: plcOpt})
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true,message: `Bit de emergencia clickado (toggle)` }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success:  false, error: 'Failed to toggle emergency bit' }));
  }
  
 }

const handleReadErrors = async ( res:http.ServerResponse) => {
  try {
    const errors = await readDb1.readInt(2);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true,data:errors }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, msg: 'Failed to read errors' }));
  }
}

const handleResetErrors = async (res: http.ServerResponse)=> {
  const writeDb1 = new WriteDB({...dbOpt[DBOpt.DB1], clientOpt: plcOpt});
  try {
    await writeDb1.connectPLC()
    await writeDb1.writeInt(2, 0)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true,message: `Errores reseteados` }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, msg: 'Failed to reset errors' }));
  }
}

const server = http.createServer((req, res) => {
  const publicPath = path.resolve(__dirname, '..', 'public');
  if (req.url === '/pokemon' || req.url === '/pokemon.html') {
    const filePath = path.join(publicPath, 'pokemon.html');
    serveStaticFile(filePath, res);
  } 
  else if (req.url?.startsWith('/public/') || req.url?.startsWith('/dist/')) {
    const filePath = path.join(__dirname, '..', req.url);
    serveStaticFile(filePath, res);
  } 
  else if (req.url === '/' || req.url === '/hmi.html'){
    const filePath = path.join(publicPath, 'hmi.html');
    connectPlcs(res)
    serveStaticFile(filePath, res);
  }
  else if (req.url === "/api/read-all" && req.method === "GET") {
    handleReadAll(res);
  }
  else if (req.url === "/api/set-program" && req.method === "POST") {
    handleSetProgram(req,res);
  }
  else if (req.url === "/api/set-times" && req.method === "POST") {
    handleSetTimes(req,res);
  }
  else if (req.url === "/api/emergency" && req.method === "GET") {
    handleEmergency(res);
  }
  else if (req.url === "/api/read-errors" && req.method === "GET") {
    handleReadErrors(res);
  }
  else if (req.url === "/api/reset-errors" && req.method === "GET") {
    handleResetErrors(res)
  }
  else if (req.url === '/api/pokemon' && req.method === 'GET') {
    debouncedFetch(req, res)
  } 
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
