const UserModel = require("../models/UserModel");
const bcrypt = require('bcrypt');
const validator = require('validator');
const fs = require('fs');
const mongoose = require("mongoose");
const saltRounds = 10;

const MinPasswordLength = 4;

/**
 * Metoda slouží k získání počtu uživatelů v databázi
 * */
exports.CountUsers = async () => {
    return (UserModel.countDocuments());
}

/**
 * Slouží k načtení uživatelů z Json souboru ze zadané cesty a uložení do databáze.
 * @param path Cesta k JSON souboru s předdefinovanými uživateli do databáze.
 * */
exports.InitData = (path) => {
    // kontrola zda soubor existuje
    if(!fs.existsSync(path)){
        console.log("Soubor podle zadané cesty nebyl nalezen. Cesta: " + path);
        return;
    }
    // načtení souboru a následný parse do JSON struktury
    let raw = fs.readFileSync(path);
    let usersJson = JSON.parse(raw);
    // průchod načtených dat
    usersJson.forEach(user => {
        // přetypování _id na ObjectId typ pro MongoDB, přetypování je nutné vzhledem k způsobu exportu z MongoDB Compass
        user["_id"] = mongoose.mongo.ObjectId.createFromHexString(user["_id"]["$oid"]);
        // přetypování datumu s časem na Date z uloženého vyjádření skrze číselnou hodnotu
        user["createdOn"] = new Date(Number(user["createdOn"]["$date"]["$numberLong"]));
    });
    // vložení připravených dat
    UserModel.collection.insertMany(usersJson).then(res => {
        console.log("Uživatelé byli úspěšně vloženi, počet vložených uživatelů: " + res.insertedCount)
    }).catch(err=>{
        console.log(err);
    });
}

/**
 * Metoda pro registraci uživatele, provede validaci, kontrolu existence emailu, kontrolu shody hesel, minimální délky, šifrování hesla
 * @param data JSON data, které obsahují jednotlivé atributy o uživateli, který se chce registrovat
 * @param res Objekt sloužící k odpovědi dotazu.
 * */
exports.Registration = async (data, res) => {
    // průchod dat a hledání chyb, neshoda hesel, špatně zadaný email, minimální délky
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
    // pokud byla nalezena alespoň jedna chyba dojde k jejich odeslání v poli.
    if (errors.length !== 0) {
        res.send(errors);
        return;
    }
    // hashování pomocí bCrypt algoritmu
    let salt = bcrypt.genSaltSync(saltRounds);
    data.password = bcrypt.hashSync(data.password, salt);
    data.confirmPassword = bcrypt.hashSync(data.confirmPassword, salt);
    UserModel.findOne({username: data.username}).then(findUsername => {
        // kontrola zda je uživatel s tímto jménem registrován.
        if(findUsername == null){
            UserModel.findOne({email: data.email}).then(findEmail => {
                // kontrola zda je uživatel s tímto emailem už registrován
                if(findEmail == null) {
                    // přidání data registrace a uložení do databáze.
                    data.createdOn = Date.now();
                    const userToSave = new UserModel(data);
                    userToSave.save().then(() => {
                            res.send("ok");
                    }).catch((err) => {
                        console.log(err);
                        res.send(["Chyba při ukládání do databáze. Kontaktujte správce."]);
                    });
                } else {
                    // odeslání chyb
                    errors.push("Email je již použit.");
                    res.send(errors);
                }
            });
        } else {
            // odeslání chyb
            errors.push("Uživatelské jméno je již obsazeno.");
            res.send(errors);
        }
    }).catch(err=>{
        console.log(err);
        res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
    });
}

/**
 * Metoda sloužící k přihlášení uživatele, metoda také provede uložení userId do session
 * @param data vstupní data od uživvatele obsahující údaje k přihlášení
 * @param res objekt sloužící pro návrat dat zpět z api
 * @param req objekt s příchozí informací, slouží k uložení userId do session
 * */
exports.Login = (data, res, req) => {
    let errors = Array();
    // hledání uživatele podle dat
    UserModel.findOne({email:data.email}).then(userEmail => {
        if(userEmail != null){
            // kontrola hesla s uloženým
            if(bcrypt.compareSync(data.password, userEmail.password)){
                // uložení userId do session
                req.session.userId = userEmail._id.toString();
                req.session.save();
                // smazání hesla a emailu z odpovědi z databáze a odeslání zbylých informací
                delete userEmail.password;
                delete userEmail.email;
                res.send(userEmail);
            } else {
                // odeslání chyby
                errors.push("Zadané heslo je špatné.");
                res.send(errors);
            }
        } else {
            // odeslání chyby
            errors.push("Uživatel s tímto emailem nebyl nalezen.");
            res.send(errors);
        }
    }).catch(err=>{
        console.log(err);
        res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
    });
}

/**
 * Metoda sloužící pro získání uživatele podle jeho id
 * @param userId uživatelské id, slouží k výběru uživatele
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.GetUser = (userId, res) => {
    // nalezení uživatele, smazání hesla a případné odeslání.
    UserModel.findById(userId).lean().then(user => {
        delete user["password"];
        res.send(user);
    }).catch(err=> {
        console.log(err);
        res.send(["Uživatel nebyl nalezen."]);
    });
}

/**
 * Metoda slouží k validaci změn v profilu a jejich následnému uložení do databáze.
 * @param data vstupní data s upravenými informacemi po úpravě profilu
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.EditUser = async (data, res) => {
    UserModel.findById(data._id).lean().then(async currentUserDb => {
        // kontrola změn
        // kontrola zda je email rozdílný
        if (data.email !== currentUserDb.email) {
            // zjištění zda je email použit, pokud ano vrátí chybu
            let emailUsageUser = await UserModel.findOne({email: data.email}).then(r => {return r;});
            if(emailUsageUser){
                res.send(["Email je již použit."]);
                return null;
            }
        }
        // pokud data obsahují heslo a potvrzovací heslo, uživatel chce heslo změnit, tudíž dojde ke kontrole a validaci
        if(data.password.length > 1 && data.confirmPassword.length > 1) {
            if(data.password.length < MinPasswordLength || data.confirmPassword.length < MinPasswordLength){
                res.send(["Heslo musí být minimálně " + (MinPasswordLength) + " znaků dlouhé."]);
                return null;
            }
            // pokud se zadaná hesla shodují
            if (data.password === data.confirmPassword) {
                // kontrola zda je staré heslo správné
                if (!bcrypt.compareSync(data.oldPassword, currentUserDb.password)) {
                    res.send(["Staré heslo není správné."]);
                    return null;
                } else {
                    // pokud ano dojde k zašifrování nového hesla
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
        // odstranění hesel potřebných pouze pro kontroly a ověření
        delete data["confirmPassword"];
        delete data["oldPassword"];
        // aktualizace uživatele v databázi
        UserModel.findByIdAndUpdate(data._id, data).then(updatedUser => {
            res.send("Úprava byla provedena.");
        }).catch(err => {
            console.log(err);
            res.send(["Chyba při ukládání do databáze. Kontaktujte správce."]);
        });
    }).catch(err => {
        console.log(err);
        res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
    });
}