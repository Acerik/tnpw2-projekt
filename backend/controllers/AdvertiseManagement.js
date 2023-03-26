const AdvertiseModel = require('../models/AdvertiseModel');
const UserModel = require('../models/UserModel');

exports.AddAdvertise = (userId, data, res) => {
    const advertiseToAdd = new AdvertiseModel(data);
    advertiseToAdd.owner = userId;
    advertiseToAdd.save().then(() => {
        res.send("Uloženo");
    }).catch(err => {
        console.log(err);
    });
}

exports.GetAdvertiseToShow = (advertiseId, res) => {
    AdvertiseModel.findById(advertiseId).lean().then((advertiseFind) => {
        UserModel.findById(advertiseFind.owner).lean().then(userFind => {
            advertiseFind.ownerName = userFind.username;
            res.send(advertiseFind);
        });
    }).catch(err=>{
        console.log(err);
        res.send("ERROR");
    });
}

exports.GetAdvertisesFromUser = (userId, res) => {
    AdvertiseModel.find({owner: userId}).lean().then(advertises => {
        res.send(advertises);
    }).catch(err => {
        console.log(err);
    });
}