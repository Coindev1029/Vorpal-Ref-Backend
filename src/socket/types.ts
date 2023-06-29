export type playerStateKeys = 'connected' | 'inLookingFor' | 'inGame' | 'roomId'

export type PlayerState = {
    connected: boolean,
    inLookingFor: boolean,
    inGame: boolean,
    roomId: number
}