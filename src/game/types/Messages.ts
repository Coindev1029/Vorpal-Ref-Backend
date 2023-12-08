import { objectMapInfo } from "./gameplay";

export enum PackTitle {
    ping = 'ping',
    pong = 'pong',
    auth = 'auth',
    event = 'event',
    unauth = 'unauth',
    startmoving = 'startmoving',
    stopmoving = 'stopmoving',
    entergame = 'entergame',
    withdrawgame = 'withdrawgame',
    exitgame = 'exitgame',
    leftclick = 'leftclick',
    rightclick = 'rightclick',
    keypress = 'keypress',
    gamestart = 'gamestart',
    gameend = 'gameend',
    gamefinish = 'gamefinish',
    globaldataupdate = 'globaldataupdate',
    objectCreate = 'objectCreate',
    objectUpdate = 'objectUpdate',
    objectdestroy = 'objectdestroy',
    attack = 'attack',
    buyitem = 'buyitem',
    buyreport = 'buyreport',
    log = 'log'
}

export enum Classes {
    star = 'star',
    planet = 'planet',
    ship = 'ship',
    battleship = 'battleship',
    shell = 'shell'
}

export type Basic = {
    action: PackTitle;
    state: string;
    owner: string;
    objectId: string;
    data: any;
};

export type State = {
    action: PackTitle;
    state: string;
};

export type Data = {
    action: PackTitle;
    data: any;
};

export type AuthEntry = {
    action: PackTitle;
    signature: string;
};

export type AuthReply = {
    action: PackTitle;
    state: string;
    playerId: string;
};

export type AuthReject = {
    action: PackTitle;
    message: string;
};

export type RoomUpd = {
    action: PackTitle;
};

export type MouseMsg = {
    action: PackTitle;
    coords: number[];
    objectId: string;
};

export type KeyboardMsg = {
    action: PackTitle;
    key: string;
};

export type GameStart = {
    action: PackTitle;
    opponent: string;
};

export type GameFinish = {
    action: PackTitle;
    win: boolean;
    data: any;
};

export type ObjectLifecycle = {
    action: PackTitle;
    id: string;
    coords: number[];
    data: any;
};

export type ObjectInfo = {
    action: string,
    list: objectMapInfo[]
}

export interface ObjectCreationData {
    id: string;
    owner: string;
    class: Classes;
    radius?: number | undefined;
    position?: {
        x: number;
        y: number;
    } | undefined;
    rotation?: number | undefined;
    hp?: number | undefined;
    planetData?: {
        orbitRadius?: number,
        orbitCenter?: { x: number, y: number },
        startOrbitAngle?: number,
        year?: number,
        rotationSpeed?: number,
        orbitSpeed?: number,
    }
}