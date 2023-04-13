import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Form, Button, Alert, InputGroup, Row, FormGroup, Col} from 'react-bootstrap';
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";


function AdvertiseEditor() {
    // získání parametru z url
    const advertiseId = useParams().advertiseId;
    const navigate = useNavigate();

    // příprava proměnných
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
    // kontrola zda se jedná o prvotní načtení a zároveň obsahuje odkaz ID inzerátu, v takovém případě se jedná o editaci
    if (advertiseId && firstLoad) {
        setFirstLoad(false);
        // vytvoření dočasného nastavení pro axios a přidání parametru s id inzerátu
        let tempConfig = AxiosConfig;
        tempConfig.params = {advertiseId};
        axios.get(BASE_URL + '/edit-advertise', tempConfig).then(res => {
            // kontrola zda odpověď není chybná
            if (!Array.isArray(res.data)) {
                // uložení dat do use state a nastavení omezení komponent formuláře podle dat inzerátu
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
                // pokud obsahuje dotaz errory dojde k jejich vypsání
                let element = document.getElementById("errors-p");
                element.innerHTML = res.data.join("<br>");
                setHiddenError(false);
            }
        }).catch(err => {
            console.log(err);
        })
    } else if (!advertiseId && firstLoad){ // pokud se jedná o první načtení a nikoliv o editaci => nový inzerát
        setFirstLoad(false);
        // vytvoření dočasného nastavení pro axios s userId pro získání adresy u uživatele
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId: cookies.userId};
        axios.get(BASE_URL + '/get-user', tempConfig).then(res => {
            // kontrola zda má uživatel uloženou adresu na profilu, pokud ano dojde k předvyplnění do inzerátu
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

    /**
     * Metoda sloužící k odeslání formuláře
     * */
    function onSubmit(e) {
        // zamezení překreslení stránky a kontrola zda není zobrazena zpráva o úspěchu
        e.preventDefault();
        // pokud je úspěch zobrazen došlo již k úspěšnému uložení tudíž není možné poslat znovu stejný inzerát
        if (!hiddenSuccess)
            return;
        setHiddenError(true);
        setHiddenSuccess(true);
        // pokud je formulář nevalidní nedojde k odeslání dat
        if(e.currentTarget.checkValidity() === false){
            e.stopPropagation();
        } else { // formulář je validní
            if (advertiseId) { // editing
                // lokální přiřazení _id pro usestate, nedojde k obnovení stránky a dat, slouží pouze k odeslání spolu s daty
                advertiseState._id = advertiseId;
                axios.put(BASE_URL + '/edit-advertise', advertiseState, AxiosConfig).then(res => {
                    // pokud odpověď obsahuje chyby dojde k vypsání a zobrazení
                    if (Array.isArray(res)) {
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenError(false);
                    } else { // pokud odpověď neobsahuje chyby dojde k vypsání zprávy a přesměrování na upravený inzerát
                        let element = document.getElementById("success-p");
                        element.innerHTML = res.data + "<br> Dojde k přesměrování na inzerát.";
                        setHiddenSuccess(false);
                        // dojde k zamezení znovu upravit inzerát
                        document.getElementById("submit-button").disabled = true;
                        setTimeout(() => {
                            setHiddenSuccess(true);
                            navigate('/inzerat/' + advertiseId);
                        }, 2000);
                    }
                }).catch(err => {
                    console.log(err);
                });
            } else { // creating
                // odeslání dat pro nový inzerát
                axios.post(BASE_URL + "/add-advertise", JSON.stringify(advertiseState), AxiosConfig).then(res => {
                    // pokud odpověď obsahuje chyby dojde k jejich vypsání a zobrazení
                    if (Array.isArray(res)) {
                        let element = document.getElementById("errors-p");
                        element.innerHTML = res.data.join("<br>");
                        setHiddenError(false);
                    } else { // pokud odpověď neobsahuje chyby dojde k zobrazení zprávy a přesměrování na nový inzerát
                        let element = document.getElementById("success-p");
                        element.innerHTML = res.data.message + "<br> Dojde k přesměrování na inzerát.";
                        setHiddenSuccess(false);
                        // zamezení možnosti znovu vytvořit inzerát se stejnými daty
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
        // nastavení informace o provedení validace, zobrazí informace ohledně validace
        setValidated(true);
    }

    // při změně typu ceny (zdarma, dohodou) dojde k zablokování editace ceny, pokud je "uvedená cena", lze cenu upravit
    function priceTypeChange(e) {
        setFormDisabledState({
            priceValue: e.target.value !== "price",
            priceType: formDisabledState.priceType
        });
        handleChange(e);
    }

    // zablokování změny ceny a typu pokud je inzerát změněn na "koupím", pokud na "prodám" dojde k možnosti upravit cenu podle typu ceny
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

    /**
     * Univerzální metoda pro zpracování změn a jejich uložení do useState proměnné
     * Element musí obsahovat atribut "name", který je shodný s názvem atributu v objektu uloženém v usestate
     * Pokud je atribut v usestate objekt, pak je "name" název objektu a "sname" názvem atributu objektu
     * */
    const handleChange = e =>{
        // Zjištění "name" název atributu a "value" hodnota v elementu
        const {name, value} = e.target;
        // zjištění zda element obsahuje sname
        const sName = e.target.attributes.sname ? e.target.attributes.sname.value : null;
        // výchozí stav pro usestate (adresa je rovnou vyplněna z aktuální v rámci debugu)
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
        // průchod podle klíče a hodnoty v objektu usestate, kde jsou uložené informace o inzerátu
        for(const [key, currValue] of Object.entries(advertiseState)){
            // pokud je aktuální atribut objekt (adresa)
            if(key === name && currValue instanceof Object){
                // opětovný průchod objektu na klíče a hodnoty
                for(const [secondKey, secondCurrentValue] of Object.entries(currValue)){
                    if(sName === secondKey){ // pokud je klíč stejný s názvem
                        state[key][secondKey] = value;
                    } else { // pokud není dojde k přiřazení aktualní hodnoty
                        state[key][secondKey] = secondCurrentValue;
                    }
                }
            }
            // kontrola zda se nejedná o objekt a zároveň zda je klíč jiný od názvu atributu
            if(key !== name && !(currValue instanceof Object)){
                state[key] = currValue;
            } else if (!(currValue instanceof Object)){ // název atributu odpovídá aktuálnímu klíči.
                state[name] = value;
            }
        }
        // aktualizace usestate včetně změn
        setAdvertiseState(state);
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Zobrazení errorů, příprava pro odpovědi*/}
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyba</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            {/*Zobrazení úspěšných informací, příprava pro odpovědi*/}
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=> setHiddenSuccess(true)} dismissible delay={3000} autohide>
                <Alert.Heading>Úspěch</Alert.Heading>
                <p id="success-p"> </p>
            </Alert>
            {/*Formulář pro editaci inzerátu*/}
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
                {/*Zobrazení textu přidat nebo upravit podle id inzerátu, pokud není obsaženo jedná se o nový inzerát*/}
                <Button variant="primary" id="submit-button" type="submit" >{advertiseId ? "Upravit inzerát" : "Přidat inzerát"}</Button>
            </Form>
        </div>
    );
}

export default AdvertiseEditor;