import React from 'react';
import {Link} from 'react-router-dom';
import {Navbar, Container, Nav} from 'react-bootstrap';
//import axios

function NavbarMenu() {

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">Inzertní web</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#">ODKAZ</Nav.Link>
                    </Nav>

                    <Nav>
                        <Nav.Link href="/registration">Registrace</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
export default NavbarMenu;