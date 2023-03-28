import React, {useState} from 'react';
import {Navbar, Container, Nav} from 'react-bootstrap';
import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import {useCookies} from 'react-cookie';
import {useNavigate} from "react-router-dom";


function NavbarMenu() {

    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies('userId');
    const [currentUser, setCurrentUser] = useState({
        loading: true,
        data: {
            logged: false,
            userId: ""
        },
        firstLoad: true
    });

    function logout() {
        axios.get(BASE_URL + "/logout", AxiosConfig).then(res => {
            alert(res.data);
            removeCookie('userId',{path: '/'});
            navigate(0);
        }).catch(err => {
            console.log(err);
        });
    }

    axios.get(BASE_URL + "/logged-in", AxiosConfig).then(res => {
        if(res.data.logged !== currentUser.data.logged) {
            setCurrentUser({
                loading: false,
                data:
                    {
                        logged: res.data.logged,
                        userId: res.data.userId
                    },
                firstLoad: false
            });
            setCookie('userId', res.data.userId, {path: '/'});
        }
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
                    {!currentUser.data.logged ? (
                        <Nav>
                            <Nav.Link href="/prihlaseni">Přihlásit</Nav.Link>
                            <Nav.Link href="/registrace">Registrace</Nav.Link>
                        </Nav>
                    ) : (
                        <Nav>
                            <Nav.Link href={"/uzivatel/" + currentUser.data.userId}>Můj profil</Nav.Link>
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