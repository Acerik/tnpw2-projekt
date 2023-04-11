import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup, Row, FormGroup, Col} from 'react-bootstrap';
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";


function AdvertiseEditor() {
    const advertiseId = useParams().advertiseId;
    const navigate = useNavigate();

    const [hiddenError, setHiddenError] = useState(true);
    const [validated, setValidated] = useState(false);
    const [cookies] = useCookies("userId");
    const [hiddenSuccess, setHiddenSuccess] = useState(true);
    const [firstLoad, setFirstLoad] = useState(true);
    const [formDisabledState, setFormDisabledState] = useState({
        priceType: false,
        priceValue: false
    });
    const [advertiseState, setAdvertiseState] = useState({
        name: "",
        price: "",
        description: "",
        priceType: "price",
        type: "sell",
        address: {
            zipCode: "",
            city: ""
        }
    });

    if (advertiseId && firstLoad) {
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params = {advertiseId};
        axios.get(BASE_URL + '/edit-advertise', tempConfig).then(res => {
            if (!Array.isArray(res.data)) {
                setAdvertiseState(res.data);
                if (res.data.type === "buy") {
                    setFormDisabledState({
                        priceValue: true,
                        priceType: true
                    });
                } else {
                    setFormDisabledState({
                        priceValue: res.data.priceType !== "price",
                        priceType: false
                    });
                }
            } else {
                let element = document.getElementById("errors-p");
                element.innerHTML = res.data.join("<br>");
                setHiddenError(false);
            }
        }).catch(err => {
            console.log(err);
        })
    } else if (!advertiseId && firstLoad){
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId: cookies.userId};
        axios.get(BASE_URL + '/get-user', tempConfig).then(res => {
            if(res.data.address){
                setAdvertiseState({
                    name: advertiseState.name,
                    price: advertiseState.price,
                    description: advertiseState.description,
                    priceType: advertiseState.priceType,
                    type: advertiseState.type,
                    address: res.data.address
                });
            }
        }).catch(err=> {
           console.log(err);
        });
    }

    function onSubmit(e) {
        e.preventDefault();
        if (!hiddenSuccess)
            return;
        setHiddenError(true);
        setHiddenSuccess(true);
        if(e.currentTarget.checkValidity() === false){
            e.stopPropagation();
        } else {
            if (advertiseId) { // editing
                advertiseState._id = advertiseId;
                axios.put(BASE_URL + '/edit-advertise', advertiseState, AxiosConfig).then(res => {
                    if (Array.isArray(res)) {
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenError(false);
                    } else {
                        let element = document.getElementById("success-p");
                        element.innerHTML = res.data + "<br> Dojde k přesměrování na inzerát.";
                        setHiddenSuccess(false);
                        document.getElementById("submit-button").disabled = true;
                        setTimeout(() => {
                            setHiddenSuccess(true);
                            navigate('/inzerat/' + advertiseId);
                        }, 3000);
                    }
                }).catch(err => {
                    console.log(err);
                });
            } else { // creating
                axios.post(BASE_URL + "/add-advertise", JSON.stringify(advertiseState), AxiosConfig).then(res => {
                    if (Array.isArray(res)) {
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenError(false);
                    } else {
                        let element = document.getElementById("success-p");
                        element.innerHTML = res.data.message + "<br> Dojde k přesměrování na inzerát.";
                        setHiddenSuccess(false);
                        document.getElementById("submit-button").disabled = true;
                        setTimeout(() => {
                            navigate('/inzerat/' + res.data.data._id);
                        }, 2000);
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
        setValidated(true);
    }

    function priceTypeChange(e) {
        setFormDisabledState({
            priceValue: e.target.value !== "price",
            priceType: formDisabledState.priceType
        });
        handleChange(e);
    }

    function changeAdType(e) {
        if (advertiseState.type !== "buy") {
            setFormDisabledState({
                priceValue: true,
                priceType: true
            });
        } else {
            setFormDisabledState({
                priceValue: advertiseState.priceType !== "price",
                priceType: false
            });
        }
        handleChange(e);
    }
    const handleChange = e =>{
        const {name, value} = e.target;
        const sName = e.target.attributes.sname ? e.target.attributes.sname.value : null;
        let state = {
            name: "",
            price: "",
            description: "",
            priceType: "price",
            type: "sell",
            address: {
                zipCode: advertiseState.address.zipCode,
                city: advertiseState.address.city
            }};
        for(const [key, currValue] of Object.entries(advertiseState)){
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
        setAdvertiseState(state);
    }

    function addressChange(e) {
        let sName = (e.target.attributes.sname ? e.target.attributes.sname.value : null);
        if(sName === "zipCode"){
            setAdvertiseState({
                name: advertiseState.name,
                price: advertiseState.price,
                description: advertiseState.description,
                priceType: advertiseState.priceType,
                type: advertiseState.type,
                address: {
                    zipCode: e.target.value,
                    city: advertiseState.address.city
                }
            });
        } else {
            setAdvertiseState({
                name: advertiseState.name,
                price: advertiseState.price,
                description: advertiseState.description,
                priceType: advertiseState.priceType,
                type: advertiseState.type,
                address: {
                    zipCode: advertiseState.address.zipCode,
                    city: e.target.value
                }
            });
        }
    }

    return (
        <div id='content'>
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyba</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=> setHiddenSuccess(true)} dismissible delay={3000} autohide>
                <Alert.Heading>Úspěch</Alert.Heading>
                <p id="success-p"> </p>
            </Alert>
            <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formAdName">
                    <Form.Label>Název inzerátu:</Form.Label>
                    <Form.Control required autoComplete="off" value={advertiseState.name} placeholder="Název inzerátu"
                                  type="text" name="name" onChange={handleChange}/>
                    <Form.Control.Feedback type="valid">Název inzerátu vypadá v pořádku.</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Zadejte název inzerátu.</Form.Control.Feedback>
                </Form.Group>
                <Row>
                    <FormGroup as={Col}>
                        <Form.Select aria-label="Typ inzerátu" onChange={changeAdType} name="type" value={advertiseState.type}>
                            <option value="sell">Prodám</option>
                            <option value="buy">Koupím</option>
                        </Form.Select>
                    </FormGroup>
                    <FormGroup as={Col}>
                        <Form.Select aria-label="Cena inzerátu" name="priceType" onChange={priceTypeChange} controlId="priceType"
                                     disabled={formDisabledState.priceType} value={advertiseState.priceType}>
                            <option value="price">Zadaná cena</option>
                            <option value="free">Zdarma</option>
                            <option value="offer">Dohodou</option>
                        </Form.Select>
                    </FormGroup>
                    <FormGroup as={Col}>
                    <InputGroup.Text>Cena v Kč</InputGroup.Text>
                    <Form.Control required aria-label="Cena" name="price" onChange={handleChange} type="number"
                                  disabled={formDisabledState.priceValue} value={advertiseState.price} placeholder="Cena inzerátu"/>
                    <Form.Control.Feedback type="valid">Cena vypadá v pořádku.</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Je nutné zadat cenu.</Form.Control.Feedback>
                </FormGroup>
                </Row>
                <InputGroup>
                    <InputGroup.Text>Popis inzerátu: </InputGroup.Text>
                    <Form.Control required as="textarea" aria-label="Popis inzerátu" name="description" onChange={handleChange}
                                  value={advertiseState.description} placeholder="Popis inzerátu"/>
                    <Form.Control.Feedback type="valid">Popis inzerátu vypadá v pořádku.</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Zadejte popis inzerátu.</Form.Control.Feedback>
                </InputGroup>
                <Row className="mb-3">
                    <FormGroup as={Col}>
                    <InputGroup.Text>Obec</InputGroup.Text>
                    <Form.Control required aria-label="Obec" placeholder="Obec" name="address" sname="city"
                                  value={advertiseState.address.city} onChange={handleChange}/>
                    <Form.Control.Feedback type="valid">Obec vypadá v pořádku.</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Zadejte obec.</Form.Control.Feedback>
                    </FormGroup>
                    <FormGroup as={Col}>
                    <InputGroup.Text>PSČ</InputGroup.Text>
                    <Form.Control required aria-label="PSČ" placeholder="PSČ" name="address" sname="zipCode"
                                  value={advertiseState.address.zipCode} onChange={handleChange}/>
                    <Form.Control.Feedback type="valid">PSČ vypadá v pořádku.</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid" >Zadejte PSČ.</Form.Control.Feedback>
                    </FormGroup>
                </Row>
                <Button variant="primary" id="submit-button" type="submit" >{advertiseId ? "Upravit inzerát" : "Přidat inzerát"}</Button>
            </Form>
        </div>
    );
}

export default AdvertiseEditor;