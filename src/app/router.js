/**
 *
 * ROUTER
 *
 */

'use strict';
import $ from 'jquery';
import localforage from 'localforage';
import Tool from './utils/tool';
import Store from './store';
import notie from 'notie';

//views
import layout from "./shared/layout.tpl.html";
import layoutLogin from "./shared/layoutLogin.tpl.html";
import offlineTpl from "./shared/offline.tpl.html";

import loginModule from './login/login';
import mainModule from './main/main';
import galeriaModule from './galeria/galeria';
import seguimientoModule from './seguimiento/seguimiento';
import galeriaMaestraModule from './galeriaMaestra/galeriaMaestra';
import huellaDigital from "./huellaDigital/huellaDigital";
import pagos from "./pagos/pagos";
import seguimientoAcademico from "./seguimientoAcademico/seguimientoAcademico";


export default {
    async View(page, _default) {
        app.loading(true);
        var renderTpl = "";
        var User = await Store.GetUser();

        localforage.setItem("lastView", {
            page: page,
            layout: layout
        });
        //valido que este conectado a una red
        if (!window.Connection) {
            renderTpl = Tool.renderTpl(layoutLogin);

            $("#app").html(renderTpl);
            $("#renderBody").html(offlineTpl);
            return;
        }
        //cargo el layout
        renderTpl = (!_default) ? layout : layoutLogin;

        console.log("User", User);
        renderTpl = Tool.renderTpl(renderTpl, User);

        $("#app").html(renderTpl);

        //formulario Feedback
        $("#fmr-SetSuggestion").on("submit", function() {
            var $frm = $(this);
            var formData = $frm.serializeObject();

            console.log(formData);

            Store.SetSuggestion(formData).then(function(r) {
                notie.alert({
                    type: 'success',
                    text: "Muchas gracias por el feedback recibido.",
                    position: 'top'
                });
                $frm[0].reset();
                $("#modalFeedback").modal("hide");
            });

            return false;
        });

        switch (page) {
            case 'main':
                mainModule.init();
                break;
            case 'galeria':
                galeriaModule.init();
                break;
            case 'seguimiento':
                seguimientoModule.init();
                break;
            case 'galeriaMaestra':
                galeriaMaestraModule.init();
                break;
            case 'huellaDigital':
                huellaDigital.init();
                break;
            case 'pagos':
                pagos.init();
                break;
            case 'seguimientoAcademico':
                seguimientoAcademico.init();
                break;
            default:
                loginModule.init(page);
                break;
        }

        app.loading(false);
    }
};