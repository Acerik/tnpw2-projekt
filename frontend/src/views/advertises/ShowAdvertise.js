import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Card} from 'react-bootstrap';
import {useParams} from "react-router";
import moment from "moment";

function ShowAdvertise(){

    const advertiseId = useParams().advertiseId;
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
        ownerName:""
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

    return (
        <>
            <Card>
                <Card.Header as="h5">{advertiseTypes[advertiseData.type]}</Card.Header>
                <Card.Body>
                    <Card.Title>{advertiseData.name}</Card.Title>
                    <Card.Text>{advertiseData.description}</Card.Text>
                    {advertiseData.type === "sell" ?
                        <Card.Subtitle>{advertiseData.priceType === "price" ? (advertiseData.price + " Kč") : priceTypes[advertiseData.priceType]}</Card.Subtitle>
                    : ""}
                    <Card.Subtitle>Uživatel: <Card.Link href={"/uzivatel/"+advertiseData.owner}>{advertiseData.ownerName}</Card.Link></Card.Subtitle>
                </Card.Body>
                    <Card.Footer className="text-muted">Přidáno: {formatDate(advertiseData.createdOn)}</Card.Footer>
                    {advertiseData.createdOn === advertiseData.lastUpdate ? null :
                        <Card.Footer className="text-muted" >Poslední úprava: {formatDate(advertiseData.lastUpdate)}</Card.Footer>
                    }
            </Card>
        </>
    );
}

export default ShowAdvertise;