import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from 'react';
import {Alert, Card} from 'react-bootstrap';
import {useParams} from "react-router";
import {useCookies} from "react-cookie";
import moment from "moment";

function ShowUser() {
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
        }});
    const [userAdvertises, setUserAdvertises] = useState([{
        _id: "",
        name: "",
        price: "",
        description: "",
        priceType: "",
        type: "",
        createdOn: "",
        lastUpdate: "",
        owner: ""
    }]);

    if (firstLoad) {
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params = {userId};
        axios.get(BASE_URL + '/get-user', tempConfig).then(res => {
            setUserData(res.data);
            setMyProfile(cookies.userId === res.data._id);
        }).catch(err => {
            console.log(err);
        });
        axios.get(BASE_URL + '/get-advertises-from-user', tempConfig).then(res => {
            setUserAdvertises(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

    function deleteAdvertise(e){
        let advertiseIdToDelete = e.target.attributes.advertiseid.value;
        let advertiseToDelete = userAdvertises.find(({_id}) => _id === advertiseIdToDelete);
        if(window.confirm("Chcete smazat inzerát s názvem: " + advertiseToDelete.name)){
            let tempConfig = AxiosConfig;
            tempConfig.params = {advertiseIdToDelete};
            axios.delete(BASE_URL + '/delete-advertise', tempConfig).then((res) => {
                if(Array.isArray(res.data)){
                    let element = document.getElementById("errors-p");
                    element.innerHTML = res.data.join("<br>");
                    setHiddenError(false);
                    setTimeout(() => {
                        setHiddenError(true);
                    }, 3000);
                } else {
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

    function formatDate(date){
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    return (
        <div id='content'>
            <Alert hidden={hiddenError} variant="danger" onClose={() => setHiddenError(true)} dismissible>
                <Alert.Heading>Chyba</Alert.Heading>
                <p id="errors-p"> </p>
            </Alert>
            <Alert hidden={hiddenSuccess} variant="success" onClose={()=> setHiddenSuccess(true)} dismissible>
                <Alert.Heading>Úspěch</Alert.Heading>
                <p id="success-p"> </p>
            </Alert>
            <Card>
                <Card.Body>
                    {myProfile ? <Card.Title> Můj profil</Card.Title> : ""}
                    <Card.Title>{userData.username}</Card.Title>
                    {userData.firstName || userData.lastName ?
                    <Card.Text>Jméno: {userData.firstName} {userData.lastName}</Card.Text> : ""}
                    <Card.Text>Email: {userData.email}</Card.Text>
                    {userData.phoneNumber ?
                    <Card.Text>Telefonní číslo: {userData.phoneNumber}</Card.Text> : "" }
                    {userData.address ?
                    <Card.Text>Obec: {userData.address.city}, {userData.address.zipCode}</Card.Text> : ""}
                    {userData.createdOn ?
                    <Card.Text>Registrován: {formatDate(userData.createdOn)}</Card.Text> : ""}
                    {myProfile ?
                        <Card.Link href='/upravit-profil'>Upravit profil</Card.Link>
                    : ""}
                </Card.Body>
            </Card>
            <Card>
            <Card.Header as="h5">Inzeráty</Card.Header>
                <Card.Body>
            {userAdvertises.map(advertise => {
                return (
                    <Card key={advertise._id}>
                        <Card.Body>
                            <Card.Title>
                                <Card.Link href={"/inzerat/" + advertise._id}>{advertise.name}</Card.Link>
                            </Card.Title>
                            <Card.Text>{advertise.description.substring(0, 200) + (advertise.description.length > 200 ? "..." : " ")}</Card.Text>
                            <Card.Text>{advertiseTypes[advertise.type]}</Card.Text>
                            {advertise.type === "sell" ?
                                <Card.Subtitle>{advertise.priceType === "price" ? ("Cena: " + advertise.price + " Kč") : priceTypes[advertise.priceType]}</Card.Subtitle>
                                : ""}
                            {myProfile ? <>
                                <Card.Link href={'/upravit-inzerat/'+advertise._id}>Upravit inzerát</Card.Link>
                                <Card.Link advertiseid={advertise._id} href={"#"} onClick={deleteAdvertise}>Smazat inzerát</Card.Link>
                                </>
                                : ""}
                        </Card.Body>
                        <Card.Footer className="text-muted">Přidáno: {formatDate(advertise.createdOn)}</Card.Footer>
                        {advertise.createdOn === advertise.lastUpdate ? null :
                            <Card.Footer className="text-muted" >Poslední úprava: {formatDate(advertise.lastUpdate)}</Card.Footer>
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