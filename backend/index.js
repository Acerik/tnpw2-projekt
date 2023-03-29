const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const PORT = 8080;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const UserManagement = require('./controllers/UserManagement');
const AdvertiseManagement = require('./controllers/AdvertiseManagement');

main().catch(err =>console.log(err));
main().then(res => console.log("MongoDB is connected"));

app.use(sessions({
    secret:"thisissecretkey",
    saveUninitialized: true,
    cookie: {maxAge: (1000 * 60 * 60)},// 1 hour
    resave: true
}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/inzerce');
}

app.post('/api/registration', (req, res) => {
    const regInfo = req.body;
    if(req.session.userId){
        res.send(Array("Uživatel je již přihlášen."));
    } else {
        UserManagement.Registration(regInfo, res);
    }
});

app.post('/api/login', (req, res) => {
    if(req.session.userId){
        res.send(Array("Uživatel je již přihlášen."));
    } else {
        UserManagement.Login(req.body, res, req);
    }
});

app.get('/api/logout', (req, res) => {
    if(req.session.userId) {
        req.session.destroy();
        res.send("Uživatel byl odhlášen.");
    } else {
        //not logged
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});

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

app.post('/api/add-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.AddAdvertise(req.session.userId, req.body, res);
    } else {
        //not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});

app.get('/api/get-advertise', (req, res) => {
    AdvertiseManagement.GetAdvertiseToShow(req.query.advertiseId, res);
});

app.get('/api/edit-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.GetAdvertiseEdit({advertiseId: req.query.advertiseId, userId: req.session.userId}, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});

app.put('/api/edit-advertise', (req, res) => {
    if(req.session.userId){
        AdvertiseManagement.EditAdvertise(req.session.userId, req.body, res);
    } else {
        // not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});

app.delete('/api/delete-advertise', (req, res) => {
    if(req.session.userId){
        let data = {userId: req.session.userId, advertiseId: req.query.advertiseIdToDelete};
        AdvertiseManagement.DeleteAdvertise(data, res);
    } else {
        //not logged in
        res.send(["Uživatel není přihlášen. Pro tento krok, je nutné se první přihlásit."]);
    }
});

app.get('/api/get-advertise-list', (req, res) => {
    AdvertiseManagement.GetAdvertiseList(req.query.page, res);
});

app.get('/api/get-user', (req, res) => {
    UserManagement.GetUserToShow(req.query.userId, res);
});

app.get('/api/get-advertises-from-user', (req,res)=>{
    AdvertiseManagement.GetAdvertisesFromUser(req.query.userId, res);
});

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});