const md5 = require('md5')

export const GenerateLink = ( address : string ) => {
    const message = address + "" + (new Date().getTime()) + (Math.random() * 1000000000)
    return md5(message)
}
