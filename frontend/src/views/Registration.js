import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup, Col, Row, FormGroup} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

function Registration() {

    const navigate = useNavigate();
    const [regState, setRegState] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        address: {
            zipCode: "",
            city: ""
        }
    });
    const [validated, setValidated] = useState(false);
    const [hiddenError, setHiddenError] = useState(true);
    const [hiddenSuccess, setHiddenSuccess] = useState(true);

    const onSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        if (e.currentTarget.checkValidity() === false) {
            e.stopPropagation();
        } else {
            axios.post(BASE_URL + "/registration", JSON.stringify(regState), AxiosConfig)
                .then(res => {
                    console.log(res);
                    if (Array.isArray(res.data)) {
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenSuccess(true);
                        setHiddenError(false);
                    } else {
                        setHiddenError(true);
                        setHiddenSuccess(false);
                        setRegState({
                            email: "",
                            username: "",
                            password: "",
                            confirmPassword: "",
                            phoneNumber: "",
                            firstName: "",
                            lastName: "",
                            address: {
                                zipCode: "",
                                city: ""
                            }
                        });
                        setTimeout(() => {
                            navigate('/prihlaseni');
                        }, 2000);
                    }
                }).catch(res => {
                console.log(res);
            });
        }
    }

    const handleChange = e => {
        const {name, value} = e.target;
        const sName = e.target.attributes.sname ? e.target.attributes.sname.value : null;
        let state = {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            firstName: "",
            lastName: "",
            address: {
                zipCode: regState.address.zipCode,
                city: regState.address.city
            }
        };
        for (const [key, currValue] of Object.entries(regState)) {
            if (key === name && currValue instanceof Object) {
                for (const [secondKey, secondCurrentValue] of Object.entries(currValue)) {
                    if (sName === secondKey) { // nová hodnota
                        state[key][secondKey] = value;
                    } else { // stará hodnota
                        state[key][secondKey] = secondCurrentValue;
                    }
                }
            }
            if (key !== name && !(currValue instanceof Object)) {
                state[key] = currValue;
            } else if (!(currValue instanceof Object)) {
                state[name] = value;
            }
        }
        setRegState(state);
    }

    return (
        <div id='content'>
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyby při registraci</Alert.Heading>
                <p id="errors-p"></p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={() => setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Registrace proběhla úspěšně.</Alert.Heading>
            </Alert>

            <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Form.Text as="h2">Povinné údaje</Form.Text>
                <Row>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Uživatelské jméno:</Form.Label>
                        <Form.Control required type="text" placeholder="Zadejte uživatelské jméno:"
                                      name="username" value={regState.username} onChange={handleChange}/>
                        <Form.Control.Feedback type="invalid">Uživatelské jméno musí být zadáno.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Uživatelské jméno je zadáno.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Email:</Form.Label>
                        <Form.Control required type="type" placeholder="Zadejte email:"
                                      name="email" value={regState.email} onChange={handleChange}/>
                        <Form.Control.Feedback type="invalid">Email musí být zadán.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Email je zadán.</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Heslo:</Form.Label>
                        <Form.Control required type="password" placeholder="Zadejte heslo:"
                                      name="password" value={regState.password} onChange={handleChange}/>
                        <Form.Control.Feedback type="invalid">Heslo musí být zadáno.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Heslo je zadáno.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="formBasicConfirmPassword">
                        <Form.Label>Potvrdit heslo:</Form.Label>
                        <Form.Control required type="password" placeholder="Potvrďte heslo:"
                                      name="confirmPassword" value={regState.confirmPassword} onChange={handleChange}/>
                        <Form.Control.Feedback type="invalid">Potvrzující heslo musí být zadáno.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Potvrzující heslo je zadáno.</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Form.Text as="h2">Nepovinné údaje</Form.Text>
                <Row>
                    <FormGroup as={Col} className="mb-3">
                        <InputGroup.Text>Křestní jméno</InputGroup.Text>
                        <Form.Control aria-label="Křestní jméno" placeholder="Křestní jméno"
                                      name="firstName" value={regState.firstName} onChange={handleChange}/>
                        <Form.Control.Feedback>Křestní jméno je dobrovolné.</Form.Control.Feedback>
                    </FormGroup>
                    <FormGroup as={Col} className="mb-3">
                        <InputGroup.Text>Příjmení</InputGroup.Text>
                        <Form.Control aria-label="Příjmení" placeholder="Příjmení"
                                      name="lastName" value={regState.lastName} onChange={handleChange}/>
                        <Form.Control.Feedback>Příjmení je dobrovolné.</Form.Control.Feedback>
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup as={Col} className="mb-3">
                        <InputGroup.Text>Obec</InputGroup.Text>
                        <Form.Control aria-label="Obec" placeholder="Obec" name="address" sname="city"
                                      value={regState.address.city} onChange={handleChange}/>
                        <Form.Control.Feedback>Obec je dobrovolná.</Form.Control.Feedback>
                    </FormGroup>
                    <FormGroup as={Col} className="mb-3">
                        <InputGroup.Text>PSČ</InputGroup.Text>
                        <Form.Control aria-label="PSČ" placeholder="PSČ" name="address" sname="zipCode"
                                      value={regState.address.zipCode} onChange={handleChange}/>
                        <Form.Control.Feedback>PSČ je dobrovolné.</Form.Control.Feedback>
                    </FormGroup>
                </Row>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Telefonní číslo</InputGroup.Text>
                    <Form.Control aria-label="Telefonní číslo" placeholder="Telefonní číslo" name="phoneNumber"
                                  value={regState.phoneNumber} onChange={handleChange}/>
                    <Form.Control.Feedback>Telefonní číslo je dobrovolné.</Form.Control.Feedback>
                </InputGroup>
                <Button variant="primary" type="submit">Registrovat</Button>
            </Form>
        </div>
    );
}

export default Registration;