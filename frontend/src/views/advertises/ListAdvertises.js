import axios from 'axios';
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from "react";
import {useParams} from "react-router";
import {Card, Pagination} from "react-bootstrap";
import moment from "moment";
import {useNavigate} from "react-router-dom";

function ListAdvertises(){

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
        owner: ""
    }]);

    if(firstLoad){
        setFirstLoad(false);
        let tempConfig = AxiosConfig;
        tempConfig.params = {page};
        axios.get(BASE_URL + '/get-advertise-list', tempConfig).then(res => {
            if(Number(res.data.page) !== Number(page)){
                setPage(Number(res.data.page));
                navigate('/inzeraty/'+res.data.page);
            }
            setAdvertises(res.data.advertises);
            setMaxPage(Number(res.data.maxPage));
        }).catch(err => {
            console.log(err);
        });
    }

    function formatDate(date){
        return moment(date).format("DD.MM.YYYY HH:mm:ss");
    }

    return (
        <div id='content'>
            {advertises.map(advertise => {
                return (
                    <Card key={advertise._id}>
                        <Card.Body>
                            <Card.Title>
                                <Card.Link href={"/inzerat/" + advertise._id}>{advertise.name}</Card.Link>
                            </Card.Title>
                            <Card.Text>{advertise.description.substring(0, 200)}</Card.Text>
                            <Card.Text>{advertiseTypes[advertise.type]}</Card.Text>
                            {advertise.type === "sell" ?
                                <Card.Subtitle>{advertise.priceType === "price" ? ("Cena: " + advertise.price + " Kč") : priceTypes[advertise.priceType]}</Card.Subtitle>
                                : ""}
                        </Card.Body>
                        <Card.Footer className="text-muted">Přidáno: {formatDate(advertise.createdOn)}</Card.Footer>
                        {advertise.createdOn === advertise.lastUpdate ? null :
                            <Card.Footer className="text-muted" >Poslední úprava: {formatDate(advertise.lastUpdate)}</Card.Footer>
                        }
                    </Card>
                );
            })}
            <Pagination className="justify-content-center">
                <Pagination.First href={"/inzeraty/1"} hidden={page === 1}/>
                <Pagination.Prev href={"/inzeraty/" + Number(page-1)} hidden={page === 1}/>
                <Pagination.Item href={"/inzeraty/1"} hidden={page === 1}>{1}</Pagination.Item>
                <Pagination.Ellipsis disabled={true} hidden={(page === 1) || (page === 2) || (2 === page - 1) || (page - 1 === maxPage)}/>
                <Pagination.Item href={"/inzeraty/" + Number(page-1)} hidden={(page - 1 === 1) || (page === 1)}>{page-1}</Pagination.Item>
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Item href={"/inzeraty/" + Number(page+1)} hidden={(page + 1 === maxPage) || (page === maxPage)}>{page+1}</Pagination.Item>
                <Pagination.Ellipsis disabled={true} hidden={(maxPage === page) || (page + 2 === maxPage) ||  (maxPage === page+1)}/>
                <Pagination.Item href={"/inzeraty/" + maxPage} hidden={maxPage === page}>{maxPage}</Pagination.Item>
                <Pagination.Next href={"/inzeraty/" + Number(page+1)} hidden={maxPage === page}/>
                <Pagination.Last href={"/inzeraty/" + maxPage} hidden={maxPage === page}/>
            </Pagination>
        </div>
    )
}

export default ListAdvertises;