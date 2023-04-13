const mongoose = require('mongoose');
const { Schema } = mongoose;

// vytvoření schématu pro uživatele
let UserModel = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    createdOn: {type: Date, required: true},
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    phoneNumber: {type: String, required: false},
    address: {
        zipCode: {type: String, required: false},
        city: {type: String, required: false}
    }
});

// export vytvořeného modelu ze schématu
module.exports = mongoose.model('user', UserModel);