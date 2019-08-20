/**
 *
 * Login
 *
 */
import "./login.less";
import $ from 'jquery';
import localforage from 'localforage';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./login.tpl.html";


function validLogin(formData) {
    $(".login-control").removeClass('invalid');

    if (!formData.userName) {
        $("#inputUser").addClass('invalid').focus();
        return false;
    }

    if (!formData.Password) {
        $("#inputPassword").addClass('invalid').focus();
        return false;
    }

    return true;
}

export default {
    cambioHuella: false,
    init(e) {
        console.log("LOGIN", e);
        this.render();
    },
    async render() {
        var UserTemp = await localforage.getItem("UserTemp");

        var renderTpl = Tool.renderTpl(templateHtml, { UserTemp: UserTemp });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;
        if (app.activeFingerPrint) {
            $("#activeFingerPrint").show();

            $("#botonIngresarHuellaDigital").on("click", function() {
                app.verifyFingerprint(true).then(async function(r) {
                    if (r) {
                        var formData = await localforage.getItem("activeFingerPrintData");
                        var decripted = AesCtr.decrypt(formData, device.uuid, 256);
                        var data = JSON.parse(decripted);

                        _this.Login(data).then(async function(user) {
                                app.loading(false);
                                if (user) {
                                    var estudiantes = await Store.GetStudents();
                                    localforage.setItem('User', user);
                                    localforage.setItem('UserTemp', formData.userName);
                                    localforage.setItem("Estudiantes", estudiantes.Data);
                                    localforage.setItem("esUnico", estudiantes.Data.length > 0);


                                    Router.View('main');
                                } else {
                                    alert("Ocurrió un error inesperado. intentalo más tarde.");
                                }
                            },
                            function(err) {
                                alert("Ocurrió un error inesperado. intentalo más tarde.");
                            });
                    }
                });
            });
        }
        //Mostrar contraseña
        $("#mostrarContraseña").on("click", function() {
            var $el = $(this);

            $el.toggleClass('active');

            if ($el.hasClass('active')) {
                $("#inputPassword").attr("type", "text");
            } else {
                $("#inputPassword").attr("type", "password");
            }
        });
        //Acceder
        $("#frm-login").on("submit", function() {
            var formData = $(this).serializeObject();

            if (validLogin(formData)) {
                app.loading(true);

                _this.Login(formData).then(async function(user) {
                    app.loading(false);
                    if (user) {
                        localforage.setItem('User', user);
                        localforage.setItem('UserTemp', formData.userName);
                        var estudiantes = await Store.GetStudents();
                        localforage.setItem("Estudiantes", estudiantes.Data);
                        localforage.setItem("esUnico", estudiantes.Data.length === 1);

                        Router.View('main');
                    } else {
                        alert("Ocurrió un error inesperado. intentalo más tarde.");
                    }
                });
            }
            return false;
        });
        //Solicitar contraseña
        $("#frm-sendMailForgotPassword").on("submit", function() {
            var data = $(this).serializeObject();

            Store.SendMailForgotPassword(data).then(function(r) {
                console.log(r);
                $("#modal-olvideContra .modal-body").html(templateSuccessEmail);
            });
            return false;
        })
    },
    Login(data) {
        return $.ajax({
                url: 'https://apikinderiris.azurewebsites.net/token',
                type: 'POST',
                dataType: 'json',
                data: data,
            })
            .fail(function(err) {
                if (err.status === 400) {
                    var error = err.responseJSON;
                    alert(error.error_description);
                }
                app.loading(false);
            });
    }
}