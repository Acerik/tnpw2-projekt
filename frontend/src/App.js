import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Registration from './views/Registration';
import Login from './views/Login';
import Navbar from './views/NavbarMenu';
import AddAdvertise from "./views/advertises/AddAdvertise";
import ShowAdvertise from "./views/advertises/ShowAdvertise";
import ShowUser from "./views/users/ShowUser";

function App() {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path='/registrace' element={<Registration/>}/>
                <Route path='/prihlaseni' element={<Login/>}/>
                <Route path='/pridat-inzerat' element={<AddAdvertise />}/>
                <Route path='/inzerat/:advertiseId' element={<ShowAdvertise/>}/>
                <Route path='/uzivatel/:userId' element={<ShowUser/>}/>
            </Routes>
        </Router>
    );
}

export default App;
