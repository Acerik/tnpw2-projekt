import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup} from 'react-bootstrap';

function Registration() {

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

    const handleChange = e =>{
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
                zipCode: "",
                city: ""
            }};
        for(const [key, currValue] of Object.entries(regState)){
            if(key === name && currValue instanceof Object){
                for(const [secondKey, secondCurrentValue] of Object.entries(currValue)){
                    if(sName === secondKey){ // nová hodnota
                        state[key][secondKey] = value;
                    } else { // stará hodnota
                        state[key][secondKey] = secondCurrentValue;
                    }
                }
            }
            if(key !== name && !(currValue instanceof Object)){
                state[key] = currValue;
            } else if (!(currValue instanceof Object)){
                state[name] = value;
            }
        }
        setRegState(state);
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
                <Form.Text as="h3">Povinné údaje</Form.Text>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Uživatelské jméno:</Form.Label>
                    <Form.Control type="username" placeholder="Zadejte uživatelské jméno:"
                                  name="username" value={regState.username} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder="Zadejte email:"
                                  name="email" value={regState.email} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Zadejte heslo:"
                                  name="password" value={regState.password} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Potvrdit heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Potvrďte heslo:"
                                  name="confirmPassword" value={regState.confirmPassword} onChange={handleChange}/>
                </Form.Group>
                <Form.Text as="h3">Nepovinné údaje</Form.Text>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Křestní jméno</InputGroup.Text>
                    <Form.Control aria-label="Křestní jméno" placeholder="Křestní jméno"
                                  name="firstName" value={regState.firstName} onChange={handleChange}/>
                    <InputGroup.Text>Příjmení</InputGroup.Text>
                    <Form.Control aria-label="Příjmení" placeholder="Příjmení"
                                  name="lastName" value={regState.lastName} onChange={handleChange}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Obec</InputGroup.Text>
                    <Form.Control aria-label="Obec" placeholder="Obec" name="address" sname="city"
                                  value={regState.address.city} onChange={handleChange}/>
                    <InputGroup.Text>PSČ</InputGroup.Text>
                    <Form.Control aria-label="PSČ" placeholder="PSČ" name="address" sname="zipCode"
                                  value={regState.address.zipCode} onChange={handleChange}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Telefonní číslo</InputGroup.Text>
                    <Form.Control aria-label="Telefonní číslo" placeholder="Telefonní číslo" name="phoneNumber"
                                  value={regState.phoneNumber} onChange={handleChange}/>
                </InputGroup>
                <Button variant="primary" type="submit" onClick={onSubmit}>Registrovat</Button>
            </Form>
        </>
    );
}

export default Registration;