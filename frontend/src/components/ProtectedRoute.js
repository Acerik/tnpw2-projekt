import { Navigate } from 'react-router-dom';
import {useCookies} from "react-cookie";
import React from 'react';

/**
 * Slouží k tvorbě cest s oprávněným přístupem pouze pro přihlášené, případně pouze pro nepříhlašení.
 * @param childrenRoute Komponenta, která se předá v případě oprávněného přístupu
 * @param mustBeLogged Boolean, rozhoduje, zda se má kontrolovat přihlášení uživatele (true pouze pro přihlášené, false pouze pro nepříhlašené)
 * @param alternativePath String, slouží jako alternativní cesta pokud není splněna autorizace na základě požadavků
 * */
export const ProtectedRoute = ({childrenRoute, mustBeLogged, alternativePath}) => {
    // získání id uživatele z cookies a ověření zda obsahuje validní hodnotu
    const [cookies] = useCookies('userId');
    let userLogged = (cookies.userId === undefined) ? false : cookies.userId.length > 9;
    // pokud uživatel musí být přihlášen ale není dojde k přesměrování na alternativní cestu
    if(mustBeLogged && !userLogged){
        alternativePath = alternativePath ? alternativePath : "";
        return <Navigate to={alternativePath}/>
    }
    // pokud uživatel nesmí být přihlášen ale je dojde k přesměrování na alternativní cestu
    if(!mustBeLogged && userLogged){
        alternativePath = alternativePath ? alternativePath : "";
        return <Navigate to={alternativePath}/>
    }
    // přesměrování na zabezpečenou komponentu
    return childrenRoute;
};