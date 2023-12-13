import { PlayerRow, UserEvent } from '../types/interfaces';
import { GameIoServer } from './Server';
import { PlayerState } from '../types';
import { WriteLog } from '../../database/log';
import * as config from '../config';
import Star from '../gameplay/Star';
import ObjectListManager from './ListManager';
import Planet from '../gameplay/Planet';
import { coords, objectDisplayInfo, objectMapInfo } from '../types/gameplay';
import { PackTitle, Classes, ObjectInfo, ObjectCreationData, ObjectUpdateData } from '../types/Messages';
import { defCoords, gameField, shipCreationStartTime } from '../config';
import { Ship } from '../gameplay/Ship';
import { BattlesShip } from '../gameplay/BattleShip';
import Store from '../store/store';
import { race, raceArr } from '../types/user';
import { PackFactory } from '../utils/PackFactory';

export class GameRoom {
  private players: PlayerRow[] = [];
  private server: GameIoServer;
  private roomItselfId: number = -1;
  private isActive: boolean = false;
  private manager: ObjectListManager<any>;
  private shipCreationTimer: NodeJS.Timer;
  private battleShipCreationTimer: NodeJS.Timer;
  private store: Store;

  constructor(_server: GameIoServer, _players: PlayerRow[]) {
    this.server = _server;
    this.players = _players;
    const race1: race = raceArr[Math.floor(Math.random() * raceArr.length)];
    const race2: race = raceArr[Math.floor(Math.random() * raceArr.length)];
    this.store = new Store(
      _players[0].publicKey,
      _players[1].publicKey,
      race1,
      race2,
    );
    this.manager = new ObjectListManager();

    this.players.forEach((player, index) => {
      player.ws.on('message', (message) => {
        let msg: any;
        try {
          msg = JSON.parse(String(message));
        } catch (e) {
          return;
        }
        try {
          msg = JSON.parse(String(msg));
        } catch (e) {}
        // WriteLog(player.publicKey, `Received in game : ${String(message)}`)

        switch (msg.action) {
          case PackTitle.buyitem:
            if (msg.data) {
              const result = this.store.BuyItem(
                player.publicKey,
                msg.data.name,
              );
              const responce = {
                action: PackTitle.buyreport,
                result: result,
              };
              player.ws.send(JSON.stringify(responce));
            }
            break;
          case PackTitle.exitgame:
            this.Finish(index === 0 ? 1 : 0);
            break;
        }
      });
    });
  }

  public SetId(_id: number): boolean {
    if (this.roomItselfId === -1 && _id > -1) {
      this.roomItselfId = _id;
      return true;
    }
    return false;
  }

  public GetId(): number {
    return this.roomItselfId;
  }

  public isGameActive() {
    return this.isActive;
  }

  public EmitUserEvent(event: UserEvent) {
    this.players.forEach((player, index) => {
      if (player.publicKey === event.userPublicKey) {
        switch (event.type) {
          case 'close':
            this.Finish(index === 0 ? 1 : 0);
            break;
          default:
            return;
        }
      }
    });
    return;
  }

  public SendLog(...params: any[]) {
    this.ReSendMessage(
      JSON.stringify({
        action: PackTitle.log,
        ...params,
      }),
    );
  }

