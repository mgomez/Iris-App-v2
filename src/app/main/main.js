/**
 *
 * Main
 *
 */
import "./main.less";
import $ from 'jquery';
import localforage from 'localforage';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./main.tpl.html";

export default {
    init() {
        this.render();
    },
    async render() {
        var User = await localforage.getItem("User");

        var renderTpl = Tool.renderTpl(templateHtml, { User: User });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

    }
}