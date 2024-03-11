import WebSocket from 'ws';
import Web3 from 'web3';
import { signTimeout } from './config';
import { WriteLog } from '../database/log';
import { GameIoServer } from './core/Server';

export async function InitGameIoServer() {

    const server = new GameIoServer()
    server.Start()

}