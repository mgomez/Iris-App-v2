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
    async GetPaymentType() {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/GetPaymentType',
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
    async SetPayment(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Conekta/SetPayment',
            'type': 'POST',
            'access_token': User.access_token,
            'data': data
        });
    },
    async GetDates() {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/GetDates',
            'access_token': User.access_token
        });
    },
    //Registro de Evaluacion
    //"iType": "1",
    //"iRelationId": "0",
    //"iStudentId": "2",
    //"iDateId": "50",
    //"vcValues": "2-1|3-2",
    //"vcNote": "Test"
    async SetOptions(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/SetOptions',
            'type': 'POST',
            'access_token': User.access_token,
            'data': data
        });
    },
    async SetSuggestion(data) {
        let User = await this.GetUser();

        return Xhr.ajax({
            'path': 'Data/SetSuggestion',
            'type': 'POST',
            'access_token': User.access_token,
            'data': data
        });
    },
}