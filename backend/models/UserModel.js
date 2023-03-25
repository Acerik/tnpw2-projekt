const mongoose = require('mongoose');
const { Schema } = mongoose;

let UserModel = new Schema({
    username: String,
    password: String,
    email: String,
    id: String
});

module.exports = mongoose.model('user', UserModel);