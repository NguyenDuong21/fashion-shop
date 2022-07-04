const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginSchema = new Schema({
    username : {
        type: String, 
        lowercase : true,
        required : [true, "Username can't blank"],
        index : true
    },
    userId : {
        type : mongoose.Types.ObjectId,
        required : true,
        index : true,
        ref : 'Users'
    }, 
    role : {
        type : mongoose.Types.ObjectId,
        required : true,
        ref : 'Roles'
    }
    
});

module.exports = mongoose.model('Login', LoginSchema);