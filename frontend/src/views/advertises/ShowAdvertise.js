import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Card} from 'react-bootstrap';
import {useParams} from "react-router";
import moment from "moment";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

function ShowAdvertise(){

    const advertiseId = useParams().advertiseId;
    const [cookies] = useCookies('userId');
    const navigate = useNavigate();
    const priceTypes = {"free":"Zdarma", "offer":"Dohodou"};
    const advertiseTypes = {"buy":"Koupím", "sell":"Prodám"};
    const [advertiseData, setAdvertiseData] = useState({
        name: "",
        price: "",
        description: "",
        priceType: "",
        type: "",
        createdOn: "",
        lastUpdate: "",
        owner: "",
        ownerName:"",
        address: {
            city: "",
            zipCode: ""
        }
    });

    const [firstLoad, setFirstLoad] = useState(true);

    if(firstLoad) {
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params={advertiseId};
        axios.get(BASE_URL + "/get-advertise",tempConfig ).then(res => {
            setAdvertiseData(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

    function formatDate(date){
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    function deleteAdvertise(){
        if(window.confirm("Chcete smazat tento inzerát?")){
            let tempConfig = AxiosConfig;
            tempConfig.params = {advertiseIdToDelete: advertiseId};
            axios.delete(BASE_URL + '/delete-advertise', tempConfig).then((res) => {
                if(Array.isArray(res.data)){
                    alert("Chyba. " + res.data.join(". "));
                } else {
                    alert("Úspěch. " + res.data + " Dojde k přesměrování na předchozí stránku.");
                    navigate(-2);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    return (
        <div id='content'>
            <Card>
                <Card.Header as="h5">{advertiseTypes[advertiseData.type]}</Card.Header>
                <Card.Body>
                    <Card.Title>{advertiseData.name}</Card.Title>
                    <Card.Text id={"show-advertise"}>{advertiseData.description}</Card.Text>
                    {advertiseData.type === "sell" ?
                        <Card.Subtitle>{advertiseData.priceType === "price" ? (advertiseData.price + " Kč") : priceTypes[advertiseData.priceType]}</Card.Subtitle>
                    : ""}
                    <Card.Subtitle>{"Obec: " + advertiseData.address.city + " PSČ: " + advertiseData.address.zipCode}</Card.Subtitle>
                    <Card.Subtitle>Uživatel: <Card.Link href={"/uzivatel/"+advertiseData.owner}>{advertiseData.ownerName}</Card.Link></Card.Subtitle>
                    {advertiseData.owner === cookies.userId ?
                        <>
                            <br/> <br/>
                            <Card.Subtitle>Jste autorem inzerátu.</Card.Subtitle>
                            <Card.Link href={'/upravit-inzerat/'+advertiseId}>Upravit inzerát</Card.Link>
                            <Card.Link href='#smazat-inzerat' onClick={deleteAdvertise}>Smazat inzerát</Card.Link>
                        </>
                        : ""}
                </Card.Body>
                    <Card.Footer className="text-muted">Přidáno: {formatDate(advertiseData.createdOn)}</Card.Footer>
                    {advertiseData.createdOn === advertiseData.lastUpdate ? null :
                        <Card.Footer className="text-muted" >Poslední úprava: {formatDate(advertiseData.lastUpdate)}</Card.Footer>
                    }
            </Card>
        </div>
    );
}

export default ShowAdvertise;