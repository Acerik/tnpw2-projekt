const AdvertiseModel = require('../models/AdvertiseModel');

exports.AddAdvertise = (userId, data, res) => {
    const advertiseToAdd = new AdvertiseModel(data);
    advertiseToAdd.owner = userId;
    advertiseToAdd.save().then(() => {
        res.send("Uloženo");
    }).catch(err => {
        console.log(err);
    });
}