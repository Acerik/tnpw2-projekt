import React, {useState} from 'react';
import {Navbar, Container, Nav} from 'react-bootstrap';
import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import {useCookies} from 'react-cookie';
import {useNavigate} from "react-router-dom";


function NavbarMenu() {

    // příprava proměnných
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies('userId');
    const [currentUser, setCurrentUser] = useState({
        logged: false,
        userId: ""
    });

    // obsluha odhlášení
    function logout() {
        // dotaz na odhlášení, kvůli smazání session
        axios.get(BASE_URL + "/logout", AxiosConfig).then(res => {
            // zobrazení zprávy
            alert(res.data);
            // smazání cookies
            removeCookie('userId', {path: '/'});
            // obnova stránky
            navigate(0);
        }).catch(err => {
            console.log(err);
        });
    }

    // kontrola zda je uživatel přihlášen
    axios.get(BASE_URL + "/logged-in", AxiosConfig).then(res => {
        // pokud je stav přihlášení různý od backendu (session) dojde k aktualizaci
        if (res.data.logged !== currentUser.logged) {
            setCurrentUser({
                logged: res.data.logged,
                userId: res.data.userId
            });
            // aktualizace cookies
            setCookie('userId', res.data.userId, {path: '/'});
        }
    }).catch(err => {
        console.log(err);
    });

    // vykreslení
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                {/*Zobrazení navbaru*/}
                <Navbar.Brand href="/">Inzertní web</Navbar.Brand>
                {/*Nastavení responzivity*/}
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto"> {/*Levá část*/}
                        <Nav.Link href="/inzeraty/">Inzeráty</Nav.Link>
                    </Nav>

                    {!currentUser.logged ? (
                        <Nav>{/*Pravá část, pokud uživatel není přihlášen */}
                            <Nav.Link href="/prihlaseni">Přihlásit</Nav.Link>
                            <Nav.Link href="/registrace">Registrace</Nav.Link>
                        </Nav>
                    ) : (
                        <Nav>{/*Pravá část, pokud uživatel je přihlášen */}
                            <Nav.Link href={"/uzivatel/" + currentUser.userId}>Můj profil</Nav.Link>
                            <Nav.Link href="/pridat-inzerat">Přidat inzerát</Nav.Link>
                            <Nav.Link onClick={logout}>Odhlásit</Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarMenu;