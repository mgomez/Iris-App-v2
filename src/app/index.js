/**
 *
 * INDEX
 *
 */
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap4-fs-modal/dist/css/bootstrap-fs-modal.css";
import "../assets/css/app.less";

import $ from 'jquery';
import "bootstrap";
import FastClick from "fastclick";
import Enumerable from 'linq';
import localforage from 'localforage';
import currencyFormatter from 'currency-formatter';
import Router from './router';
var AesCtr = require("../assets/js/aes-ctr");

window.$ = $;

window.Connection = true;
//Produccion
Conekta.setPublicKey("key_epBSCdx5g5Jh3svABiranxQ");
Conekta.setLanguage("es");

localforage.config({
    driver: localforage.LOCALSTORAGE,
    name: 'Iris',
    version: 2.1,
    size: 4980736,
    storeName: 'dbIris',
});

window.app = {
    touchid: false,
    activeFingerPrint: false,
    // initialization page
    async init() {
        var _this = this;
        //Polyfill para eliminar retrasos de clics en los navegadores con IU táctiles
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
            console.log(FastClick);
        }, false);

        _this.activeFingerPrint = await localforage.getItem("activeFingerPrint") || false;
        _this.touchid = await localforage.getItem("touchid") || false;

        $(function() {
            //oculta la vista de loading
            _this.loading(false);
            $("body").addClass('ready');

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
        //agrega padding si es ios
        $("body").addClass(device.platform);
        //huella digital
        if (device.platform === "iOS") {
            //valida touchid disponible
            window.plugins.touchid.isAvailable(function(type) {
                    localforage.setItem("touchid", true);
                    app.touchid = true;
                },
                function(msg) {
                    localforage.setItem("touchid", false);
                    app.touchid = false;
                }
            );
        } else {
            //Huella Digital - ANDROID
            FingerprintAuth.isAvailable(function(result) {
                app.touchid = true;
                localforage.setItem("touchid", true);
            }, function(message) {
                app.touchid = false;
                localforage.setItem("touchid", false);
            });
        }
        //reemplaza notificaciones por nativo
        if (navigator.notification) {
            window.alert = function(message) {
                navigator.vibrate(100);
                navigator.notification.alert(message, null, "Iris Enseñanza Preescolar", 'OK');
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
            $("body").addClass('keyboardDidShow');
            $("#btn-logout").hide();
        });

        window.addEventListener('keyboardDidHide', function() {
            $("body").removeClass('keyboardDidShow');
            $("#btn-logout").show();
        });
    },
    setupPush() {
        var push = PushNotification.init({
            "android": {
                "senderID": "539939739166"
            },
            "browser": {
                "pushServiceURL": 'http://push.api.phonegap.com/v1/push',
                "applicationServerKey": "BL918Q7BmCeOBMom7IGxuLHZWCl11Ob7qzIdce3bGLnvKKx_jrcpqNkPjbEswISebb1ePSW1nah5klDn78N_2Kg"
            },
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });

        push.on('registration', function(data) {
            localforage.setItem('deviceId', data.registrationId);
        });

        push.on('error', function(e) {
            alert("Ocurrió un error: " + e.message);
        });

        push.on('notification', function(data) {
            console.log(data);
            alert(data.message);
        });

    },
    getPicture(pictureSource) {
        var Deferred = $.Deferred();
        try {
            var PictureSourceType = Camera.PictureSourceType[pictureSource];
            var config = {
                quality: (device.platform !== 'Android') ? 50 : 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: PictureSourceType,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 750,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            navigator.camera.getPicture(function(imageData) {
                //$img.attr("src", "data:image/jpeg;base64," + imageData);
                Deferred.resolve(imageData);
            }, function(message) {
                return Deferred.reject(message);
            }, config);

            return Deferred.promise();
        } catch (e) {
            return Deferred.reject(e);
        }
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
    },
    async verifyFingerprint(showUserName) {
        var asyncVerify = $.Deferred();
        var mensaje = "";

        if (showUserName) {
            var formData = await localforage.getItem("activeFingerPrintData");
            var decripted = AesCtr.decrypt(formData, device.uuid, 256);

            formData = JSON.parse(decripted);

            var UserName = formData.userName;

            mensaje = 'Usa tu huella digital para acceder a IRIS como ' + UserName + ' de forma rapida y segura'
        } else {
            mensaje = 'Usa tu huella digital para acceder a IRIS de forma rapida y segura';
        }

        if (device.platform === "iOS") {
            window.plugins.touchid.verifyFingerprint(
                mensaje,
                function(msg) {
                    asyncVerify.resolve(true);
                },
                function(msg) {
                    asyncVerify.resolve(false);
                }
            );
        } else {
            var encryptConfig = {
                clientId: "IRIS",
                username: "0013zkr@gmail.com",
                password: "XrmyikHvLFC2YDF11oHypKl0yB",
                locale: "es",
                dialogTitle: "IRIS",
                dialogMessage: mensaje
            };

            FingerprintAuth.encrypt(encryptConfig, encryptSuccessCallback, encryptErrorCallback);

            function encryptSuccessCallback(result) {
                localforage.setItem("UserEncrypt", result);

                if (result.withFingerprint) {
                    console.log("Encrypted credentials: " + result.token);
                } else if (result.withBackup) {
                    console.log("Authenticated with backup password");
                }

                asyncVerify.resolve(true);
            }

            function encryptErrorCallback(error) {
                localforage.setItem("touchid", false);
                app.touchid = false;

                if (error === FingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
                    console.log("FingerprintAuth Dialog Cancelled!");
                } else {
                    console.log("FingerprintAuth Error: " + error);
                }
                asyncVerify.resolve(false);
            }
        }
        return asyncVerify.promise();
    },
    View(view, layout) {
        Router.View(view, layout);
    },
    Exit() {
        LogOut();
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