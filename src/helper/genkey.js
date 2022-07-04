const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const genSalt = () => {
    return crypto.randomBytes(32).toString('hex');
}
const hashPassword = (myPlaintextPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                if(err) reject(err);
                resolve({hash, salt});
            });
        });
    })
}
const comparePass = (myPlaintextPassword, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(myPlaintextPassword, hash).then(function(result) {
            resolve(result);
        });
    })
    
}
module.exports = {genSalt, hashPassword, comparePass};
