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
  | 'objectdestroy'

export type basic = {
  action: action,
  state: string,
  owner: string,
  objectId: string,
  data: any
};

export type auth = {
  action: action,
  state: string
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



