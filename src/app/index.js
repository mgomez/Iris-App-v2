'use strict';

import 'bootstrap/dist/css/bootstrap.css';
import "../assets/css/app.less";

import $ from 'jquery';
import FastClick from "fastclick";
import Enumerable from 'linq';
import localforage from 'localforage';
import currencyFormatter from 'currency-formatter';
import Router from './router';

require('bootstrap');

window.jQuery = $;

window.Connection = true;

window.app = {
    // initialization page
    init() {
        var _this = this;

        FastClick.attach(document.body);

        $(function() {
            //oculta la vista de loading
            _this.loading(false);
        });
        //phonegap listener
        document.addEventListener("deviceready", this.deviceReady, false);

        this.isAuthenticated();
    },
    async isAuthenticated() {
        var User = await localforage.getItem('User');

        //valida que exista el Usuario en la memoria del telefono y que este verificado
        if (User) {
            Router.View('main');
        } else {
            Router.View('login', true);
        }
    },
    loading(display) {
        if (display) {
            $("#loading").show();
        } else {
            $("#loading").hide();
        }
    },
    deviceReady() {
        //reemplaza notificaciones por nativo
        if (navigator.notification) {
            window.alert = function(message) {
                navigator.vibrate(100);
                navigator.notification.alert(message, null, "APP NAME", 'OK');
            };
        }
        //tap menu
        document.addEventListener("menubutton", function() {
            $("[data-tab=configuracion]").trigger("click");
        }, false);
        //valida conexion
        var networkState = navigator.connection.type;

        window.Connection = (networkState !== Connection.NONE) ? true : false;

        document.addEventListener("offline", function() {
            window.Connection = false;
        }, false);

        document.addEventListener("online", function() {
            window.Connection = true;
        }, false);
        //obtengo el registrationId para los mensajes push
        app.setupPush();
        //oculto el footer si el teclado se muestra
        window.addEventListener('keyboardDidShow', function() {

        });

        window.addEventListener('keyboardDidHide', function() {

        });
    },
    setupPush() {
        var push = PushNotification.init({
            "android": {
                "senderID": "678355429347"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });

        push.on('registration', function(data) {
            localforage.setItem('registrationId', data.registrationId);
        });

        push.on('error', function(e) {
            alert("Ocurrió un error: " + e.message);
        });

        push.on('notification', function(data) {
            var origin = (data.additionalData) ? data.additionalData.origin : "";

            console.log("Push Result", data);

            switch (origin) {
                default: alert(data.message);
                break;
            }
        });

    },
    takePhoto(onPhotoDataSuccess, onFail) {
        var ios = device.platform === "iOS";

        Camera.quality = (ios) ? 10 : 50;
        Camera.targetWidth = (ios) ? 150 : 750;
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;

        try {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
                quality: Camera.quality,
                targetWidth: Camera.targetWidth,
                destinationType: destinationType.DATA_URL
            });
        } catch (e) {
            alert(e, navigator);
        }
    }
};

app.init();

//Redireccion del menu principal
$(document).on("click", ".routerView", function() {
    var view = $(this).data('view');
    var layout = $(this).data('layout');

    Router.View(view, layout);
});
//Cerrar sesion, borra datos de la memoria del telefono
$(document).on('click', ".LogOut", function() {
    LogOut();
});

function LogOut() {
    const Promesas = [
        localforage.removeItem('frmRegistro'),
        localforage.removeItem('cellPhone'),
        localforage.removeItem('PersonalInfo'),
        localforage.removeItem('User'),
        localforage.removeItem('lastView')
    ]

    Promise.all(Promesas).then(function(result) {
        Router.View('login', true);
    });
}

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

export default {
    // initialization page
    init() {

    }
};