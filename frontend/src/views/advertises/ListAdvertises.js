import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from "react";
import {useParams} from "react-router";
import {Card, Pagination} from "react-bootstrap";
import moment from "moment";
import {useNavigate} from "react-router-dom";

function ListAdvertises(){
    // příprava proměnných, získání čísla stránky, pokud není obsaženo doplní se 1
    const navigate = useNavigate();
    const [page, setPage] = useState(Number(useParams().page ? useParams().page : 1));
    const [maxPage, setMaxPage] = useState(Number(page)+1);
    const [firstLoad, setFirstLoad] = useState(true);
    const priceTypes = {"free": "Zdarma", "offer": "Dohodou"};
    const advertiseTypes = {"buy": "Koupím", "sell": "Prodám"};
    const [advertises, setAdvertises] = useState([{
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

    // pokud se jedná o první načtení ( slouží k zamezení opětovného volání, které by bylo způsobeno využitím usestate
    if(firstLoad){
        setFirstLoad(false);
        // dočasné nastavení pro dotaz axiosu, přidáním parametru s aktuální stránkou
        let tempConfig = AxiosConfig;
        tempConfig.params = {page};
        axios.get(BASE_URL + '/get-advertise-list', tempConfig).then(res => {
            // kontrola zda je aktuální číslo stránky rozdílné od obdrženého čísla stránky
            // pokud by uživatel zadal např stránku 20 a maximum by bylo 4, pak backend vrátí stránku 4 jako aktuální
            if(Number(res.data.page) !== Number(page)){
                // nastavení a přesměrování na novou stránku
                setPage(Number(res.data.page));
                navigate('/inzeraty/'+res.data.page);
            }
            // nastavení inzerátů a maximálního možného čísla pro stránku
            setAdvertises(res.data.advertises);
            setMaxPage(Number(res.data.maxPage));
        }).catch(err => {
            console.log(err);
        });
    }

    // formátování pro datumy s časem do čitelné podoby
    function formatDate(date){
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    return (
        <div id='content'>
            {/*Průchod inzerátů po jednom pomocí mapování*/}
            {advertises.map(advertise => {
                return (
                    <Card key={advertise._id}>
                        <Card.Body>
                            <Card.Title>
                                {/*Zobrazení názvu inzerátu s možností prokliku na inzerát*/}
                                <Card.Link href={"/inzerat/" + advertise._id}>{advertise.name}</Card.Link>
                            </Card.Title>
                            {/*Zobrazení krátkého popisku do 200 slov, pokud je delší omezí se na 200 a přidá tečky*/}
                            <Card.Text>{advertise.description.substring(0, 200) + (advertise.description.length > 200 ? "..." : " ")}</Card.Text>
                            <Card.Text>{advertiseTypes[advertise.type]}</Card.Text>
                            {/*Zobrazení ceny podle typu ceny a typu inzerátu*/}
                            {advertise.type === "sell" ?
                                <Card.Subtitle>{advertise.priceType === "price" ? ("Cena: " + advertise.price + " Kč") : priceTypes[advertise.priceType]}</Card.Subtitle>
                                : ""}
                            {/*Zobrazení adresy inzerátu*/}
                            <Card.Subtitle>{"Obec: " + advertise.address.city + " PSČ: " + advertise.address.zipCode}</Card.Subtitle>
                        </Card.Body>
                        {/*Zobrazení datumu s časem, kdy byl inzerát přidán*/}
                        <Card.Footer className="text-muted">Přidáno: {formatDate(advertise.createdOn)}</Card.Footer>
                        {/*Pokud je úprava inzerátu rozdílná od přiddání dojde k zobrazení datumu a času s poslední úpravou*/}
                        {advertise.createdOn === advertise.lastUpdate ? null :
                            <Card.Footer className="text-muted" >Poslední úprava: {formatDate(advertise.lastUpdate)}</Card.Footer>
                        }
                    </Card>
                );
            })}
            {/*Stránkování inzerátů*/}
            <Pagination className="justify-content-center">
                {/*První stránka (<<), nezobrazí se pokud je aktuální stránka 1*/}
                <Pagination.First href={"/inzeraty/1"} hidden={page === 1}/>
                {/*Předchozí stránka (<), nezobrazí se pokud je aktuální stránka 1*/}
                <Pagination.Prev href={"/inzeraty/" + Number(page-1)} hidden={page === 1}/>
                {/*První stránka (1) nezobrazí se pokud je stránka 1*/}
                <Pagination.Item href={"/inzeraty/1"} hidden={page === 1}>{1}</Pagination.Item>
                {/*Zobrazení teček, dojde k zobrazení pokud jsou mezi aktuální a první stránkou minimálně 2 stránky*/}
                <Pagination.Ellipsis disabled={true} hidden={(page === 1) || (page === 2) || (2 === page - 1) || (page - 1 === maxPage)}/>
                {/*Zobrazení stránky o jedna menší nežli je aktuální, nedojde k zobrazení pokud je stránka první případně druhá*/}
                <Pagination.Item href={"/inzeraty/" + Number(page-1)} hidden={(page - 1 === 1) || (page === 1)}>{page-1}</Pagination.Item>
                {/*Zbrazení aktuální stránky*/}
                <Pagination.Item active>{page}</Pagination.Item>
                {/*Zobrazení následující stránky, nezobrazí se pokud je následující stránky maximální možná*/}
                <Pagination.Item href={"/inzeraty/" + Number(page+1)} hidden={(page + 1 === maxPage) || (page === maxPage)}>{page+1}</Pagination.Item>
                {/*Zobrazení teček, nezobrazí se pokud mezi aktuální a maximální stránkou nejsou alespoň 2 možné*/}
                <Pagination.Ellipsis disabled={true} hidden={(maxPage === page) || (page + 2 === maxPage) ||  (maxPage === page+1)}/>
                {/*Zobrazení maximální stránky číslem, nezobrazí se pokud je aktuální stránka maximální možná*/}
                <Pagination.Item href={"/inzeraty/" + maxPage} hidden={maxPage === page}>{maxPage}</Pagination.Item>
                {/*Následující stránka (>), nezobrazí se pokud je aktuální stránka poslední možná*/}
                <Pagination.Next href={"/inzeraty/" + Number(page+1)} hidden={maxPage === page}/>
                {/*Poslední stránka (>>), nezobrazí se pokud je aktuální stránka poslední možná*/}
                <Pagination.Last href={"/inzeraty/" + maxPage} hidden={maxPage === page}/>
            </Pagination>
        </div>
    )
}

export default ListAdvertises;