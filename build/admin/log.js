var FS = require('fs');
var connection = require('../database/connection').connection;
function WriteLog(address, message) {
    var time = new Date();
    var year = time.getFullYear();
    var month = ('0' + (time.getMonth() + 1)).slice(-2);
    var day = ('0' + time.getDate()).slice(-2);
    var hours = ('0' + time.getHours()).slice(-2);
    var minutes = ('0' + time.getMinutes()).slice(-2);
    var seconds = ('0' + time.getSeconds()).slice(-2);
    var TimeMark = "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hours, ":").concat(minutes, ":").concat(seconds);
    var log = "".concat(TimeMark, " ").concat(address, " ").concat(message);
    console.log(log);
    var log_query = "INSERT INTO logs (date, address, message) VALUES (to_timestamp(".concat(Math.round(time.getTime() / 1000), "), '").concat(address, "', '").concat(message, "');");
    connection.query(log_query);
    return log;
}
export { WriteLog };
//# sourceMappingURL=log.js.map