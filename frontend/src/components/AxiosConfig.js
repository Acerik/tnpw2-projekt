/**
 * @return BASE_URL Vrací základní adresu pro dotaz na api
 * */
//export const BASE_URL = "http://localhost:8080/api";
// použitá přímo IP adresa pro testování na mobilním zařízení na stejné wifi
export const BASE_URL = "http://192.168.0.111:8080/api";
/**
 * @return AxiosConfig Vrací základní nastavení pro axios požadavky pro fungování dotazů
 * */
export const AxiosConfig = {
    headers: {
        "Content-Type":"application/json"
        },
    withCredentials: true
}