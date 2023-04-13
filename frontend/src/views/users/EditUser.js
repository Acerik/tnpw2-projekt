import axios from "axios";
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from "react";
import {Alert, Form, InputGroup, Button} from 'react-bootstrap';
import {useCookies} from 'react-cookie';

function EditUser() {
    // příprava proměnných
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
        }
    });

    // prvotní načtení
    if (firstLoad) {
        setFirstLoad(false);
        // dočasné nastavení pro axios, přidání id uživatele podle cookies
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId: cookies.userId};
        // dotaz na backend
        axios.get(BASE_URL + '/edit-user', tempConfig).then(res => {
            // uložení odpovědi
            setUserData(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

    /**
     * Univerzální metoda pro zpracování změn a jejich uložení do useState proměnné
     * Element musí obsahovat atribut "name", který je shodný s názvem atributu v objektu uloženém v usestate
     * Pokud je atribut v usestate objekt, pak je "name" název objektu a "sname" názvem atributu objektu
     * */
    const handleChange = e => {
        // získání hodnoty a názvu atributu z elementu
        const {name, value} = e.target;
        // získání sname atributu pokud je obsažen v elementu
        const sName = e.target.attributes.sname ? e.target.attributes.sname.value : null;
        // výchozí stav
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
            }
        };
        // průchod dat z useState se získáním klíče a hodnoty
        for (const [key, currValue] of Object.entries(userData)) {
            // kontrola zda aktuální atribut je objekt (adresa)
            if (key === name && currValue instanceof Object) {
                // průchod poddruženého objektu
                for (const [secondKey, secondCurrentValue] of Object.entries(currValue)) {
                    // atribut v objektu je cílový atribut pro změnu
                    if (sName === secondKey) {
                        state[key][secondKey] = value;
                    } else { // stará hodnota
                        state[key][secondKey] = secondCurrentValue;
                    }
                }
            }
            // kontrola zda se nejedná o objekt a zda se nejedná o hledaný atribut
            if (key !== name && !(currValue instanceof Object)) {
                state[key] = currValue; // zachování staré hodnoty
            } else if (!(currValue instanceof Object)) {
                state[name] = value; // nastavení nové hodnoty
            }
        }
        // uložení do useState
        setUserData(state);
    }

    // obsluha potvrzení formuláře
    function onSubmit(e) {
        // zamezení obnovení stránky
        e.preventDefault();
        // dotaz s novými údaji
        axios.put(BASE_URL + '/edit-user', userData, AxiosConfig).then(res => {
            // pokud jsou vráceny chyby dojde k jejich zobrazení
            if (Array.isArray(res.data)) {
                let element = document.getElementById("errors-p");
                element.innerHTML = res.data.join("<br>");
                setHiddenError(false);
                setHiddenSuccess(true);
            } else {
                // zobrazení zprávy o úspěšném provedení
                let element = document.getElementById("success-p");
                element.innerHTML = res.data;
                setHiddenError(true);
                setHiddenSuccess(false);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Příprava pro zobrazení chyb*/}
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyby při úpravě profilu</Alert.Heading>
                <p id="errors-p"></p>
            </Alert>
            {/*Příprava pro zobrazení úspěchu*/}
            <Alert hidden={hiddenSuccess} variant="success" onClose={() => setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Úprava profilu uložena.</Alert.Heading>
                <p id="success-p"></p>
            </Alert>
            {/*Samotný formulář*/}
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