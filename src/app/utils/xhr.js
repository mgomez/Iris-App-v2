'use strict';
import $ from 'jquery';
import Constant from './constant';
import Router from '../router';

export default {
    ajax(params) {
        var that = this;

        var defaults = {
            "async": true,
            "crossDomain": true,
            url: Constant.SERVER_URL + params.path,
            type: params.type || 'GET',
            contentType: 'application/json',
            dataType: 'json',
            /*timeout: 10000,*/
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "bearer " + params.access_token,
                "Cache-Control": "no-cache",
            },
            beforeSend: function() {
                app.loading(true);
            }
        };

        $.extend(params, defaults);

        try {
            if (window.Connection) {
                console.debug("XHR ajax:", params);
                return $.ajax(params)
                    .fail(function(error, textstatus, message) {
                        if (textstatus === "timeout") {
                            alert("Se agoto el tiempo de espera.Por favor vuelve a intentarlo");
                            app.loading(false);
                        } else {
                            switch (error.status) {
                                case 400:
                                    let mensajeError = that.getErrorMessage(error);
                                    app.loading(false);
                                    alert(mensajeError);
                                    break;
                                case 401:
                                    alert("La sesión ha expirado.");
                                    Router.View('login', true);
                                    break;
                                case 500:
                                    alert("Ocurrió un error inesperado, por favor inténtalo mas tarde.");
                                    break;
                                default:
                                    break;
                            }
                        }

                    })
                    .always(function() {
                        app.loading(false);
                    });
            } else {
                alert("comprueba tu conexion y vuelve a intentarlo");
                app.loading(false);
            }
        } catch (e) {
            alert(e);
            app.loading(false);
        }
    },
    getErrorMessage(err) {
        try {
            if (err.responseJSON.ModelState) {
                var Errores = err.responseJSON.ModelState[""].join("\n");
                return Errores;
            } else {
                var mensajeError = err.responseJSON.Message;
                mensajeError = JSON.parse(mensajeError);
                return mensajeError.message || mensajeError.Message || mensajeError.errors.join("\n");
            }
        } catch (e) {
            return "Error de Comunicaciones.";
        }
    }
};