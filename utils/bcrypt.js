var bcrypt = require('bcryptjs');

function encrypt (password){
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash
}

function decrypt(password, afterHash){
    return bcrypt.compareSync(password, afterHash); // true
}

module.exports = {encrypt, decrypt}