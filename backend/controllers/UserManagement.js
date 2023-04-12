const UserModel = require("../models/UserModel");
const bcrypt = require('bcrypt');
const validator = require('validator');
const fs = require('fs');
const mongoose = require("mongoose");
const saltRounds = 10;

const MinPasswordLength = 4;

exports.CountUsers = async () => {
    return (UserModel.countDocuments());//.then(num => {return !(num > 0)}).catch(err => {console.log(err);return false});
}

exports.InitData = (path) => {
    if(!fs.existsSync(path)){
        console.log("Soubor podle zadané cesty nebyl nalezen. Cesta: " + path);
        return;
    }
    let raw = fs.readFileSync(path);
    let usersJson = JSON.parse(raw);
    usersJson.forEach(user => {
        user["_id"] = mongoose.mongo.ObjectId.createFromHexString(user["_id"]["$oid"]);
        user["createdOn"] = new Date(Number(user["createdOn"]["$date"]["$numberLong"]));
    });
    UserModel.collection.insertMany(usersJson).then(res => {
        console.log("Uživatelé byli úspěšně vloženi, počet vložených uživatelů: " + res.insertedCount)
    }).catch(err=>{
        console.log(err);
    });
}

exports.Registration = async (data, res) => {
    let errors = Array();
    if (data.password !== data.confirmPassword) {
        errors.push("Hesla se neshodují");
    }

    if(!validator.isEmail(data.email)){
        errors.push("Byl chybně zadán email.")
    }
    if(data.username.length < 3){
        errors.push("Uživatelské jméno musí obsahovat alespoň 3 znaky.")
    }
    if(data.password.length < MinPasswordLength) {
        errors.push("Heslo musí obsahovat alespoň 4 znaky.")
    }
    if (errors.length !== 0) {
        res.send(errors);
        return;
    }
    let salt = bcrypt.genSaltSync(saltRounds);
    data.password = bcrypt.hashSync(data.password, salt);
    data.confirmPassword = bcrypt.hashSync(data.confirmPassword, salt);
    //check if username is taken
    UserModel.findOne({username: data.username}).then(findUsername => {
        if(findUsername == null){
            UserModel.findOne({email: data.email}).then(findEmail => {
                if(findEmail == null) {
                    data.createdOn = Date.now();
                    const userToSave = new UserModel(data);
                    userToSave.save().then(() => {
                            res.send("ok");
                    }).catch((err) => {
                        console.log(err);
                    });
                } else {
                    errors.push("Email je již použit.");
                    res.send(errors);
                }
            });
        } else {
            errors.push("Uživatelské jméno je již obsazeno.");
            res.send(errors);
        }
    });
}

exports.Login = (data, res, req) => {
    let errors = Array();
    UserModel.findOne({email:data.email}).then(userEmail => {
        if(userEmail != null){
            if(bcrypt.compareSync(data.password, userEmail.password)){
                req.session.userId = userEmail._id.toString();
                req.session.save();
                delete userEmail.password;
                delete userEmail.email;
                res.send(userEmail);
            } else {
                errors.push("Zadané heslo je špatné.");
                res.send(errors);
            }
        } else {
            errors.push("Uživatel s tímto emailem nebyl nalezen.");
            res.send(errors);
        }
    });
}

exports.GetUser = (userId, res) => {
    UserModel.findById(userId).lean().then(user => {
        delete user["password"];
        res.send(user);
    }).catch(err=> {
        console.log(err);
    });
}

exports.EditUser = async (data, res) => {
    UserModel.findById(data._id).lean().then(async currentUserDb => {
        // check changes
        // if mail changes => check usage
        if (data.email !== currentUserDb.email) {
            let emailUsageUser = await UserModel.findOne({email: data.email}).then(r => {return r;});
            if(emailUsageUser){
                res.send(["Email je již použit."]);
                return null;
            }
        }
        // if password change => passwordOld with current password same check, new password check with confirmPassword
        if(data.password.length > 1 && data.confirmPassword.length > 1) {
            if(data.password.length < MinPasswordLength || data.confirmPassword.length < MinPasswordLength){
                res.send(["Heslo musí být minimálně " + (MinPasswordLength) + " znaků dlouhé."]);
                return null;
            }
            if (data.password === data.confirmPassword) {
                if (!bcrypt.compareSync(data.oldPassword, currentUserDb.password)) {
                    res.send(["Staré heslo není správné."]);
                    return null;
                } else {
                    let salt = bcrypt.genSaltSync(saltRounds);
                    data.password = bcrypt.hashSync(data.password, salt);
                    data.confirmPassword = data.password;
                }
            } else {
                res.send(["Nová hesla se nerovnají."]);
                return null;
            }
        } else {
            data.password = currentUserDb.password;
        }
        delete data["confirmPassword"];
        delete data["oldPassword"];
        // do update
        UserModel.findByIdAndUpdate(data._id, data).then(updatedUser => {
            res.send("Úprava byla provedena.");
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
}