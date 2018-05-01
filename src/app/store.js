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
    async GetImages(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/GetImages',
            'type': 'GET',
            'data': data,
            'access_token': User.access_token
        });
    },
    async GetStudents() {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/GetStudents',
            'type': 'GET',
            'access_token': User.access_token
        });
    },
    async GetOptions(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/GetOptions',
            'type': 'GET',
            'access_token': User.access_token,
            'data': data
        });
    },
    async SetImage(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/SetImage',
            'type': 'POST',
            'access_token': User.access_token,
            'data': data
        });
    },
}