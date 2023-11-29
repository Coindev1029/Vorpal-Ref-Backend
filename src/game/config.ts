export const idLength = 64;
export const signTimeout = 120000;
export const roomTestTimeout = 30000;
export const gameTimerValue = 5000;
export const pingPongDelay = 3000;
export const default_ws_port = 3078;
export const gameField = [800, 1000];
export const FrameInterval = 100;
export const SyncInterval = 1000;
export const shipMovingTime = 5000;
export const shipCreationStartTime = 60000; // 147580;
export const planetRotationSpeed = 0.064;
export const planetYearAngle = 0.004185;
export const defShipHealth = 100;
export const defBattleShipHealth = 300;
export const defStarHealth = 1000;
export const defShipDamage = [10, 15];
export const defBattleShipDamage = [20, 30];
export const defShipHitChance = 0.8;
export const defShipFireDelay = 1200; // 300
export const playerStartGold = 100;
export const playerExpPerLevel = 200;
export const playerMaxLevel = 16;
export const moveFrame = 100; // step in ms
export const shipRange = 200;
export const shipSpeed = 8;
export const defCoords = {
  battleLine: 500,
  orbDiam: 150,
  orbRadius: 75,
  sprites: {
    star: {
      width: 50,
      height: 50,
      radius: 25
    },
    planet: {
      width: 40,
      height: 40,
      radius: 5
    },
    ship: {
      width: 30,
      height: 30,
      radius: 15
    },
  },
  star1: {
    x: 400,
    y: 250,
  },
  star2: {
    x: 400,
    y: 750,
  },
  planet1: {
    x: 400,
    y: 50,
  },
  planet2: {
    x: 400,
    y: 950,
  },
};
