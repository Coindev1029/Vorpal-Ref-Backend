export type playerStateKeys = 'connected' | 'inLookingFor' | 'inGame' | 'roomId' | 'starId' | 'planetId'

export type PlayerState = {
    connected: boolean,
    inLookingFor: boolean,
    inGame: boolean,
    starId: number,
    planetId: number,
    roomId: number
}
