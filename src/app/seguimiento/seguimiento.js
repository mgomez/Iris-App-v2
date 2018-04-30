/**
 *
 * Seguimiento Academico
 *
 */
import "./seguimiento.less";
import $ from 'jquery';
import moment from 'moment';
import Enumerable from 'linq';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import templateHtml from "./seguimiento.tpl.html";
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
        var estudiantes = await Store.GetStudents();
        var fechas = {
            inicio: moment().add(-30, 'days').format('YYYY-MM-DD'),
            fin: moment().format('YYYY-MM-DD')
        }
        console.log(fechas);
        var renderTpl = Tool.renderTpl(templateHtml, {
            estudiantes: estudiantes.Data,
            fechas: fechas
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
                $("#optionsContainer").html(renderTpl)
            });

            return false;
        });
    }
}