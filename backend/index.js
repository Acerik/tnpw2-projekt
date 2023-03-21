const express = require("express");
const PORT = 8080;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const Registration = require('./controllers/UserManagement');

main().catch(err=>console.log(err));

app.use(cors());
app.use(express.json());

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/inzerce');
}

app.post('/api/registration', (req, res) => {
    const regInfo = req.body;
    Registration.Registration(regInfo, res);
});

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});