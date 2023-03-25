import React, {useState} from 'react';
import {Navbar, Container, Nav} from 'react-bootstrap';
import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../AxiosConfig";

function NavbarMenu() {

    const [currentUser, setCurrentUser] = useState({
        loading: true,
        logged: null,
        firstLoad: true
    });

    function logout() {
        axios.get(BASE_URL + "/logout", AxiosConfig).then(res => {
            alert(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

    axios.get(BASE_URL + "/logged-in", AxiosConfig).then(res => {
        setCurrentUser({
            loading: false,
            logged: res.data,
            firstLoad: false
        });
    }).catch(err => {
        console.log(err);
    });

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">Inzertní web</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#">ODKAZ</Nav.Link>
                    </Nav>
                    {!currentUser.logged ? (
                        <Nav>
                            <Nav.Link href="/prihlaseni">Přihlásit</Nav.Link>
                            <Nav.Link href="/registrace">Registrace</Nav.Link>
                        </Nav>
                    ) : (
                        <Nav>
                            <Nav.Link href="/muj-profil">Můj profil</Nav.Link>
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