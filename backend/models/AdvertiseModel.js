const mongoose = require('mongoose');
const { Schema } = mongoose;

let AdvertiseModel = new Schema({
    name: String,
    price: Number,
    priceType: String,
    description: String,
    type: String,
    createdOn: Date,
    lastUpdate: Date,
    owner: String,
    id: String
});

module.exports = mongoose.model('advertise', AdvertiseModel);