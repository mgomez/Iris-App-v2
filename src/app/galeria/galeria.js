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
    Dates: [],
    init() {
        this.render();
    },
    async render() {
        var _this = this;
        var GetDates = await Store.GetDates();

        var Galeria = await Store.GetImages({
            iType: 2,
            iDateId: 49,
            iStudentId: 2
        });

        _this.Dates = GetDates.Data;


        var renderTpl = Tool.renderTpl(templateHtml, {
            Galeria: Galeria.Data,
            Fechas: GetDates.Data
        });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

        $("#frmGetImages").on("submit", async function() {
            var $frm = $(this);
            var formData = $frm.serializeObject();

            var Galeria = await Store.GetImages(formData);


            var renderTpl = Tool.renderTpl(templateHtml, {
                Galeria: Galeria.Data,
                Fechas: _this.Dates
            });

            $("#renderBody").html(renderTpl);

            return false;
        });

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
            var $slide = $btn.parent(".Galeria-slide");
            var data = {
                iType: $btn.data("type"),
                iImageId: $btn.data("image"),
                iStudentId: $btn.data("student")
            };

            Store.SetImage(data).then(function(r) {
                app.View('galeria');
            });
        });
    }
}