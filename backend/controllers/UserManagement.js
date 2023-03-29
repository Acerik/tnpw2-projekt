const UserModel = require("../models/UserModel");
const bcrypt = require('bcrypt');
const validator = require('validator');
const saltRounds = 10;

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
    if(data.password.length < 4) {
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