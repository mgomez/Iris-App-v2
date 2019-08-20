/**
 *
 * Seguimiento Academico
 *
 */
import "./seguimientoAcademico.less";
import $ from 'jquery';
import moment from 'moment';
import Enumerable from 'linq';
import localforage from 'localforage';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./seguimientoAcademico.tpl.html";
import _optionsTpl from './_optionsTpl.html';

function renderOptions(options) {
    var _options = Enumerable.from(options).groupBy("$.dtDate").select(function(el) {
        var fecha = moment(el.key()).format('LL');

        return {
            fecha: fecha,
            options: el.getSource(),
            nota: el.getSource()[0].vcNote
        };
    }).orderByDescending("$.fecha").toArray();

    return _options;
}

export default {
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

        var renderTpl = Tool.renderTpl(templateHtml, {
            Estudiantes: Estudiantes,
            Fechas: GetDates.Data,
            esUnico: esUnico,
            iStudentId: iStudentId
        });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

        moment.locale('es');

        $("#frm-getOptions").on("submit", function() {
            var formData = $(this).serializeObject();

            Store.GetOptions(formData).then(function(r) {
                console.log(r);
                var Options = r.Data;
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
            });

            return false;
        });
    }
}