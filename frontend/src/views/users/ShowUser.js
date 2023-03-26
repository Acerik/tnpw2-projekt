import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../AxiosConfig";
import React, {useState} from 'react';
import {Card} from 'react-bootstrap';
import {useParams} from "react-router";

function ShowUser(){
    const userId = useParams().userId;
    const priceTypes = {"free":"Zdarma", "offer":"Dohodou"};
    const advertiseTypes = {"buy":"Koupím", "sell":"Prodám"};
    const [firstLoad, setFirstLoad] = useState(true);
    const [userData, setUserData] = useState({
        username: "",
        email: ""
    });
    const [userAdvertises, setUserAdvertises] = useState([{
        _id: "",
        name: "",
        price: "",
        description: "",
        priceType: "",
        type: "",
        owner: ""
    }]);

    if(firstLoad){
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params={userId};
        axios.get(BASE_URL+'/get-user', tempConfig).then(res => {
            setUserData(res.data);
            console.log(res);
        }).catch(err => {
            console.log(err);
        });
        axios.get(BASE_URL + '/get-advertises-from-user', tempConfig).then(res=>{
            setUserAdvertises(res.data);
            console.log(res)
        }).catch(err=>{
            console.log(err);
        });
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>{userData.username}</Card.Title>
                    <Card.Text>Email: {userData.email}</Card.Text>
                </Card.Body>
                <Card.Header as="h5">Inzeráty</Card.Header>
                {userAdvertises.map(advertise => {
                    return (
                      <Card.Body key={advertise._id}>
                          <Card.Title><Card.Link href={"/inzerat/"+ advertise._id}>{advertise.name}</Card.Link></Card.Title>
                          <Card.Text>{advertise.description.substring(0,200)}</Card.Text>
                          <Card.Text>{advertiseTypes[advertise.type]}</Card.Text>
                          <Card.Subtitle>{advertise.priceType === "price" ? ("Cena: " + advertise.price + " Kč") : priceTypes[advertise.priceType]}</Card.Subtitle>
                      </Card.Body>
                    );
                })}
            </Card>
        </>
    );
}

export default ShowUser;