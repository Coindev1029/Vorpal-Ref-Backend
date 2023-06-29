import WebSocket from 'ws';

const sockets = new Map()

export async function InitSocketServer () {
    
    const ws_port = Number(process.env.WS_PORT ? process.env.WS_PORT : 3078)
    const wss = new WebSocket.Server({ port: ws_port });

    wss.on('connection', (ws: WebSocket) => {
        
        const sId = String(Math.round(Math.random() * 1000000000)) 
        sockets.set(sId, ws)
        ws.send(sId)
        
        ws.on('message', (message: string) => {
          console.log('Received message:', message);
          ws.send(`Echo: ${message}`);
        });

      
        ws.on('close', () => {
          console.log('Client disconnected');
        });
      });
      
      console.log(`WebSocket server is running on port ${ws_port}`);
}