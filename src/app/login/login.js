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
import AesCtr from "../../assets/js/aes-ctr.js";
import templateHtml from "./login.tpl.html";

//valida el formulario de login
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
        this.render();
    },
    async render() {
        //ultimo usuario que ingreso a la app
        var UserTemp = await localforage.getItem("UserTemp");

        var renderTpl = Tool.renderTpl(templateHtml, { UserTemp: UserTemp });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;
        //quita el margen de renderBody 
        $("#renderBody").css("margin", 0);
        //valida que este activo el login por huella digital
        if (app.activeFingerPrint) {
            $("#activeFingerPrint").show();

            $("#botonIngresarHuellaDigital").on("click", function() {
                app.verifyFingerprint(true).then(async function(r) {
                    if (r) {
                        var formData = await localforage.getItem("activeFingerPrintData");
                        var decripted = AesCtr.decrypt(formData, device.uuid, 256);
                        var data = JSON.parse(decripted);

                        _this.Login(data).then(function(user) {
                                _this.LoginExitoso(user, data);
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
                    _this.LoginExitoso(user, formData);
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
    },
    async LoginExitoso(user, formData) {
        if (user) {
            user.esMaestra = user.role === "Teacher";
            user.esAdmin = user.role === "Administrator";

            localforage.setItem('User', user);
            localforage.setItem('UserTemp', formData.userName);

            var estudiantes = await Store.GetStudents();

            localforage.setItem("Estudiantes", estudiantes.Data);
            localforage.setItem("esUnico", estudiantes.Data.length === 1);

            Router.View('main');
        } else {
            alert("Ocurrió un error inesperado. intentalo más tarde.");
        }
    }
}