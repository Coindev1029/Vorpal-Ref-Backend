import WebSocket from 'ws';
import Web3 from 'web3';
import { signTimeout } from './config';
import { GameServer } from './gameplay/server';
import { WriteLog } from '../database/log';

export async function InitGameServer () {
    
    const ws_port = Number(process.env.WS_PORT ? process.env.WS_PORT : 3078)

    const server = new GameServer()
    server.InitServer()

    console.log(`WebSocket server is running on port ${ws_port}`);
}