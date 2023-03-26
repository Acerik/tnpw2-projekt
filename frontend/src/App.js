import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Registration from './views/Registration';
import Login from './views/Login';
import Navbar from './views/NavbarMenu';
import MyProfile from "./views/MyProfile";
import AddAdvertise from "./views/advertises/AddAdvertise";
import ShowAdvertise from "./views/advertises/ShowAdvertise";

function App() {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path='/registrace' element={<Registration/>}/>
                <Route path='/prihlaseni' element={<Login/>}/>
                <Route path='/muj-profil' element={<MyProfile/>}/>
                <Route path='/pridat-inzerat' element={<AddAdvertise />}/>
                <Route path='/inzerat/:advertiseId' element={<ShowAdvertise/>}/>
            </Routes>
        </Router>
    );
}

export default App;
