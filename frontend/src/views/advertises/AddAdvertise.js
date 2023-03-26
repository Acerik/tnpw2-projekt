import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup} from 'react-bootstrap';


function AddAdvertise() {

    const [hiddenError, setHiddenError] = useState(true);
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

    function onSubmit(e) {
        e.preventDefault();
        if(advertiseState.price !== null && advertiseState.name !== null && advertiseState.description !== ""){
            axios.post(BASE_URL + "/add-advertise", JSON.stringify(advertiseState), AxiosConfig).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
            });
        }
    }

    function nameChange(e){
        setAdvertiseState({
            name: e.target.value,
            price: advertiseState.price,
            description: advertiseState.description,
            priceType: advertiseState.priceType,
            type: advertiseState.type
        });
    }

    function descriptionChange(e){
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
        if (advertiseState.type === "buy") {
            setFormDisabledState({
                priceValue: true,
                priceType: true
            });
        } else {
            console.log(advertiseState.priceType);
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
                <Alert.Heading>Přihlášení se nezdařilo</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="formAdName">
                    <Form.Label>Název inzerátu:</Form.Label>
                    <Form.Control autoComplete="off" placeholder="Název inzerátu" type="text" onChange={nameChange}/>
                </Form.Group>
                <Form.Select aria-label="Typ inzerátu" onChange={changeAdType}>
                    <option value="sell">Prodám</option>
                    <option value="buy">Koupím</option>
                </Form.Select>
                <InputGroup className="mb-3" controlId="price-setting">
                    <InputGroup.Text>Kč</InputGroup.Text>
                    <Form.Control aria-label="Cena" onChange={priceChange} type="number"
                                  disabled={formDisabledState.priceValue}/>
                    <InputGroup.Text>.00</InputGroup.Text>
                    <Form.Select aria-label="Cena inzerátu" onChange={priceTypeChange} controlId="priceType"
                                 disabled={formDisabledState.priceType}>
                        <option value="price">Zadaná cena</option>
                        <option value="free">Zdarma</option>
                        <option value="offer">Dohodou</option>
                    </Form.Select>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text>Popis inzerátu: </InputGroup.Text>
                    <Form.Control as="textarea" aria-label="Popis inzerátu" onChange={descriptionChange}/>
                </InputGroup>
                <Button variant="primary" type="submit" onClick={onSubmit}>Přidat inzerát</Button>
            </Form>
        </>
    );
}

export default AddAdvertise;