import React, {useState} from 'react';
import {Navbar, Container, Nav, Form, Modal, Button} from 'react-bootstrap';
import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import {useCookies} from 'react-cookie';
import {useNavigate} from "react-router";


function NavbarMenu() {

    // příprava proměnných
    const navigate = useNavigate();
    const [modalInformation, setModalInformation] = useState({
        show: false,
        header: "",
        responseText: "",
        navigate: false
    });
    // může zobrazi chybu, že cookies nejsou použity, pokud se však smažou není možné využít setCookie
    const [cookies, setCookie, removeCookie] = useCookies('userId');
    const [currentUser, setCurrentUser] = useState({
        logged: false,
        userId: ""
    });

    const [searchText, setSearchText] = useState("");
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

    // obsluha odhlášení
    function logout() {
        // dotaz na odhlášení, kvůli smazání session
        axios.get(BASE_URL + "/logout", AxiosConfig).then(res => {
            // smazání cookies
            removeCookie('userId', {path: '/'});
            // zobrazení zprávy včetně přípravy dat
            setModalInformation({
                show: true,
                header: Array.isArray(res.data) ? "Chyba" : "Úspěch.",
                responseText: Array.isArray(res.data) ? res.data.join(" ") : res.data,
                navigate: 0
            });
        }).catch(err => {
            console.log(err);
        });
    }

    //obsluha vyhledávání
    function search(e) {
        e.preventDefault();
        if (searchText.trim()) {
            console.log(searchText);
            navigate('/inzeraty/hledat/' + searchText.trimStart().trimEnd());
            navigate(0);
        }
    }

    // obsluha pro zavření informačního upozornění
    function handleModalInformation() {
        // navigace na předchozí stránky podle potřeby
        if (modalInformation.navigate !== false) {
            navigate(modalInformation.navigate);
        }
        setModalInformation({show: false, header: "", responseText: "", navigate: false});
    }

    // vykreslení
    return (
        <>
            <Modal show={modalInformation.show} onHide={handleModalInformation}>
                <Modal.Header closeButton>{modalInformation.header}</Modal.Header>
                <Modal.Body>{modalInformation.responseText}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalInformation}>Zavřít</Button>
                </Modal.Footer>
            </Modal>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    {/*Zobrazení navbaru*/}
                    <Navbar.Brand href="/">Inzertní web</Navbar.Brand>
                    {/*Nastavení responzivity*/}
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto"> {/*Levá část*/}
                            <Nav.Link href="/inzeraty/">Inzeráty</Nav.Link>
                            <Form className="d-flex" onSubmit={search}>
                                <Form.Control type="search" placeholder="Vyhledat inzerát" className="me-2"
                                              aria-label="Vyhledat inzerát" value={searchText}
                                              onChange={e => setSearchText(e.target.value)}/>
                                <Nav.Link href={""} onClick={search}>Vyhledat</Nav.Link>
                            </Form>
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
        </>
    );
}

export default NavbarMenu;