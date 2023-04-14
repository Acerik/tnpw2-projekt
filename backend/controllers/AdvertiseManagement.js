const AdvertiseModel = require('../models/AdvertiseModel');
const UserModel = require('../models/UserModel');
const fs = require("fs");
const mongoose = require("mongoose");

// řazení od nejstarších
const defaultSortCreatedOn = 1;

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
    let advertisesJson = JSON.parse(raw);
    // průchod načtených dat
    advertisesJson.forEach(advertise => {
        // přetypování _id na ObjectId typ pro MongoDB, přetypování je nutné vzhledem k způsobu exportu z MongoDB Compass
        advertise["_id"] = mongoose.mongo.ObjectId.createFromHexString(advertise["_id"]["$oid"]);
        // přetypování datumu s časem na Date z uloženého vyjádření skrze číselnou hodnotu
        advertise["createdOn"] = new Date(Number(advertise["createdOn"]["$date"]["$numberLong"]));
        // přetypování datumu s časem na Date z uloženého vyjádření skrze číselnou hodnotu
        advertise["lastUpdate"] = new Date(Number(advertise["lastUpdate"]["$date"]["$numberLong"]));
    });
    // vložení dat do DB
    AdvertiseModel.collection.insertMany(advertisesJson).then(res => {
        console.log("Inzeráty byly úspěšně vloženy, počet vložených inzerátů: " + res.insertedCount)
    }).catch(err=>{
        console.log(err);
    });
}
/**
 * Metoda slouží k získání počtu inzerátů v databázi
 * */
exports.CountAdvertises =async () => {
    return (AdvertiseModel.countDocuments());
}

