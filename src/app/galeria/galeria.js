/**
 *
 * Galeria
 *
 */
import "./galeria.less";
import 'swiper/dist/css/swiper.css';
import $ from 'jquery';
import Swiper from "swiper";
import localforage from 'localforage';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./galeria.tpl.html";

export default {
    init() {
        this.render();
    },
    async render() {
        var Galeria = await Store.GetImages({
            iType: 1,
            dtIni: '1900-01-01',
            dtEnd: '1900-01-01',
            iStudentId: 7
        });

        var renderTpl = Tool.renderTpl(templateHtml, Galeria.Data);

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

        var mySwiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            autoHeight: true,
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar'
            },
        });

        $(".Galeria-slide-check").on("click", function() {
            var $btn = $(this);
            var data = {
                iType: $btn.data("type"),
                iImageId: $btn.data("image"),
                iStudentId: $btn.data("student")
            };

            console.log(data);
        });
    }
}