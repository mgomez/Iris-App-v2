'use strict';
import $ from 'jquery';
import localforage from 'localforage';
import Tool from './utils/tool';
import Store from './store';

//views
import layout from "./shared/layout.tpl.html";
import layoutLogin from "./shared/layoutLogin.tpl.html";
import offlineTpl from "./shared/offline.tpl.html";

export default {
    async View(page, _default) {
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

        renderTpl = Tool.renderTpl(renderTpl);

        $("#app").html(renderTpl);

        switch (page) {
            default: main.init(page);
            break;
        }
    }
};