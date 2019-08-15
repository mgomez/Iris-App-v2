/**
 *
 * HUELLA DIGITAL
 *
 */
import "./huellaDigital.less";
import $ from 'jquery';
import localforage from 'localforage';
import Tool from '../utils/tool';
import AesCtr from "../../assets/js/aes-ctr.js";
import Constant from '../utils/constant';
import templateHtml from "./huellaDigital.tpl.html";

window.AesCtr = AesCtr;

export default {
    init() {
        this.render();
    },
    render() {
        var renderTpl = Tool.renderTpl(templateHtml, {
            showMessage: !app.activeFingerPrint,
        });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    async handleEvents() {
        var _this = this;
        var activeFingerPrint = app.activeFingerPrint;
        var User = await localforage.getItem("User");

        $("#currentPage").html("Huella Digital");

        if (activeFingerPrint) {
            $("#inputPassword, #btnEstadoHuella").prop("disabled", false);
        }

        var estadoHuella = activeFingerPrint ? "Desactiva" : "Activa";

        $("#estadoHuella").html(estadoHuella);
        //checkbox mensaje 
        $("#ckMessage").on("change", function() {
            var deacuerdo = $(this).is(":checked");

            if (deacuerdo) {
                $("#inputPassword, #btnEstadoHuella").prop("disabled", false);
            } else {
                $("#inputPassword, #btnEstadoHuella").prop("disabled", true);
            }
        });
        //Cambiar estado de huella digital
        $(".btnEstadoHuella").on("click", function(e) {
            var $btnEstadoHuella = $("#btnEstadoHuella");
            var fingerPrint = !activeFingerPrint;

            if (fingerPrint) {
                var password = $("#inputPassword").val();

                if (!password) {
                    alert("Ingresa tu contraseña de IRIS");
                    $("#inputPassword").focus();

                    return false;
                } else {
                    var formData = {
                        grant_type: "password",
                        password: password,
                        userName: User.userName
                    };
                    try {
                        formData.deviceId = deviceId;
                        formData.systemDevice = device.platform;
                    } catch (e) {}

                    $btnEstadoHuella.prop("disabled", true);

                    _this.Login(formData).then(function() {
                        app.verifyFingerprint(false).then(function(r) {
                            if (r) {
                                var encripted = AesCtr.encrypt(JSON.stringify(formData), device.uuid, 256);
                                app.activeFingerPrint = true;
                                localforage.setItem("activeFingerPrint", true);
                                localforage.setItem("activeFingerPrintData", encripted);
                                alert("Listo, tu huella a quedado registrada correctamente.");
                                app.Exit();
                            } else {
                                app.View("huellaDigital");
                            }
                        });
                        $btnEstadoHuella.prop("disabled", false);
                    }, function(err) {
                        $btnEstadoHuella.prop("disabled", false);
                    });

                }
            } else {
                navigator.notification.confirm(
                    '¿Estas seguro que deseas desactivar la huella digital para acceder a tu app de IRIS?',
                    function(r) {
                        if (r === 1) {
                            alert("Listo, tu huella a quedado desactivada.");
                            $("#estadoHuella").html("Desactiva");
                            $("#inputPassword").prop("disabled", true);
                            app.activeFingerPrint = false;
                            localforage.setItem("activeFingerPrint", false);
                            app.View("huellaDigital");
                        }
                    },
                    'Desactiva tu huella digital', ['SI', 'NO']
                );
            }
        });
    },
    Login(data) {
        return $.ajax({
                url: 'https://apikinderiris.azurewebsites.net/token',
                type: 'POST',
                dataType: 'json',
                data: data,
            })
            .fail(function(err) {
                try {
                    if (err.status === 400) {
                        var mensaje = err.responseJSON.error_description;
                        alert(mensaje);
                        app.loading(false);
                    }
                } catch (e) {
                    alert("Por favor revisa tu correo y contraseña. Los campos son sensibles a mayúsculas y minúsculas.");
                    app.loading(false);
                }
            });
    }
}