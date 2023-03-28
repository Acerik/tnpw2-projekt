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

exports.DeleteAdvertise = (data, res) => {
    AdvertiseModel.findById(data.advertiseId).lean().then(advertise => {
        if(data.userId === advertise.owner){
            AdvertiseModel.findByIdAndRemove(data.advertiseId).then(deletedAdvertise => {
                res.send("Inzerát s názvem: \"" + deletedAdvertise.name + "\" byl smazán.");
            }).catch(err => {
                console.log(err);
                res.send(Array["Chyba při mazání inzerátu."]);
            });
        } else {
            res.send(Array(["Uživatel není autorem inzerátu. Inzerát s názvem: "+ advertise.name]));
        }
    }).catch(err => {
        console.log(err);
        res.send(Array(["Inzerát nebyl nalezen."]));
    });
};