export const actionList = {
  auth: 'auth',
  unauth: 'unauth',
  entergame: 'entergame',
  withdrawgame: 'withdrawgame',
  exitgame: 'exitgame',
  leftclick: 'leftclick',
  rightclick: 'rightclick',
  keypress: 'keypress',
  gamestart: 'gamestart',
  gamefinish: 'gamefinish',
  globaldataupdate: 'globaldataupdate',
  objectcreate: 'objectcreate',
  objectupdate: 'objectupdate',
  objectdestroy: 'objectdestroy',
}

export type action =
  | 'auth'
  | 'unauth'
  | 'entergame'
  | 'withdrawgame'
  | 'exitgame'
  | 'leftclick'
  | 'rightclick'
  | 'keypress'
  | 'gamestart'
  | 'gamefinish'
  | 'globaldataupdate'
  | 'objectcreate'
  | 'objectupdate'
  | 'objectdestroy';

export type basic = {
  action: action;
  state: string;
  owner: string;
  objectId: string;
  data: any;
};

export type state = {
  action: action;
  state: string;
};

export type data = {
  action: action;
  data: any;
};

export type authEntry = {
  action: action;
  signature: string;
};

export type authReply = {
  action: action;
  state: string;
  playerId: string;
};

export type authReject = {
  action: action;
  message: string;
};

export type roomUpd = {
  action: action;
};

export type mouseMsg = {
  action: action;
  coords: number[];
  objectId: string;
};

export type keyboardMsg = {
  action: action;
  key: string;
};

export type gameStart = {
  action: action;
  opponent: string;
};

export type gameFinish = {
  action: action;
  win: boolean;
  data: any;
};

export type objectLifecycle = {
  action: action;
  id: string;
  coords: number[];
  data: any;
};
