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
import {ProtectedRoute} from "./components/ProtectedRoute";
import {useCookies} from "react-cookie";
import ListAdvertises from "./views/advertises/ListAdvertises";

function App() {
    const [cookies] = useCookies('userId');

    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path='/inzeraty/:page' element={<ListAdvertises/>}/>
                <Route path='/inzeraty/' element={<ListAdvertises/>}/>

                <Route path='/inzerat/:advertiseId' element={<ShowAdvertise/>}/>
                <Route path='/uzivatel/:userId' element={<ShowUser/>}/>

                <Route path='/pridat-inzerat' element={
                    <ProtectedRoute childrenRoute={<AdvertiseEditor/>} mustBeLogged={true} alternativePath="/prihlaseni"/>}/>
                <Route path='/upravit-inzerat/:advertiseId' element={
                    <ProtectedRoute childrenRoute={<AdvertiseEditor/>} mustBeLogged={true} alternativePath="/prihlaseni"/>}/>

                <Route path='/prihlaseni' element={
                    <ProtectedRoute childrenRoute={<Login/>} mustBeLogged={false} alternativePath={"/uzivatel/" + cookies.userId}/>}/>
                <Route path='/registrace' element={
                    <ProtectedRoute childrenRoute={<Registration/>} mustBeLogged={false} alternativePath={"/uzivatel/" + cookies.userId}/>}/>
            </Routes>
        </Router>
    );
}

export default App;
