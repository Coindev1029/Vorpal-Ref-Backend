const md5 = require('md5')

const GenerateLink = ( address ) => {
    const message = address + "" + (new Date().getTime()) + (Math.random() * 1000000000)
    return md5(message)
}

export {
    GenerateLink
}