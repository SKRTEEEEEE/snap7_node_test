// src/server.ts
import http from 'http';
import fs from 'fs';
import path from 'path';
import { debouncedFetch } from './handle';
import { ReadDB } from './app/readDb';
import { plcOpt } from './app/config';

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

const handleReadAll = async (req:http.IncomingMessage, res:http.ServerResponse ) => {  
    try {
        Promise.all([
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
          tiempo1: responseDb2[0], tiempo2:responseDb2[1], tiempo3:responseDb2[2], numErr,
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read from PLC' }));
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
    serveStaticFile(filePath, res);
  }
  else if (req.url === "/api/read-all" && req.method === "GET") {
    handleReadAll(req,res);
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
