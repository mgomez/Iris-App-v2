/**
 *
 * Seguimiento Academico
 *
 */
import "./seguimiento.less";
import $ from 'jquery';
import moment from 'moment';
import Enumerable from 'linq';
import localforage from 'localforage';
import html2canvas from 'html2canvas';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./seguimiento.tpl.html";
import _optionsTpl from './_optionsTpl.html';

function renderOptions(options) {
    var _options = Enumerable.from(options)
        .groupBy("$.dtDate")
        .select(function(el) {
            var fecha = moment(el.key()).format('dddd DD MMM');

            return {
                fecha: fecha,
                options: el.getSource(),
                nota: el.getSource()[0].vcNote,
                sort: moment(el.key()).format('YYYYMMDD')
            };
        })
        .orderByDescending("$.sort")
        .toArray();

    return _options;
}

export default {
    Options: [],
    init() {
        this.render();
    },
    async render() {
        var _this = this;
        var Estudiantes = await localforage.getItem("Estudiantes");
        var esUnico = await localforage.getItem("esUnico");
        var GetDates = await Store.GetDates();
        var GetOptions = [];
        var iStudentId = 0;

        if (esUnico) {
            var iDateId = GetDates.Data[0].iDateId;

            iStudentId = Estudiantes[0].iStudentId;

            GetOptions = await Store.GetOptions({
                iType: 1,
                iStudentId: iStudentId,
                iDateId: iDateId
            });

            var Options = GetOptions.Data;

            _this.Options = Options;
        }

        var handleData = {
            Estudiantes: Estudiantes,
            Fechas: GetDates.Data,
            esUnico: esUnico,
            iStudentId: iStudentId
        };

        var renderTpl = Tool.renderTpl(templateHtml, handleData);

        $("#renderBody").html(renderTpl);

        this.handleEvents(handleData);
    },
    handleEvents(handleData) {
        var _this = this;

        moment.locale('es');

        if (handleData.esUnico) {
            _this.cargaOptions();
        }

        $("#frm-getOptions").on("submit", async function(e) {
            e.preventDefault();

            var formData = $(this).serializeObject();

            var Options = await Store.GetOptions(formData);

            _this.Options = Options.Data;

            _this.cargaOptions();

            return false;
        });
    },
    cargaOptions() {
        var _this = this;
        var Options = _this.Options;
        var renderTpl = "";

        if (!Options) {
            alert("No se encontraron resultados.");
        } else {
            var _options = renderOptions(Options);

            renderTpl = Tool.renderTpl(_optionsTpl, _options);

            $("#optionsContainer").html(renderTpl);
        }

        $("#optionsContainer").html(renderTpl);

        $('html, body').animate({
            scrollTop: $("#optionsContainer").offset().top
        }, 1300);

        _this.eventosCalificaciones();
    },
    eventosCalificaciones() {
        $(".btnCompartir").on("click", function() {
            var $btn = $(this);
            var $container = $btn.parent(".Options-container");

            app.loading(true);

            html2canvas($container[0]).then(canvas => {
                var base64img = canvas.toDataURL("image/jpeg");

                console.log(base64img);
                try {
                    window.plugins.socialsharing.share(null, 'Seguimiento Academico', base64img, null);
                    app.loading(false);
                } catch (e) {
                    app.loading(false);
                    alert("No disponible.");
                    console.log(e);
                }
            });
        });
    },

}