/**
 * Metoda sloužící k přidání inzerátu
 * @param userId Id uživatele, který přidává inzerát
 * @param data Vstupní data s informacemi o inzerátu
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.AddAdvertise = (userId, data, res) => {
    // doplnění potřebných informací pro uložení
    const advertiseToAdd = new AdvertiseModel(data);
    advertiseToAdd.owner = userId;
    let now = Date.now();
    advertiseToAdd.createdOn = now;
    advertiseToAdd.lastUpdate = now;
    // uložení do databáze
    advertiseToAdd.save().then((saved) => {
        res.send({message: "Uloženo", data: saved});
    }).catch(err => {
        res.send(["Chyba při ukládání do databáze. Kontaktujte správce."]);
        console.log(err);
    });
}

/**
 * Metoda sloužící k vyhledání a získání inzerátu podle zadaného id
 * @param advertiseId Id inzerátu, který se má vyhledat a vrátit
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.GetAdvertiseToShow = (advertiseId, res) => {
    // vyhledání inzerátu podle id
    AdvertiseModel.findById(advertiseId).lean().then((advertiseFind) => {
        // vyhledání uživatele podle majitele článku
        UserModel.findById(advertiseFind.owner).lean().then(userFind => {
            // přidání uživatelského jména k datům k odeslání
            advertiseFind.ownerName = userFind.username;
            res.send(advertiseFind);
        }).catch(err2 => {
            console.log(err2);
            res.send(["Autor k článku nebyl nalezen."]);
        });
    }).catch(err => {
        console.log(err);
        res.send(["Článek nebyl v databázi nalezen."]);
    });
}

/**
 * Metoda slouží k získání informací o inzerátu pro editaci a kontrole zda uživatel může editovat inzerát
 * @param data Vstupní data obsahující informace potřebné pro ověření zda může uživatel editovat inzerát
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.GetAdvertiseEdit = (data, res) => {
    // získání inzerátu podle id
    AdvertiseModel.findById(data.advertiseId).then(advertiseFind => {
        // kontrola zda je uživatel majitel inzerátu
        if (data.userId === advertiseFind.owner) {
            res.send(advertiseFind);
        } else {
            res.send(["Nejste autorem tohoto inzerátu."]);
        }
    }).catch(err => {
        console.log(err);
        res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
    });
}

/**
 * Metoda sloužící k aktualizaci informaccí po editaci inzerátu
 * @param userId id uživatele, který odeslal inzerát, který se má uložit po úpravě
 * @param data Vstupní data o upraveném inzerátu, které se mají aktualizovat v databázi
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.EditAdvertise = (userId, data, res) => {
    // vyhledání původního inzerátu
    AdvertiseModel.findById(data._id).then(advertiseFind => {
        // kontrola autora inzerátu
        if (advertiseFind.owner === userId) {
            // nastavení poslední úpravy a uložení
            data.lastUpdate = Date.now();
            AdvertiseModel.findByIdAndUpdate(data._id, data).then(updateResult => {
                res.send("Inzerát byl upraven.");
            }).catch(errUpdate => {
                console.log(errUpdate);
                res.send(["Chyba při ukládání do databáze. Kontaktujte správce."]);
            });
        } else {
            res.send(["Uživatel autorem inzerátu, úprava tedy není možná"]);
        }
    }).catch(err => {
        console.log(err);
        res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
    });
}

/**
 * Metoda slouží k vyhledání článku pro konkrétního uživatele.
 * @param userId Id uživatele pro kterého se mají články vyhledat
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.GetAdvertisesFromUser = (userId, res) => {
    //vyhledání podle id a seřazení podle času
    AdvertiseModel.find({owner: userId}).sort({createdOn:defaultSortCreatedOn}).lean().then(advertises => {
        res.send(advertises);
    }).catch(err => {
        console.log(err);
        res.send(["Chyba při načítání z databáze."]);
    });
}

/**
 * Metoda slouží k návratu inzerátů do listu podle případně zadané stránky a hledaného textu
 * @param page Číslo stránky pro kterou se mají zobrazit inzeráty
 * @param search Text pro výhledávání inzerátů
 * @param sort Číselná hodnota vyjadřující řazení inzerátů
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.GetAdvertiseList = (page, search, sort, res) => {
    // přídana kontrola zda je zadáno řazení inzerátů pokud ne zvolí se výchozí od nejstarších
    sort = sort ? Number(sort) : defaultSortCreatedOn;
    // omezení počtu inzerátů na stránku, v konstantě z důvodu případné rozšířitelnosti na variabilní počet
    const perPage = 20;
    // kontrola zda byla stránka zadána případně vložena na výchozí hodnotu 1
    if (!page || page < 1) {
        page = 1;
    }
    // rozdělení zda se má vyhledávat nebo ne
    // dělení je zachováno z důvodů vyzkoušení více možností jak "vyseknout" potřebnou část ze všech inzerátů
    if(search !== "false"){
        // vyhledávání s využitím regexu z mongodb najde zadaný text v atributu name
        // není case sensitive a zahrne inzeráty kde je hledaný text pouze částí názvu
        AdvertiseModel.find({name: {"$regex": search, "$options":"i"}})
            .sort({createdOn:sort}).lean().then(searchedAdvertises=> {
            if(!searchedAdvertises || searchedAdvertises.length === 0){
                // nebyl nalezen žádný inzerát
                res.send(["Žádný inzerát obsahující v názvu: " + search + " nebyl nalezen."]);
                return;
            }
            // výpočet maximální možné stránky, přeskočení atd
            let maxPage = Math.ceil(searchedAdvertises.length/perPage);
            page = page > maxPage ? maxPage : page;
            let skip = perPage * (page-1);
            // výběr pouze potřebných dat ze všech
            searchedAdvertises = searchedAdvertises.slice(skip, (skip+perPage));
            // odeslání
            res.send({advertises: searchedAdvertises, page: page, maxPage: maxPage});
        }).catch(err=> {
            console.log(err);
        });
    } else {
        // zjištění počtu inzerátů v databázi
        AdvertiseModel.countDocuments().then(numberOfDocuments => {
            // výpočet maximálni hodnoty pro číslo stránky
            let maxPage = Math.ceil(numberOfDocuments / perPage);
            // kontrola zda není stránka větší nežli maximum případně úprava stránky
            if (page > maxPage) {
                page = maxPage;
            }
            // výpočet počtu inzerátů, které se mají přeskočit
            let skip = perPage * (page - 1);
            // vyhledání inzerátů s limitem podle počtu na stránku a přeskočením předchozích
            AdvertiseModel.find().sort({createdOn: sort}).skip(skip).limit(perPage).lean().then(advertises => {
                // odeslání inzerátů včetně stránky a maximální hodnoty pro číslo stránky
                res.send({advertises, page, maxPage});
            }).catch(err => {
                console.log(err);
                res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
            });
        }).catch(err => {
            console.log(err);
            res.send(["Chyba při načítání z databáze. Kontaktujte správce."]);
        });
    }
}

/**
 * Metoda slouží ke smazání inzerátu
 * @param data Vstupní data z informacemi o inzerátu, který se má smazat
 * @param res Objekt sloužící k odeslání odpovědi na požadavek
 * */
exports.DeleteAdvertise = (data, res) => {
    // vyhledání inzerátu
    AdvertiseModel.findById(data.advertiseId).lean().then(advertise => {
        // kontrola zda je uživatel majitel
        if (data.userId === advertise.owner) {
            // smazání inzerátu.
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