  public Start() {

    this.players.forEach((player) => {
      const state: PlayerState = {
        auth: true,
        inLookingFor: false,
        inGame: true,
        planetId: player.state.planetId,
        starId: player.state.starId,
        roomId: this.GetId(),
      };
      this.server.UpdatePlayerState(player.id, state);
      const playerPosition =
        player.publicKey === this.players[0].publicKey ? 'top' : 'bottom';
      player.ws.send(
        JSON.stringify({
          action: PackTitle.gamestart,
          playerPosition: playerPosition,
          orbitRadius: defCoords.orbRadius,
          objectMovesPerSec: 1000 / config.FrameInterval,
          battleLine: defCoords.battleLine,
          gameField: gameField,
        }),
      );
    });
    this.isActive = true;
    const list: ObjectCreationData[] = []; // objectDisplayInfo[]
    const star1 = new Star(
      this,
      this.players[0].publicKey,
      config.defCoords.star1,
      config.defCoords.sprites.star.radius,
      this.manager,
    );

    list.push({
      id: star1.getId(),
      owner: star1.owner,
      class: Classes.star,
      position: star1.center,
      radius: star1.radius,
      hp: config.defStarHealth,
    });

    const star2 = new Star(
      this,
      this.players[1].publicKey,
      config.defCoords.star2,
      config.defCoords.sprites.star.radius,
      this.manager,
    );

    list.push({
      id: star2.getId(),
      owner: star2.owner,
      class: Classes.star,
      position: star2.center,
      radius: star2.radius,
      hp: config.defStarHealth,
    });

    const planet1 = new Planet(
      this,
      this.players[0].publicKey,
      { x: star1.center.x, y: star1.center.y - config.defCoords.orbRadius },
      config.defCoords.sprites.planet.radius,
      this.manager,
      false,
    );

    list.push({
      id: planet1.getId(),
      owner: planet1.owner,
      class: Classes.planet,
      position: planet1.center,
      radius: planet1.radius,
      planetData: {
        orbitRadius: defCoords.orbDiam / 2,
        orbitCenter: star1.center,
        startOrbitAngle: -90,
        year: shipCreationStartTime / 1000,
        rotationSpeed: config.planetRotationSpeed * 10,
        orbitSpeed: config.planetYearAngle * 10,
      }
    });

    const planet2 = new Planet(
      this,
      this.players[1].publicKey,
      { x: star2.center.x, y: star2.center.y + config.defCoords.orbRadius },
      config.defCoords.sprites.planet.radius,
      this.manager,
      true,
    );

    list.push({
      id: planet2.getId(),
      owner: planet2.owner,
      class: Classes.planet,
      position: planet2.center,
      radius: planet2.radius,
      planetData: {
        orbitRadius: defCoords.orbDiam / 2,
        orbitCenter: star2.center,
        startOrbitAngle: 90,
        year: shipCreationStartTime / 1000,
        rotationSpeed: config.planetRotationSpeed * 10,
        orbitSpeed: config.planetYearAngle * 10,
      }
    });

    this.manager.addObject(star1);
    this.manager.addObject(star2);
    this.manager.addObject(planet1);
    this.manager.addObject(planet2);

    this.ReSendMessage(PackFactory.getInstance().objectCreate(list));

    setTimeout(() => {
      star1.Activate();
      star2.Activate();
      this.CreateShips();
    }, 1);

    this.shipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName(Classes.ship);
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey;
      });
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey;
      });
      if (shipList1.length === 0 || shipList2.length === 0) {
        this.CreateShips();
      }
    }, shipCreationStartTime);
    this.battleShipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName(Classes.battleship);
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey;
      });
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey;
      });
      if (shipList1.length === 0) {
        this.CreateBattleShip(this.players[0].publicKey);
      }

      if (shipList2.length === 0) {
        this.CreateBattleShip(this.players[1].publicKey);
      }
    }, shipCreationStartTime * 3);
  }

  public ReSendMessage(message: string) {
    this.players.forEach((player) => {
      player.ws.send(message);
    });
  }

  private CreateShips() {
    const list: ObjectCreationData[] = [];
    const ships: Ship[] = [];
    this.players.forEach((player, index) => {
      const mirror = index === 0 ? true : false;
      const center = gameField[0] / 2;
      const xPositions = [center - 80, center, center + 80];
      const yPosition = mirror
        ? defCoords.battleLine + 150
        : defCoords.battleLine - 150;
      const startAngle = (Math.PI / 2) * (mirror ? -1 : 1);
      xPositions.forEach((pos, j) => {
        const ship = new Ship(
          this,
          player.publicKey,
          { x: pos, y: yPosition },
          defCoords.sprites.ship.radius,
          this.manager,
          mirror,
          startAngle
        );
        this.manager.addObject(ship);
        list.push({
          id: ship.getId(),
          owner: ship.owner,
          class: Classes.ship,
          position: ship.center,
          rotation: startAngle,
          radius: ship.radius,
          hp: ship.getHp(),
        });
        ships.push(ship);       
      });
    });
    this.ReSendMessage(PackFactory.getInstance().objectCreate(list));
    ships.forEach((sh, index) => {
      const posIndex = -1; // index >= 3 ? index : index + 3;
      setTimeout(() => {
        try {
          sh.Activate(posIndex);
        } catch (e) {
          this.SendLog('error', e.message);
        }
      }, index * 5);
    });
  }

  private CreateBattleShip(owner: string) {
    try {
      const list: ObjectCreationData[] = [];

      const mirror = owner === this.players[0].publicKey ? true : false;
      const xPosition = (gameField[0] / 4) * (mirror ? 3 : 1);
      const yPosition = mirror ? 800 : 200;
      const startAngle = (Math.PI / 2) * (mirror ? -1 : 1); // 1 : -1
      const bShip = new BattlesShip(
        this,
        owner,
        { x: xPosition, y: yPosition },
        defCoords.sprites.battleShip.radius,
        this.manager,
      );
      list.push({
        id: bShip.getId(),
        owner: bShip.owner,
        class: Classes.battleship,
        position: bShip.center,
        rotation: startAngle,
        radius: bShip.radius,
        hp: bShip.getHp(),
      });

      this.manager.addObject(bShip);
      this.ReSendMessage(PackFactory.getInstance().objectCreate(list));
      bShip.Activate();
    } catch (e) {
      this.SendLog('error', e.message);
    }
  }

  public StarDestroy(owner: string, id: string) {
    if (this.isActive) {
      let winner = 0;
      this.players.forEach((player, index) => {
        if (player.publicKey === owner) {
          winner = index === 0 ? 1 : 0;
        }
      });
      this.manager.removeObject(id);
      this.Finish(winner);
    }
  }

  public FrameUpdate() {
    const ships = this.manager.getObjectsByClassName(Classes.ship);
    const battleShips = this.manager.getObjectsByClassName(Classes.battleship);
    const list: ObjectUpdateData[] = [];
    const bsList: ObjectUpdateData[] = [];
    ships.forEach((ship) => {
      if (!ship.isActive) {
        return;
      }
      const rangeToStar = this.manager.calcRange(
        ship.center,
        ship.targetPosition,
      );
      let targetId: string = "";
      if (!ship.isAttacking) {
        if (rangeToStar <= config.shipSpeed) {
          ship.center = ship.targetPosition;
          targetId = ship.AttackStar();
          // ship.angle = this.manager.calcAngle(ship.center, ship.TargetStar.center);
          // this.SendLog('Ship angle diff, space target', ship.TargetStar.center - ship.angle);
        } else {
          const target = ship.FindTarget();
          if (target) {
            const range = this.manager.calcRange(ship.center, target.center);
            const angle = this.manager.calcAngle(ship.center, target.center);
            if (range <= config.shipRange && (angle - ship.angle) < 0.1) {   // && angle < 0.01
              ship.StartAttacking(target);
              // ship.angle = angle;
              // ship.MoveAngle(target);
            } else {
              ship.MoveToPoint(target.center, false);
              // ship.angle = angle;
            }
            targetId = target.getId();
          } else {
            ship.MoveToPoint(ship.targetPosition, false);
            // ship.angle = this.manager.calcAngle(ship.center, ship.targetPosition);
          }
        }
      } else {
        const target = ship.FindTarget();
        if (target) {
          const angle = this.manager.calcDisplayAngle(ship.center, target.center);
          ship.angle = angle;
        } else {
          ship.angle = this.manager.calcDisplayAngle(ship.center, ship.targetPosition);
        }
      }
      this.SendLog('Ship rotation', ship.angle);
      list.push(
        {
          id: ship.id,
          position: ship.center,
          rotation: ship.angle,
          data: {
            target: targetId
          }
        }
      );
    });
    battleShips.forEach((BS: BattlesShip) => {
      if (!BS.isActive) {
        return;
      }
      if (!BS.isAttacking)
        BS.MoveToPoint(BS.targetPosition, false, () => {
          const rangeToTarget = this.manager.calcRange(
            BS.center,
            BS.targetPosition,
          );
          if (rangeToTarget < 5) {
            BS.AttackState();
          }
          bsList.push({
            id: BS.getId(),
            position: BS.center,
          });
        });
    });
    if (bsList.length > 0) {
      this.ReSendMessage(PackFactory.getInstance().objectUpdate(bsList));
    }
    if (list.length > 0) {
      this.ReSendMessage(PackFactory.getInstance().objectUpdate(list));
    } else {
      const stars = this.manager.getObjectsByClassName(Classes.star);
      stars.forEach((star: Star) => {
        star.ResetPositions();
      });
    }
  }

  private Finish(winner: number | null = null) {
    this.isActive = false;
    clearInterval(this.shipCreationTimer);
    clearInterval(this.battleShipCreationTimer);
    if (winner === null) winner = Math.ceil(Math.random() * 2) - 1; // REPLACE!!!
    WriteLog(
      `${this.players[0].publicKey} VS ${this.players[1].publicKey}`,
      `Game finished`,
    );
    const dt = new Date();
    const objects = this.manager.getAllObjects();
    objects.forEach((obj) => {
      try {
        obj.destroy();
      } catch (e) {}
      try {
        this.manager.removeObject(obj.id);
      } catch (e) {}
    });

    this.players.forEach((player, index) => {
      const state: PlayerState = {
        auth: true,
        inLookingFor: false,
        inGame: false,
        planetId: player.state.planetId,
        starId: player.state.starId,
        roomId: -1,
      };
      this.server.UpdatePlayerState(player.id, state);
      player.ws.send(
        JSON.stringify({
          action: PackTitle.gameend,
          win: winner === index ? true : false,
        }),
      );
    });

    SaveGameResult({
      playerOne: this.players[0].publicKey,
      playerTwo: this.players[1].publicKey,
      winner: winner === 0 ? 1 : 2,
      planet_id_one: this.players[0].state.planetId,
      planet_id_two: this.players[1].state.planetId,
      star_id_one: this.players[0].state.starId,
      star_id_two: this.players[1].state.starId,
      date: dt.getTime(),
    });
  }
}
