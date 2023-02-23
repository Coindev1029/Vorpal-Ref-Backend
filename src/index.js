import * as http from 'http';

const port = process.argv[2] ? process.argv[2] : process.env.default_port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Connected on port');
 });

console.log(port)

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  })

  

