import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Card} from 'react-bootstrap';
import {useParams} from "react-router";
import moment from "moment";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

function ShowAdvertise() {

    // příprava proměnných, získání parametru s číslem inzerátu
    const advertiseId = useParams().advertiseId;
    const [cookies] = useCookies('userId');
    const navigate = useNavigate();
    const priceTypes = {"free": "Zdarma", "offer": "Dohodou"};
    const advertiseTypes = {"buy": "Koupím", "sell": "Prodám"};
    const [advertiseData, setAdvertiseData] = useState({
        name: "",
        price: "",
        description: "",
        priceType: "",
        type: "",
        createdOn: "",
        lastUpdate: "",
        owner: "",
        ownerName: "",
        address: {
            city: "",
            zipCode: ""
        }
    });

    const [firstLoad, setFirstLoad] = useState(true);

    // prvotní načtení informací
    if (firstLoad) {
        setFirstLoad(false);
        // vytvoření dočasného nastavení pro axios s id inzerátu
        let tempConfig = AxiosConfig;
        tempConfig.params = {advertiseId};
        // dotaz na backend
        axios.get(BASE_URL + "/get-advertise", tempConfig).then(res => {
            if(!Array.isArray(res.data)) {
                setAdvertiseData(res.data);
            } else {
                alert(res.data.join(" "));
                navigate(-1);
            }
        }).catch(err => {
            console.log(err);
        });
    }

    // formátování času do čitelnější podoby
    function formatDate(date) {
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    // metoda pro smázání inzerátu, lze využít pouze pokud je přihlášený uživatel autorem inzerátu
    function deleteAdvertise() {
        // potvrzení zda se má inzerát smazat
        if (window.confirm("Chcete smazat tento inzerát?")) {
            // vytvoření dočasného nastavení s id inzerátu, který se má smazat
            let tempConfig = AxiosConfig;
            tempConfig.params = {advertiseIdToDelete: advertiseId};
            // volání na backend
            axios.delete(BASE_URL + '/delete-advertise', tempConfig).then((res) => {
                // zobrazení výsledku
                if (Array.isArray(res.data)) {
                    alert("Chyba. " + res.data.join(". "));
                } else {
                    alert("Úspěch. " + res.data + " Dojde k přesměrování na předchozí stránku.");
                    // návrat na předchozí stránky (-2, protože -1 se vrátí na stav před smazání (#smazat-inzerát))
                    navigate(-2);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    // vykreslení
    return (
        <div id='content'>
            {/*Zobrazení všech informací o inzerátu*/}
            <Card>
                <Card.Header as="h5">{advertiseTypes[advertiseData.type]}</Card.Header>
                <Card.Body>
                    <Card.Title>{advertiseData.name}</Card.Title>
                    <Card.Text id={"show-advertise"}>{advertiseData.description}</Card.Text>
                    {/*Zobrazení ceny a typu ceny na základě typu inzerátu*/}
                    {advertiseData.type === "sell" ?
                        <Card.Subtitle>{advertiseData.priceType === "price" ? (advertiseData.price + " Kč") : priceTypes[advertiseData.priceType]}</Card.Subtitle>
                        : ""}
                    <Card.Subtitle>{"Obec: " + advertiseData.address.city + " PSČ: " + advertiseData.address.zipCode}</Card.Subtitle>
                    <Card.Subtitle>Uživatel: <Card.Link
                        href={"/uzivatel/" + advertiseData.owner}>{advertiseData.ownerName}</Card.Link></Card.Subtitle>
                    {/*Kontrola zda je uživatel autorem inzerátu, pokud ano zobrazí se možnost editace a smazání*/}
                    {advertiseData.owner === cookies.userId ?
                        <>
                            <br/> <br/>
                            <Card.Subtitle>Jste autorem inzerátu.</Card.Subtitle>
                            <Card.Link href={'/upravit-inzerat/' + advertiseId}>Upravit inzerát</Card.Link>
                            <Card.Link href='#smazat-inzerat' onClick={deleteAdvertise}>Smazat inzerát</Card.Link>
                        </>
                        : ""}
                </Card.Body>
                {/*Zobrazení datumu s časem přidání, pokud je poslední změna jiná nežli přidání zobrazí se i ta*/}
                <Card.Footer className="text-muted">Přidáno: {formatDate(advertiseData.createdOn)}</Card.Footer>
                {advertiseData.createdOn === advertiseData.lastUpdate ? null :
                    <Card.Footer className="text-muted">Poslední
                        úprava: {formatDate(advertiseData.lastUpdate)}</Card.Footer>
                }
            </Card>
        </div>
    );
}

export default ShowAdvertise;