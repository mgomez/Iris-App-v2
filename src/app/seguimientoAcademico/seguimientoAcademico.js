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
import notie from 'notie';
import templateHtml from "./seguimientoAcademico.tpl.html";
import _optionsTpl from './_optionsTpl.html';
import __setOptions from './_SetOptions.html';
import _seguimientoAcademicoCatalog from './_seguimientoAcademico-catalog.html';

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
    init() {
        this.render();
    },
    async render() {
        var _this = this;
        var Estudiantes = await localforage.getItem("Estudiantes");
        var GetDates = await Store.GetDates();

        var renderTpl = Tool.renderTpl(templateHtml, {
            Estudiantes: Estudiantes,
            Fechas: GetDates.Data
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
                var Options = r.Data;
                var renderTpl = "";

                if (!Options) {
                    alert("No se encontraron resultados.");
                } else {
                    var _options = renderOptions(Options);

                    _options = $.extend(_options, formData);

                    console.log(_options);

                    renderTpl = Tool.renderTpl(_optionsTpl, _options);

                    $("#optionsContainer").html(renderTpl);
                }

                $("#optionsContainer").html(renderTpl);

                $('html, body').animate({
                    scrollTop: $("#optionsContainer").offset().top
                }, 1300);
                _this.eventosEvaluacion();
            });

            return false;
        });
    },
    eventosEvaluacion() {
        //agrega la clase 'active' si no se ha configurado antes una evaluación
        if ($(".Options-option-face.active").length === 0) {
            $(".Options-option-face.smile").addClass('active');
        }
        //funcionalidad de las caritas
        $(".Options-option-face").on("click", function() {
            var $btn = $(this);
            var $container = $btn.parent(".Options-option-faces");

            var id = $btn.data("id");

            $container.find(".Options-option-face").removeClass('active');
            $btn.addClass('active');

            console.log(id);
        });
        //guarda la informacion de la evaluacion
        $(".frmSetOption").on("submit", function() {
            var $frm = $(this);
            var formData = $frm.serializeObject();

            var $vcValues = $(".Options-option-faces");
            var vcValues = Enumerable.from($vcValues).select(function(el) {
                var iCatalogId = $(el).data("catalog");
                var carita = $(el).find(".active").data("id");

                return iCatalogId + "-" + carita;
            }).toArray();

            vcValues = vcValues.join("|");

            formData.vcValues = vcValues;

            console.log(formData);

            Store.SetOptions(formData).then(function(r) {
                if (!r.Data.Success) {
                    notie.alert({
                        type: 'error',
                        text: r.Data.Result,
                        position: 'top'
                    });
                } else {
                    notie.alert({
                        type: 'success',
                        text: "Se agrego guardo correctamente la informacion.",
                        position: 'top'
                    });

                    app.View("seguimientoAcademico");
                }
            });

            return false;
        });
    }
}