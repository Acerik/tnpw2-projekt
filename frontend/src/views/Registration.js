import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';

function Registration() {

    const [regState, setRegState] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    });

    const [hiddenError, setHiddenError] = useState(true);
    const [hiddenSuccess, setHiddenSuccess] = useState(true);

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(regState);
        axios.post(BASE_URL + "/registration", JSON.stringify(regState), AxiosConfig)
            .then(res => {
                console.log(res);
                if(Array.isArray(res.data)){
                    let element = document.getElementById("errors-p");
                    element.innerHTML = res.data.join("<br>");
                    setHiddenSuccess(true);
                    setHiddenError(false);
                } else {
                    setHiddenError(true);
                    setHiddenSuccess(false);
                    setRegState({
                        email: regState.email,
                        username: regState.username,
                        password: "",
                        confirmPassword: ""
                    });
                }
            }).catch(res => {
            console.log(res);
        });

    }

    return (
        <>
            <Alert hidden={hiddenError} variant="danger" onClose={()=>setHiddenError(true)} dismissible>
                <Alert.Heading>Chyby při registraci</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=>setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Registrace proběhla úspěšně.</Alert.Heading>
            </Alert>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Uživatelské jméno:</Form.Label>
                    <Form.Control type="username" placeholder="Zadejte uživatelské jméno:" value={regState.username}
                                  onChange={e => setRegState({
                                      email: regState.email, password: regState.password,
                                      confirmPassword: regState.confirmPassword, username: e.target.value
                                  })}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder="Zadejte email:" value={regState.email}
                                  onChange={e => setRegState({
                                      email: e.target.value, password: regState.password,
                                      confirmPassword: regState.confirmPassword, username: regState.username
                                  })}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Zadejte heslo:" value={regState.password}
                                  onChange={e => setRegState({
                                      email: regState.email, password: e.target.value
                                      , confirmPassword: regState.confirmPassword, username: regState.username
                                  })}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Potvrdit heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Potvrďte heslo:" value={regState.confirmPassword}
                                  onChange={e => setRegState({
                                      email: regState.email, password: regState.password,
                                      confirmPassword: e.target.value, username: regState.username
                                  })}/>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={onSubmit}>Registrovat</Button>
            </Form>
        </>
    );
}

export default Registration;