'use strict';
import Handlebars from 'handlebars';
import currencyFormatter from 'currency-formatter';

Handlebars.registerHelper('currency', function(value, options) {
    var format = currencyFormatter.format(value, { code: 'USD' });

    return format;
});

export default {
    bindEvents(events) {
        for (let i = 0, l = events.length; i < l; i++) {
            if (!events[i].element) {
                $(events[i].target).on(events[i].event, events[i].handler)
            } else {
                $(events[i].element).on(events[i].event, events[i].target, events[i].handler)
            }
        }
    },
    renderTpl(source, data) {
        var template = Handlebars.compile(source);

        return template(data);
    }
}