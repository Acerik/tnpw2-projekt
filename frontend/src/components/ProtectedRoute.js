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
    const [cookies] = useCookies('userId');
    // kontrola skrze délku userid z cookies, při použití !== undefined, docházelo k chybám, které byly viditelné skrze console.log
    let userLogged = cookies.userId.length > 9;
    if(mustBeLogged && !userLogged){
        alternativePath = alternativePath ? alternativePath : "";
        return <Navigate to={alternativePath}/>
    }
    console.log(!mustBeLogged && userLogged);
    if(!mustBeLogged && userLogged){
        alternativePath = alternativePath ? alternativePath : "";
        return <Navigate to={alternativePath}/>
    }
    return childrenRoute;
};