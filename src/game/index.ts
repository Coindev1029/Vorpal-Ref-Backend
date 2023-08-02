import WebSocket from 'ws';
import Web3 from 'web3';
import { signTimeout } from './config';
import { GameServer } from './gameplay/server';
import { WriteLog } from '../database/log';
import { GameIoServer } from './core/Server';

export async function InitGameServer () {

    const server = new GameServer()
    server.InitServer()

}

export async function InitGameIoServer() {

    const server = new GameIoServer()
    server.Start()

}