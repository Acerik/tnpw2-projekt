const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const PORT = 8080;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const UserManagement = require('./controllers/UserManagement');

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
    console.log(req.session.userId);
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
    }
});

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});