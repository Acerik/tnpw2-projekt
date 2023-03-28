import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Registration from './views/Registration';
import Login from './views/Login';
import Navbar from './views/NavbarMenu';
import AdvertiseEditor from "./views/advertises/AdvertiseEditor";
import ShowAdvertise from "./views/advertises/ShowAdvertise";
import ShowUser from "./views/users/ShowUser";

function App() {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path='/registrace' element={<Registration/>}/>
                <Route path='/prihlaseni' element={<Login/>}/>
                <Route path='/pridat-inzerat' element={<AdvertiseEditor />}/>
                <Route path='/inzerat/:advertiseId' element={<ShowAdvertise/>}/>
                <Route path='/uzivatel/:userId' element={<ShowUser/>}/>
                <Route path='/upravit-inzerat/:advertiseId' element={<AdvertiseEditor/>}/>
            </Routes>
        </Router>
    );
}

export default App;
