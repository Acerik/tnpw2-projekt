const mongoose = require('mongoose');
const { Schema } = mongoose;

let UserModel = new Schema({
    username: String,
    password: String,
    email: String,
    createdOn: Date,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    address: {
        zipCode: String,
        city: String
    },
    id: String
});

module.exports = mongoose.model('user', UserModel);