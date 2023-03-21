const mongoose = require('mongoose');
const { Schema } = mongoose;

var UserModel = new Schema({
    username: String,
    password: String,
    email: String,
    id: String
});

module.exports = mongoose.model('user', UserModel);