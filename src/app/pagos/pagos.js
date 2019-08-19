/**
 *
 * PAGOS
 *
 */
import "./pagos.less";
import $ from 'jquery';
import Enumerable from 'linq';
import localforage from 'localforage';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';
import moment from 'moment';
import html2canvas from 'html2canvas';
import templateHtml from "./pagos.html";
import _detalleOrden from './_detalleOrden.html';
import _comprobantePago from './_comprobantePago.html';

window.html2canvas = html2canvas;

export default {
    RenderData: [],
    OrdenDetalle: [],
    init() {
        this.render();
    },
    async render() {
        var _this = this;
        var Alumnos = await Store.GetStudents();
        var Conceptos = await Store.GetPaymentType();

        var renderData = {
            Alumnos: Alumnos.Data,
            Conceptos: Conceptos.Data
        };

        _this.RenderData = renderData;

        console.log(renderData);

        var renderTpl = Tool.renderTpl(templateHtml, renderData);

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

        $("#frmAgregarDetalleOrden").on("submit", function() {
            var $frm = $(this);
            var formData = $frm.serializeObject();

            formData.NombreAlumno = Enumerable.from(_this.RenderData.Alumnos)
                .where("$.iStudentId == " + formData.Alumno)
                .firstOrDefault()
                .vcName;

            formData.NombreConcepto = Enumerable.from(_this.RenderData.Conceptos)
                .where("$.iTypeId == " + formData.Concepto)
                .firstOrDefault()
                .vcType;


            _this.OrdenDetalle.push(formData);

            $("#cbConceptos option:selected").attr("disabled", true);
            $("#numeroDetallesOrden").html(_this.OrdenDetalle.length);
            $("#cbConceptos, #iMonto").val("");

            console.log(_this.OrdenDetalle);
            return false;
        });

        $("#modalDetalleOrden").on("show.bs.modal", function() {
            var $modalBody = $(this).find(".modal-body");
            var OrdenDetalle = _this.OrdenDetalle;
            var expirationYear = [];

            for (var option = 0; option <= 20; option++) {
                var year = moment().add('years', option).format('YYYY');
                var yearValue = year.substring(2);

                expirationYear.push({
                    'text': year,
                    'value': yearValue
                });
            };

            var renderTpl = Tool.renderTpl(_detalleOrden, {
                Orden: OrdenDetalle,
                TotalOrden: Enumerable.from(OrdenDetalle).sum("+$.Monto"),
                expirationYear: expirationYear
            });

            $modalBody.html(renderTpl);

            $("#btnPagar").on("click", function() {
                var OrdenDetalle = _this.OrdenDetalle;

                if (OrdenDetalle.length <= 0) {
                    alert("Ingresa correctamente la informacion necesaria.");
                } else {
                    var $form = $("#card-form");
                    var tokenParams = {
                        "card": $form.serializeObject()
                    };

                    console.log(tokenParams);

                    Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
                }
            });

            $("#card-form").on("submit", function() {
                return false;
            });
        });


        var successResponseHandler = function(token) {
            var OrdenDetalle = _this.OrdenDetalle;

            var data = {
                "name": $("#iname").val(),
                "email": $("#iemail").val(),
                "phone": $("#iphone").val(),
                "token_id": token.id,
                "unit_price": Enumerable.from(OrdenDetalle).sum("+$.Monto"),
                "student": "1",
                "data": JSON.stringify(OrdenDetalle),
                "comment": $("#icomment").val()
            };

            console.log("successResponseHandler", data);

            Store.SetPayment(data).then(function(r) {
                console.log(r);
                var respuesta = r.Data;
                if (!respuesta.Success) {
                    alert(respuesta.Result);
                } else {
                    var datosComprobante = $.extend(OrdenDetalle, data);

                    datosComprobante.Order = r.Data.Order;
                    datosComprobante.AuthCode = r.Data.AuthCode;


                    console.log(datosComprobante);

                    var renderTpl = Tool.renderTpl(_comprobantePago, datosComprobante);

                    $("#modalDetalleOrden .modal-body").html(renderTpl);

                    $("#btnCompartirOrden").on("click", function() {
                        var $btn = $(this);

                        html2canvas(document.querySelector("#comprobantePago")).then(canvas => {
                            //$("#modalDetalleOrden .modal-body").html(canvas);
                            var base64img = canvas.toDataURL("image/jpeg");

                            console.log(base64img);
                            window.plugins.socialsharing.share(null, 'Comprobante de pago IRIS', base64img, null);
                        });
                    });
                }
            });
        };

        var errorResponseHandler = function(error) {
            console.log(error);
            alert(error.message_to_purchaser);
        };
    }
}