const AdvertiseModel = require('../models/AdvertiseModel');
const UserModel = require('../models/UserModel');

exports.AddAdvertise = (userId, data, res) => {
    const advertiseToAdd = new AdvertiseModel(data);
    advertiseToAdd.owner = userId;
    let now = Date.now();
    advertiseToAdd.createdOn = now;
    advertiseToAdd.lastUpdate = now;
    advertiseToAdd.save().then((saved) => {
        res.send({message: "Uloženo", data: saved});
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
    }).catch(err => {
        console.log(err);
        res.send("ERROR");
    });
}

exports.GetAdvertiseEdit = (data, res) => {
    AdvertiseModel.findById(data.advertiseId).then(advertiseFind => {
        if (data.userId === advertiseFind.owner) {
            res.send(advertiseFind);
        } else {
            //not own the advertise
            res.send(["Nejste autorem tohoto inzerátu."]);
        }
    }).catch(err => {
        console.log(err);
    });
}

exports.EditAdvertise = (userId, data, res) => {
    AdvertiseModel.findById(data._id).then(advertiseFind => {
        if (advertiseFind.owner === userId) {
            data.lastUpdate = Date.now();
            AdvertiseModel.findByIdAndUpdate(data._id, data).then(updateResult => {
                res.send("Inzerát byl upraven.");
            });
        } else {
            res.send(["Uživatel autorem inzerátu, úprava tedy není možná"]);
        }
    }).catch(err => {
        console.log(err);
    });
}

exports.GetAdvertisesFromUser = (userId, res) => {
    AdvertiseModel.find({owner: userId}).lean().then(advertises => {
        res.send(advertises);
    }).catch(err => {
        console.log(err);
    });
}

exports.GetAdvertiseList = (page, res) => {
    const perPage = 20;
    if (!page || page < 1) {
        page = 1;
    }
    AdvertiseModel.countDocuments().then(numberOfDocuments => {
        let maxPage = Math.ceil(numberOfDocuments / perPage);
        if (page > maxPage) {
            page = maxPage;
        }
        let skip = perPage * (page - 1);
        AdvertiseModel.find().skip(skip).limit(perPage).lean().then(advertises => {
            res.send({advertises, page, maxPage});
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
}

exports.DeleteAdvertise = (data, res) => {
    AdvertiseModel.findById(data.advertiseId).lean().then(advertise => {
        if (data.userId === advertise.owner) {
            AdvertiseModel.findByIdAndRemove(data.advertiseId).then(deletedAdvertise => {
                res.send("Inzerát s názvem: \"" + deletedAdvertise.name + "\" byl smazán.");
            }).catch(err => {
                console.log(err);
                res.send(Array["Chyba při mazání inzerátu."]);
            });
        } else {
            res.send(Array(["Uživatel není autorem inzerátu. Inzerát s názvem: " + advertise.name]));
        }
    }).catch(err => {
        console.log(err);
        res.send(Array(["Inzerát nebyl nalezen."]));
    });
};