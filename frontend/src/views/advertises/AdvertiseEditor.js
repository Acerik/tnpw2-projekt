import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup} from 'react-bootstrap';
import {useParams} from "react-router";


function AdvertiseEditor() {
    const advertiseId = useParams().advertiseId;

    const [hiddenError, setHiddenError] = useState(true);
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
        type: "sell"
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
    }

    function onSubmit(e) {
        e.preventDefault();
        setHiddenError(true);
        setHiddenSuccess(true);
        if (advertiseId) { // editing
            advertiseState._id = advertiseId;
            axios.put(BASE_URL + '/edit-advertise', advertiseState, AxiosConfig).then(res => {
                if(!Array.isArray(res)){
                    let element = document.getElementById("errors-p");
                    element.innerHTML = res.data.join("<br>");
                    setHiddenError(false);
                } else {
                    let element = document.getElementById("success-p");
                    element.innerHTML = res.data;
                    setHiddenSuccess(false);
                }
            }).catch(err => {
                console.log(err);
            });
        } else { // creating
            if (advertiseState.price !== null && advertiseState.name !== null && advertiseState.description !== "") {
                axios.post(BASE_URL + "/add-advertise", JSON.stringify(advertiseState), AxiosConfig).then(res => {
                    if(Array.isArray(res)){
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenError(false);
                    } else {
                        let element = document.getElementById("success-p");
                        element.innerHTML = res.data;
                        setHiddenSuccess(false);
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    }

    function nameChange(e) {
        setAdvertiseState({
            name: e.target.value,
            price: advertiseState.price,
            description: advertiseState.description,
            priceType: advertiseState.priceType,
            type: advertiseState.type
        });
    }

    function descriptionChange(e) {
        setAdvertiseState({
            name: advertiseState.name,
            price: advertiseState.price,
            description: e.target.value,
            priceType: advertiseState.priceType,
            type: advertiseState.type
        });
    }

    function priceChange(e) {
        setAdvertiseState({
            name: advertiseState.name,
            price: Number(e.target.value),
            description: advertiseState.description,
            priceType: advertiseState.priceType,
            type: advertiseState.type
        });
    }

    function priceTypeChange(e) {
        setFormDisabledState({
            priceValue: e.target.value !== "price",
            priceType: formDisabledState.priceType
        });
        setAdvertiseState({
            name: advertiseState.name,
            price: advertiseState.price,
            description: advertiseState.description,
            priceType: e.target.value,
            type: advertiseState.type
        });
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
        setAdvertiseState({
            name: advertiseState.name,
            price: advertiseState.price,
            description: advertiseState.description,
            priceType: advertiseState.priceType,
            type: e.target.value
        });
    }

    return (
        <>
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyba</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=> setHiddenSuccess(true)} dismissible delay={3000} autohide>
                <Alert.Heading>Úspěch</Alert.Heading>
                <p id="success-p"> </p>
            </Alert>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formAdName">
                    <Form.Label>Název inzerátu:</Form.Label>
                    <Form.Control autoComplete="off" value={advertiseState.name} placeholder="Název inzerátu"
                                  type="text" onChange={nameChange}/>
                </Form.Group>
                <Form.Select aria-label="Typ inzerátu" onChange={changeAdType} value={advertiseState.type}>
                    <option value="sell">Prodám</option>
                    <option value="buy">Koupím</option>
                </Form.Select>
                <InputGroup className="mb-3" controlId="price-setting">
                    <InputGroup.Text>Kč</InputGroup.Text>
                    <Form.Control aria-label="Cena" onChange={priceChange} type="number"
                                  disabled={formDisabledState.priceValue} value={advertiseState.price}/>
                    <InputGroup.Text>.00</InputGroup.Text>
                    <Form.Select aria-label="Cena inzerátu" onChange={priceTypeChange} controlId="priceType"
                                 disabled={formDisabledState.priceType} value={advertiseState.priceType}>
                        <option value="price">Zadaná cena</option>
                        <option value="free">Zdarma</option>
                        <option value="offer">Dohodou</option>
                    </Form.Select>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text>Popis inzerátu: </InputGroup.Text>
                    <Form.Control as="textarea" aria-label="Popis inzerátu" onChange={descriptionChange}
                                  value={advertiseState.description}/>
                </InputGroup>
                <Button variant="primary" type="submit" onClick={onSubmit}>{advertiseId ? "Upravit inzerát" : "Přidat inzerát"}</Button>
            </Form>
        </>
    );
}

export default AdvertiseEditor;