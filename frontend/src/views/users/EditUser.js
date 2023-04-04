import axios from "axios";
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from "react";
import {Alert, Form, InputGroup, Button} from 'react-bootstrap';
import {useCookies} from 'react-cookie';

function EditUser() {
    const [cookies] = useCookies('userId');
    const [firstLoad, setFirstLoad] = useState(true);
    const [hiddenError, setHiddenError] = useState(true);
    const [hiddenSuccess, setHiddenSuccess] = useState(true);
    const [userData, setUserData] = useState({
        email: "",
        username: "",
        phoneNumber: "",
        firstName: "",
        password: "",
        confirmPassword: "",
        oldPassword: "",
        lastName: "",
        createdOn: "",
        address: {
            zipCode: "",
            city: ""
        }});

    if(firstLoad){
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId:cookies.userId};
        axios.get(BASE_URL + '/edit-user', tempConfig).then(res => {
            setUserData(res.data);
        }).catch(err => {
            console.log(err);
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
            oldPassword: "",
            phoneNumber: "",
            firstName: "",
            lastName: "",
            address: {
                zipCode: userData.address.zipCode,
                city: userData.address.city
            }};
        for(const [key, currValue] of Object.entries(userData)){
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
        setUserData(state);
    }

    function onSubmit(e){
        e.preventDefault();
        axios.put(BASE_URL + '/edit-user', userData, AxiosConfig).then(res => {
            if(Array.isArray(res.data)){
                let element = document.getElementById("errors-p");
                element.innerHTML = res.data.join("<br>");
                setHiddenError(false);
                setHiddenSuccess(true);
            } else {
                let element = document.getElementById("success-p");
                element.innerHTML = res.data;
                setHiddenError(true);
                setHiddenSuccess(false);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <div id='content'>
            <Alert hidden={hiddenError} variant="danger" onClose={()=>setHiddenError(true)} dismissible>
                <Alert.Heading>Chyby při úpravě profilu</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=>setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Úprava profilu uložena.</Alert.Heading>
                <p id="success-p"> </p>
            </Alert>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Uživatelské jméno:</Form.Label>
                    <Form.Control type="username" placeholder="Zadejte uživatelské jméno:"
                                  name="username" value={userData.username} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control type="email" placeholder="Zadejte email:"
                                  name="email" value={userData.email} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Staré heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Zadejte heslo:"
                                  name="oldPassword" value={userData.oldPassword} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Nové heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Zadejte heslo:"
                                  name="password" value={userData.password} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Potvrdit nové heslo:</Form.Label>
                    <Form.Control type="password" placeholder="Potvrďte heslo:"
                                  name="confirmPassword" value={userData.confirmPassword} onChange={handleChange}/>
                </Form.Group>
                <Form.Text as="h3">Nepovinné údaje</Form.Text>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Křestní jméno</InputGroup.Text>
                    <Form.Control aria-label="Křestní jméno" placeholder="Křestní jméno"
                                  name="firstName" value={userData.firstName} onChange={handleChange}/>
                    <InputGroup.Text>Příjmení</InputGroup.Text>
                    <Form.Control aria-label="Příjmení" placeholder="Příjmení"
                                  name="lastName" value={userData.lastName} onChange={handleChange}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Obec</InputGroup.Text>
                    <Form.Control aria-label="Obec" placeholder="Obec" name="address" sname="city"
                                  value={userData.address.city} onChange={handleChange}/>
                    <InputGroup.Text>PSČ</InputGroup.Text>
                    <Form.Control aria-label="PSČ" placeholder="PSČ" name="address" sname="zipCode"
                                  value={userData.address.zipCode} onChange={handleChange}/>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Telefonní číslo</InputGroup.Text>
                    <Form.Control aria-label="Telefonní číslo" placeholder="Telefonní číslo" name="phoneNumber"
                                  value={userData.phoneNumber} onChange={handleChange}/>
                </InputGroup>
                <Button variant="primary" type="submit" onClick={onSubmit}>Upravit</Button>
            </Form>
        </div>
    )
}

export default EditUser;