const FS = require('fs')

const filePath = '../../admin.log';

function WriteLog ( address, message ) {
    const time = new Date()
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    const TimeMark =`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const log = `${TimeMark} ${address} ${message}`

    fs.appendFile(filePath, log, (err) => {
       if (err) throw err;
       console.log('The new line was added to the file!');
    });

    return log
}

module.exports = {
    WriteLog
}