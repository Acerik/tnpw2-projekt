import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Alert, Button, Card, Form, Modal} from 'react-bootstrap';
import {useParams} from "react-router";
import {useCookies} from "react-cookie";
import moment from "moment";
import {useNavigate} from "react-router-dom";

function ShowUser() {
    // příprava proměnných a získání parametru userId pro zobrazení uživatele
    const userId = useParams().userId;
    const navigate = useNavigate();
    const priceTypes = {"free": "Zdarma", "offer": "Dohodou"};
    const advertiseTypes = {"buy": "Koupím", "sell": "Prodám"};
    const [cookies] = useCookies('userId');
    const [myProfile, setMyProfile] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [hiddenError, setHiddenError] = useState(true);
    const [hiddenSuccess, setHiddenSuccess] = useState(true);
    const [modalInformation, setModalInformation] = useState({
        show: false,
        header: "",
        responseText: "",
        navigate: false
    });
    const [modalDeleteAdvertise, setModalDeleteAdvertise] = useState({
        show: false,
        data: {
            _id: "",
            text: "",
            header: ""
        }
    });
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
            // data neobsahují chyby
            if (!Array.isArray(res.data)) {
                // nastavení dat
                setUserData(res.data);
                // pokud je uživatel přihlášen kontrola, zda se nejedná o profil přihlášeného uživatele
                setMyProfile(cookies.userId === res.data._id);
            } else {
                setModalInformation({
                    header: "Chyba",
                    responseText: res.data.join(" "),
                    navigate: -1,
                    show: true
                });
            }
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
        // nastavení dat pro modal, který se zobrazí uživateli pro potvrzení smazání
        setModalDeleteAdvertise({
            show: true,
            data: {
                _id: advertiseIdToDelete,
                text: "Opravdu chcete smazat inzerát s názvem: \"" + advertiseToDelete.name + "\". "
                    + "Tento inzerát byl vytvořen: " + formatDate(advertiseToDelete.createdOn),
                header: "Chcete smazat inzerát?"
            }
        });
    }

    // řazení inzerátů na profilu
    function sortAdvertises(e) {
        // získání hodnoty na řazení
        let value = Number(e.target.value);
        // kopie inzerátů
        let state = [...userAdvertises];
        // řazení inzerátů
        state.sort(function (a, b) {
            return (value < 0)
                ? (new Date(b.createdOn) - new Date(a.createdOn))
                : (new Date(a.createdOn) - new Date(b.createdOn));
        });
        // uložení inzerátů
        setUserAdvertises(state);
    }

    // formátování datumu a času do čitelnější podoby
    function formatDate(date) {
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    function handleCloseModal() {
        // resetování informací o inzerátu ke smazání
        setModalDeleteAdvertise({
            show: false,
            data: {
                _id: "",
                text: "",
                header: ""
            }
        });
    }

    function handleModalConfirm() {
        // dočasné nastavení pro axios s id inzerátu, který se má smazat
        let tempConfig = AxiosConfig;
        tempConfig.params = {advertiseIdToDelete: modalDeleteAdvertise.data._id};
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
        // nastavení useState modal zpět do výchozího stavu
        handleCloseModal();
    }

    // obsluha pro zavření informačního upozornění
    function handleModalInformation(){
        // navigace na předchozí stránky podle potřeby
        if(modalInformation.navigate !== false) {
            navigate(modalInformation.navigate);
        }
        setModalInformation({show: false, header: "", responseText: "", navigate: false});
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Modals pro zobrazení dotazu na uživatele*/}
            <Modal show={modalDeleteAdvertise.show} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>{modalDeleteAdvertise.data.header}</Modal.Header>
                <Modal.Body>{modalDeleteAdvertise.data.text}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseModal}>Ne</Button>
                    <Button variant="success" onClick={handleModalConfirm}>Ano</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalInformation.show} onHide={handleModalInformation}>
                <Modal.Header closeButton>{modalInformation.header}</Modal.Header>
                <Modal.Body>{modalInformation.responseText}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalInformation}>Zavřít</Button>
                </Modal.Footer>
            </Modal>
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
                <Card.Header hidden={userAdvertises.length <= 0} as="h5">Inzeráty</Card.Header>
                <Card.Header hidden={userAdvertises.length > 0} as="h5">Uživatel nemá žádné inzeráty</Card.Header>
                <Form.Select hidden={userAdvertises.length <= 0} className="ms-auto"
                             style={{width: 200}} onChange={sortAdvertises}>
                    <option value="1">Od nejstarších</option>
                    <option value="-1">Od nejnovějších</option>
                </Form.Select>
                <Card.Body id="advertises-list-user">
                    {/*Zobrazení inzerátů uživatele*/}
                    {userAdvertises && userAdvertises.map(advertise => {
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
                                <Card.Footer
                                    className="text-muted">Přidáno: {formatDate(advertise.createdOn)}</Card.Footer>
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