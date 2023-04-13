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
import EditUser from "./views/users/EditUser";

function App() {
    const [cookies] = useCookies('userId');

    return (
        <Router>
            <Navbar/> {/*Zobrazení horního menu*/}
            <Routes> {/*Router pro cesty*/}
                {/*Cesty přístupné pro všechny bez ohledu na přihlášeného uživvatele*/}
                <Route path={'' || '/'} element={<ListAdvertises/>}/>
                <Route path='/inzeraty/:page' element={<ListAdvertises/>}/>
                <Route path='/inzeraty/' element={<ListAdvertises/>}/>

                <Route path='/inzerat/:advertiseId' element={<ShowAdvertise/>}/>
                <Route path='/uzivatel/:userId' element={<ShowUser/>}/>

                {/*Cesty pouze pro přihlášené uživatele, zabezpečené pomocí vlastní komponenty ProtectedRoute s nastavenými parametry*/}
                <Route path='/pridat-inzerat' element={
                    <ProtectedRoute childrenRoute={<AdvertiseEditor/>} mustBeLogged={true} alternativePath="/prihlaseni"/>}/>
                <Route path='/upravit-inzerat/:advertiseId' element={
                    <ProtectedRoute childrenRoute={<AdvertiseEditor/>} mustBeLogged={true} alternativePath="/prihlaseni"/>}/>
                <Route path='/upravit-profil' element={
                    <ProtectedRoute childrenRoute={<EditUser/>} mustBeLogged={true} alternativePath={'/prihlaseni'}/>}/>

                {/*Cesty pouze pro nepříhlášené uživatele, zabezpečené pomocí vlastní komponenty ProtectedRoute s nastavenými parametry*/}
                <Route path='/prihlaseni' element={
                    <ProtectedRoute childrenRoute={<Login/>} mustBeLogged={false} alternativePath={"/uzivatel/" + cookies.userId}/>}/>
                <Route path='/registrace' element={
                    <ProtectedRoute childrenRoute={<Registration/>} mustBeLogged={false} alternativePath={"/uzivatel/" + cookies.userId}/>}/>
            </Routes>
        </Router>
    );
}

export default App;
