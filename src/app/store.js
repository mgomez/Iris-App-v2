/**
 *
 * STORE
 *
 */
import $ from 'jquery';
import localforage from 'localforage';
import Enumerable from 'linq';
import Constant from './utils/constant';
import Xhr from './utils/xhr';

var currencyFormatter = require('currency-formatter');

export default {
    //Datos del usuario de la guardaos en localforage
    GetUser() {
        return localforage.getItem("User");
    },
    GetDeviceId() {
        return localforage.getItem("registrationId");
    },
    //Login
    Login(data) {
        return Xhr.ajax({
            url: 'https://www.ocsi.mx/Extranet/Services/WebApi_OneCardApp/token',
            type: 'POST',
            dataType: 'json',
            data: data,
        });
    },
}