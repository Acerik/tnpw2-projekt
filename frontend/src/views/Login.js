import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";

function Login() {

    // příprava proměnných
    const navigate = useNavigate();
    // může zobrazi chybu, že cookies nejsou použity, pokud se však smažou není možné využít setCookie
    const [cookies, setCookie] = useCookies('userId');
    const [loginState, setLoginState] = useState({
        email: "",
        password: ""
    });

    const [hiddenError, setHiddenError] = useState(true);

    // obsluha odeslání formuláře
    function onSubmit(e) {
        // zamezení aktualizace stránky
        e.preventDefault();
        // dotaz na backend s daty
        axios.post(BASE_URL + "/login", JSON.stringify(loginState), AxiosConfig).then(res => {
            // pokud obsahuje chyby dojde k jejich vypsání
            if (Array.isArray(res.data)) {
                let element = document.getElementById("errors-p");
                element.innerHTML = res.data.join("<br>");
                setHiddenError(false);
            } else {
                // nastavení cookie pro přihlášeného uživatele
                setCookie('userId', res.data._id, {path: '/'});
                // přesměrování na stránku uživatele
                navigate("/uzivatel/" + res.data._id);
                // obnovení stránky (při debugu zjištěno kvůli správnému rozpoznání vlastního profilu)
                navigate(0);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Příprava pro zobrazení chyby*/}
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Přihlášení se nezdařilo</Alert.Heading>
                <p id="errors-p"></p>
            </Alert>
            {/*Formulář*/}
            <Form onSubmit={onSubmit}>
                {/*Zadání emailu*/}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder="Zadejte email:" value={loginState.email}
                                  onChange={e => setLoginState({
                                      email: e.target.value, password: loginState.password
                                  })}/>
                </Form.Group>
                {/*Zadání hesla*/}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Zadejte heslo:" value={loginState.password}
                                  onChange={e => setLoginState({
                                      email: loginState.email, password: e.target.value
                                  })}/>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={onSubmit}>Přihlásit</Button>
            </Form>
        </div>
    );
}

export default Login;