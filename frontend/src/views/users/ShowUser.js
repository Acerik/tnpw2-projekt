import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Alert, Card} from 'react-bootstrap';
import {useParams} from "react-router";
import {useCookies} from "react-cookie";
import moment from "moment";

function ShowUser() {
    // příprava proměnných a získání parametru userId pro zobrazení uživatele
    const userId = useParams().userId;
    const priceTypes = {"free": "Zdarma", "offer": "Dohodou"};
    const advertiseTypes = {"buy": "Koupím", "sell": "Prodám"};
    const [cookies] = useCookies('userId');
    const [myProfile, setMyProfile] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [hiddenError, setHiddenError] = useState(true);
    const [hiddenSuccess, setHiddenSuccess] = useState(true);
    const [userData, setUserData] = useState({
        email: "",
        username: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        createdOn: "",
        address: {
            zipCode: "",
            city: ""
        }
    });
    const [userAdvertises, setUserAdvertises] = useState([{
        _id: "",
        name: "",
        price: "",
        description: "",
        priceType: "",
        type: "",
        createdOn: "",
        lastUpdate: "",
        owner: "",
        address: {
            city: "",
            zipCode: ""
        }
    }]);

    // prvotní načtení
    if (firstLoad) {
        setFirstLoad(false);
        // vytvoření dočasného nastavení pro axios s id uživatele, který se má zobrazit
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId};
        // dotaz na backend
        axios.get(BASE_URL + '/get-user', tempConfig).then(res => {
            // nastavení dat
            setUserData(res.data);
            // pokud je uživatel přihlášen kontrola, zda se nejedná o profil přihlášeného uživatele
            setMyProfile(cookies.userId === res.data._id);
        }).catch(err => {
            console.log(err);
        });
        // dotaz na získání inzerátů od zobrazeného uživatele
        axios.get(BASE_URL + '/get-advertises-from-user', tempConfig).then(res => {
            setUserAdvertises(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

    // obsluha smazání inzerátu
    function deleteAdvertise(e) {
        // získání id inzerátu který se má smazat
        let advertiseIdToDelete = e.target.attributes.advertiseid.value;
        // nalezení inzerátu ke smazání podle id
        let advertiseToDelete = userAdvertises.find(({_id}) => _id === advertiseIdToDelete);
        // potvrzení zda se má inzerát smazat
        if (window.confirm("Chcete smazat inzerát s názvem: " + advertiseToDelete.name)) {
            // dočasné nastavení pro axios s id inzerátu, který se má smazat
            let tempConfig = AxiosConfig;
            tempConfig.params = {advertiseIdToDelete};
            // dotaz na backend
            axios.delete(BASE_URL + '/delete-advertise', tempConfig).then((res) => {
                // pokud jsou obsaženy chyby dojde k jejich vypsání, které po 3s zmizí
                if (Array.isArray(res.data)) {
                    let element = document.getElementById("errors-p");
                    element.innerHTML = res.data.join("<br>");
                    setHiddenError(false);
                    setTimeout(() => {
                        setHiddenError(true);
                    }, 3000);
                } else {
                    // zobrazení zprávy o úspěšném smazání inzerátu, zpráva po 3s zmizí
                    let element = document.getElementById("success-p");
                    element.innerHTML = res.data;
                    setFirstLoad(true);
                    setHiddenSuccess(false);
                    setTimeout(() => {
                        setHiddenSuccess(true);
                    }, 3000);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    // formátování datumu a času do čitelnější podoby
    function formatDate(date) {
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Místo pro zobrazení případných chyb*/}
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyba</Alert.Heading>
                <p id="errors-p"></p>
            </Alert>
            {/*Místo pro zobrazení případných zpráv o úspěchu*/}
            <Alert hidden={hiddenSuccess} variant="success" onClose={() => setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Úspěch</Alert.Heading>
                <p id="success-p"></p>
            </Alert>
            {/*Card s profilem uživatele*/}
            <Card>
                <Card.Body>
                    {/*Zobrazení informace pokud se jedná o profil přihlášeného uživatele*/}
                    {myProfile ? <Card.Title> Můj profil</Card.Title> : ""}
                    <Card.Title>{userData.username}</Card.Title>
                    {userData.firstName || userData.lastName ?
                        <Card.Text>Jméno: {userData.firstName} {userData.lastName}</Card.Text> : ""}
                    <Card.Text>Email: {userData.email}</Card.Text>
                    {/*Část s nepovinnými údajy se zobrazí pouze pokud je údaj obsažen*/}
                    {userData.phoneNumber ?
                        <Card.Text>Telefonní číslo: {userData.phoneNumber}</Card.Text> : ""}
                    {userData.address.city || userData.address.zipCode ?
                        <Card.Text>
                            {userData.address.city ? "Obec: " + userData.address.city + " " : ""}
                            {userData.address.zipCode ? "PSČ: " + userData.address.zipCode : ""}
                        </Card.Text> : ""}
                    {userData.createdOn ?
                        <Card.Text>Registrován: {formatDate(userData.createdOn)}</Card.Text> : ""}
                    {/*Zobrazení možnossti upravit profil, pokud se jedná o profil přihlášeného uživatele*/}
                    {myProfile ?
                        <Card.Link href='/upravit-profil'>Upravit profil</Card.Link>
                        : ""}
                </Card.Body>
            </Card>
            <Card>
                <Card.Header as="h5">Inzeráty</Card.Header>
                <Card.Body>
                    {/*Zobrazení inzerátů uživatele*/}
                    {userAdvertises.map(advertise => {
                        return (
                            <Card key={advertise._id}>
                                <Card.Body>
                                    {/*Název s možností prokliku*/}
                                    <Card.Title>
                                        <Card.Link href={"/inzerat/" + advertise._id}>{advertise.name}</Card.Link>
                                    </Card.Title>
                                    {/*Krátký popis zobrazí maximálně 200 znaků pokud je popis delší přidá tři tečky*/}
                                    <Card.Text>{advertise.description.substring(0, 200) + (advertise.description.length > 200 ? "..." : " ")}</Card.Text>
                                    <Card.Text>{advertiseTypes[advertise.type]}</Card.Text>
                                    {/*Oodle typu inzerátu zobrazí typ ceny a podle ní cenu*/}
                                    {advertise.type === "sell" ?
                                        <Card.Subtitle>{advertise.priceType === "price" ? ("Cena: " + advertise.price + " Kč") : priceTypes[advertise.priceType]}</Card.Subtitle>
                                        : ""}
                                    {/*Zobrazení adresy*/}
                                    <Card.Subtitle>{"Obec: " + advertise.address.city + " PSČ: " + advertise.address.zipCode}</Card.Subtitle>
                                    {/*Pokud je profil přihlášeného uživatele má možnost upravit či smazat každý inzerát*/}
                                    {myProfile ? <>
                                            <Card.Link href={'/upravit-inzerat/' + advertise._id}>Upravit
                                                inzerát</Card.Link>
                                            <Card.Link advertiseid={advertise._id} href={"#"} onClick={deleteAdvertise}>Smazat
                                                inzerát</Card.Link>
                                        </>
                                        : ""}
                                </Card.Body>
                                {/*Zobrazení času přidání případně i času poslední úpravy pokud byl inzerát upraven*/}
                                <Card.Footer className="text-muted">Přidáno: {formatDate(advertise.createdOn)}</Card.Footer>
                                {advertise.createdOn === advertise.lastUpdate ? null :
                                    <Card.Footer className="text-muted">Poslední
                                        úprava: {formatDate(advertise.lastUpdate)}</Card.Footer>
                                }
                            </Card>
                        );
                    })}
                </Card.Body>
            </Card>
        </div>
    );
}

export default ShowUser;