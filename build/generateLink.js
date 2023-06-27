var md5 = require('md5');
var GenerateLink = function (address) {
    var message = address + "" + (new Date().getTime()) + (Math.random() * 1000000000);
    return md5(message);
};
export { GenerateLink };
//# sourceMappingURL=generateLink.js.map