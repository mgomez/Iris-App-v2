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
import _galeriaSwiper from './_galeriaSwiper.html';

export default {
    Dates: [],
    init() {
        this.render();
    },
    async render() {
        var _this = this;
        var Estudiantes = await localforage.getItem("Estudiantes");
        var esUnico = await localforage.getItem("esUnico");
        var GetDates = await Store.GetDates();
        var Galeria = [];
        var iStudentId = 0;

        if (esUnico) {
            var iDateId = GetDates.Data[0].iDateId;

            iStudentId = Estudiantes[0].iStudentId;

            Galeria = await Store.GetImages({
                iType: 2,
                iStudentId: iStudentId,
                iDateId: iDateId
            });

            Galeria = Galeria.Data;

            _this.Galeria = Galeria;
        }

        _this.Dates = GetDates.Data;

        var handleData = {
            Galeria: Galeria,
            Fechas: GetDates.Data,
            Estudiantes: Estudiantes,
            esUnico: esUnico,
            iStudentId: iStudentId
        };

        var renderTpl = Tool.renderTpl(templateHtml, handleData);

        $("#renderBody").html(renderTpl);

        this.handleEvents(handleData);
    },
    handleEvents(handleData) {
        var _this = this;

        if (handleData.esUnico) {
            _this.cargaGaleriaSwiper();
        }

        $("#frmGetImages").on("submit", async function(e) {
            e.preventDefault();

            var $frm = $(this);
            var formData = $frm.serializeObject();

            var Galeria = await Store.GetImages(formData);

            _this.Galeria = Galeria.Data;
            _this.cargaGaleriaSwiper();

        });
    },
    cargaGaleriaSwiper() {
        var _this = this;

        var Galeria = _this.Galeria;

        var renderTpl = Tool.renderTpl(_galeriaSwiper, {
            Galeria: Galeria
        });

        $("#galeriaSwiper").html(renderTpl);

        var mySwiper = new Swiper('.swiper-container', {
            autoHeight: true,
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar'
            },
        });

        $(".socialsharing").on("click", function() {
            var url = $(this).data("url");
            var titulo = $(this).data("titulo");
            try {
                window.plugins.socialsharing.share(titulo, null, url, null);
            } catch (e) {
                alert("No disponible.");
                console.log(e);
            }
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