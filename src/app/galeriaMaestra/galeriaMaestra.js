/**
 *
 * Galeria (Maestra)
 *
 */
import './galeriaMaestra.less';
import templateHtml from './galeriaMaestra.tpl.html';
import $ from 'jquery';
import moment from 'moment';
import Enumerable from 'linq';
import Tool from '../utils/tool';
import Router from '../router';
import Store from '../store';

export default {
    init() {
        this.render();
    },
    async render() {
        var Estudiantes = await Store.GetStudents();

        var renderTpl = Tool.renderTpl(templateHtml, {
            Estudiantes: Estudiantes.Data
        });

        $("#renderBody").html(renderTpl);

        this.handleEvents();
    },
    handleEvents() {
        var _this = this;

        $("#btn-takePhoto").on("click", function() {
            app.takePhoto(function() {
                $("#studentImage-b64").val(imageData);
                $("#studentImage-img").attr("src", "data:image/jpeg;base64," + imageData);
                $(".GaleriaMaestra-preview").show();
            }, function() {
                alert("Error al procesar la imagen.");
            });
        });

        $("#frm-setImage").on("submit", function() {
            var $frm = $(this);
            var formData = $frm.serializeObject();

            Store.SetImage(formData).then(function(r) {
                console.log(r);
            });
            return false;
        });
    }
}