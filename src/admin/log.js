const FS = require('fs')

const filePath = '../../../admin.log';

function WriteLog ( address, message ) {
    const time = new Date()
    const year = time.getFullYear();
    const month = ('0' + (time.getMonth() + 1)).slice(-2);
    const day = ('0' + time.getDate()).slice(-2);
    const hours = ('0' + time.getHours()).slice(-2);
    const minutes = ('0' + time.getMinutes()).slice(-2);
    const seconds = ('0' + time.getSeconds()).slice(-2);

    const TimeMark =`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const log = `${TimeMark} ${address} ${message}`
    console.log(log)
    FS.appendFile(filePath, log, (err) => {
       if (err) throw err;
       console.log('The new line was added to the file!');
    });

    return log
}

module.exports = {
    WriteLog
}