const mongoose = require('mongoose');
const { Schema } = mongoose;

// vytvoření schématu pro inzerát
let AdvertiseModel = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: false},
    priceType: {type: String, required: true},
    description: {type: String, required: true},
    type: {type: String, required: true},
    createdOn: {type: Date, required: true},
    lastUpdate: {type: Date, required: true},
    owner: {type: String, required: true},
    address: {
        city: {type: String, required: true},
        zipCode: {type: String, required: true}
    },
    id: String
});

// export vytvořeného modelu
module.exports = mongoose.model('advertise', AdvertiseModel);