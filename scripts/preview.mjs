import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const prefix = '/milkee-site/';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname === '/') { res.writeHead(302,{Location:prefix}); return res.end(); }
    if(!pathname.startsWith(prefix)) { res.writeHead(404); return res.end(); }
    const file = path.resolve(root,pathname.slice(prefix.length)+(pathname.endsWith('/')?'index.html':''));
    if(!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    let data = await readFile(file);
    const ext=path.extname(file);
    if(ext==='.html') data = Buffer.from(data.toString().replaceAll('https://tmosmant.github.io/milkee-site','http://127.0.0.1:4173/milkee-site'));
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'}); res.end(data);
  } catch { res.writeHead(404); res.end('404'); }
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/milkee-site/fr/'));
