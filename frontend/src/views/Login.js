import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";

function Login() {

    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies('userId');
    const [loginState, setLoginState] = useState({
        email: "",
        password: ""
    });

    const [hiddenError, setHiddenError] = useState(true);

    function onSubmit(e) {
        e.preventDefault();
        axios.post(BASE_URL + "/login", JSON.stringify(loginState), AxiosConfig)
            .then(res => {
                if(Array.isArray(res.data)){
                    let element = document.getElementById("errors-p");
                    element.innerHTML = res.data.join("<br>");
                    setHiddenError(false);
                } else {
                    setCookie('userId', res.data._id, {path: '/'});
                    navigate("/uzivatel/" + res.data._id);
                    navigate(0);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div id='content'>
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Přihlášení se nezdařilo</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder="Zadejte email:" value={loginState.email}
                                  onChange={e => setLoginState({
                                      email: e.target.value, password: loginState.password
                                  })}/>
                </Form.Group>
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