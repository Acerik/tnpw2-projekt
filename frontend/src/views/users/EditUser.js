import axios from "axios";
import {BASE_URL, AxiosConfig} from "../../components/AxiosConfig";
import React, {useState} from "react";
import {useCookies} from 'react-cookie';

function EditUser() {
    const [cookies] = useCookies('userId');
    const [firstLoad, setFirstLoad] = useState(true);

    if(firstLoad){
        setFirstLoad(false);
        axios.get(BASE_URL + '/edit-user')
    }

    return (
        <>

        </>
    )
}

export default EditUser;