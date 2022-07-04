const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RoleSchema = new Schema({
    nameRol: {
        type: String,
        required : true,
    }
}, {collection : 'roles'});

module.exports = {'Roles' : mongoose.Model("Roles", RoleSchema)};
