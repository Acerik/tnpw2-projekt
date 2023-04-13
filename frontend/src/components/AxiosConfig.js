/**
 * @return BASE_URL Vrací základní adresu pro dotaz na api
 * */
export const BASE_URL = "http://localhost:8080/api";
/**
 * @return AxiosConfig Vrací základní nastavení pro axios požadavky pro fungování dotazů
 * */
export const AxiosConfig = {
    headers: {
        "Content-Type":"application/json"
        },
    withCredentials: true
}
//"Access-Control-Allow-Origin": "http://localhost:3000"