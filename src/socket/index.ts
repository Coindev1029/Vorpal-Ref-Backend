import WebSocket from 'ws';
import Web3 from 'web3';
import { CreatePlayer } from './state';
import { signTimeout } from './config';

export async function InitSocketServer () {
    
    const ws_port = Number(process.env.WS_PORT ? process.env.WS_PORT : 3078)
    const wss = new WebSocket.Server({ port: ws_port });
    const web3 = new Web3(Web3.givenProvider)

    wss.on('connection', (ws: WebSocket) => {
        
        const sId = String(Math.round(Math.random() * 1000000000)) 

        ws.send(JSON.stringify({ action: "auth", state: "requesting" }))

        const authTimeout = setTimeout(() => {
           ws.send(JSON.stringify({ 
            action: "unauth", 
            message: "Auth time expired" 
          }))
          ws.close()
        }, signTimeout)

        ws.on('message', (message: string) => {
          try {
             const msg : any = JSON.parse(message)
             if (msg.signature && msg.action === "auth") {
                const recoverMsg = "auth_" + String(new Date().getTime())
                const publicKey  = web3.eth.accounts.recover(recoverMsg, msg.signature).toLowerCase()
                const playerId = CreatePlayer(ws, publicKey)
                if (!playerId) {
                  ws.send(JSON.stringify({ 
                    action: "unauth", 
                    message: "Auth failed, player with this key is already online"
                  }))
                } else {
                   ws.send(JSON.stringify({ 
                      action: "auth", 
                      state: "success",
                      playerId: playerId
                   }))
                   clearTimeout(authTimeout)
                }
             }
          } catch (e) {
            ws.send(JSON.stringify({ 
              action: "unauth", 
              message: e.message 
            }))
          }
        });

      
        ws.on('close', () => {
          console.log('Client disconnected');
        });
      });
      
      console.log(`WebSocket server is running on port ${ws_port}`);
}