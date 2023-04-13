const express = require("express");
const readline = require('readline');
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const PORT = 8080;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const UserManagement = require('./controllers/UserManagement');
const AdvertiseManagement = require('./controllers/AdvertiseManagement');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

main().catch(err =>console.log(err));
main().then(() => {
    //pokud je databáze úspěšně připojena
    console.log("Připojení k MongoDB, se zdařilo.");
    // kontrola počtu záznamů v jednotlivých kolekcích.
    AdvertiseManagement.CountAdvertises().then(advertises => {
       UserManagement.CountUsers().then(users => {
           if(users === 0 && advertises === 0) {
               console.log("Databáze je prázdná.");
               // dotaz na uživatele zda chce importovat předdefinovaná data
               rl.question("Chcete vložit předdefinovaná data do databáze? Zadejte: y - ano | n - ne.", option=> {
                   if(option.toLowerCase().trim() === "y" || option.toLowerCase().trim() === "yes"){
                       console.log("Začínám vkládat data do databáze.");
                       UserManagement.InitData("../mongodb-backup/users.json");
                       AdvertiseManagement.InitData("../mongodb-backup/advertises.json");
                   } else {
                       console.log("Data nebudou vložena do databáze, pokud by jste chtěli data vložit, je nutné restartovat server.");
                   }
               });
           }
       });
    });
});
//  nastavení pro sessions, využítí sessions pro udržení přihlášeného uživatele na straně backendu
app.use(sessions({
    secret:"thisissecretkey",
    saveUninitialized: true,
    cookie: {maxAge: (1000 * 60 * 60)},// 1 hour
    resave: true
}));
// nastavení pro práci s cookies a cors policy kvůli axios dotazům na frontendu
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
// nastavení pro výstupy ve formátu json
app.use(express.json());

// pokus o připojení do databáze
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/vana-inzertni-web');
}
/**
 *  Část s API dotazy, u některých dotazů dochází ke kontrole userId v session, pokud session obsahuje userId, pak je uživatel přihlášen
 * skrze session dochází k zabránění nežádoucích operací vzhledem k přihlášení či nepřihlášení uživatele
 * pokud je je návrat skrze res.send jako Array, pak se jedná o chybovou hlášku, jedná se o rozlišení, díky kterému lze poznat, zda se jedná
 * o úspěšné splnění požadavku či nikoliv.
 *  Plnění většiny dotazů je odkázáno na příslušný kontroller.
 * */
// post pro zpracování registrace
app.post('/api/registration', (req, res) => {
    const regInfo = req.body;
    if(req.session.userId){
        res.send(Array("Uživatel je již přihlášen."));
    } else {
        UserManagement.Registration(regInfo, res);
    }
});
// post pro přihlášení uživatele
app.post('/api/login', (req, res) => {
    if(req.session.userId){
        res.send(Array("Uživatel je již přihlášen."));
    } else {
        UserManagement.Login(req.body, res, req);
    }
});
// get sloužící k odhlášení uživatele
app.get('/api/logout', (req, res) => {
    if(req.session.userId) {
        req.session.destroy();
        res.send("Uživatel byl odhlášen.");
    } else {
        //not logged
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// get sloužící ke kontrole zda je uživatel přihlášen, případně vrátí jeho id (slouží pro uložení do cookies)
app.get('/api/logged-in', (req, res) => {
    if(req.session.userId){
        res.send({
            logged: true,
            userId: req.session.userId
        });
    } else {
        res.send(false);
    }
});
// get sloužící pro získání informací pro editaci uživatelského profilu
app.get('/api/edit-user', (req, res) => {
    if(req.session.userId){
        UserManagement.GetUser(req.session.userId, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// put sloužící pro uložení změn při editaci uživatelského profilu
app.put('/api/edit-user', (req, res) => {
    if(req.session.userId) {
        let data = req.body;
        data._id = req.session.userId;
        UserManagement.EditUser(data, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// post pro přidání inzerátu
app.post('/api/add-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.AddAdvertise(req.session.userId, req.body, res);
    } else {
        //not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// get pro získání konkrétního inzerátu
app.get('/api/get-advertise', (req, res) => {
    AdvertiseManagement.GetAdvertiseToShow(req.query.advertiseId, res);
});
// get pro získání informací k editaci inzerátu
app.get('/api/edit-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.GetAdvertiseEdit({advertiseId: req.query.advertiseId, userId: req.session.userId}, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// put pro uložení změn při editaci inzerátu
app.put('/api/edit-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.EditAdvertise(req.session.userId, req.body, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// delete pro smazání inzerátu
app.delete('/api/delete-advertise', (req, res) => {
    if(req.session.userId){
        let data = {userId: req.session.userId, advertiseId: req.query.advertiseIdToDelete};
        AdvertiseManagement.DeleteAdvertise(data, res);
    } else {
        //not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});
// get pro získání stránky s inzeráty, lze vyhledávat a lze stránkovat
app.get('/api/get-advertise-list', (req, res) => {
    AdvertiseManagement.GetAdvertiseList(req.query.page, req.query.search, res);
});
// get pro získání uživatele pro zobrazení
app.get('/api/get-user', (req, res) => {
    UserManagement.GetUser(req.query.userId, res);
});
// get pro získání inzerátu od konkrétního uživatele pro zobrazení na profilu
app.get('/api/get-advertises-from-user', (req,res)=>{
    AdvertiseManagement.GetAdvertisesFromUser(req.query.userId, res);
});
// spuštění serveru
app.listen(PORT, () => {
    console.log("Server funguje na portu: " + PORT);
});