import Handlebars from "handlebars";

export const getAbsoluteBoundingRect = (el) => {
    var doc = document,
        win = window,
        body = doc.body,

        // pageXOffset and pageYOffset work everywhere except IE <9.
        offsetX = win.pageXOffset !== undefined ? win.pageXOffset :
            (doc.documentElement || body.parentNode || body).scrollLeft,
        offsetY = win.pageYOffset !== undefined ? win.pageYOffset :
            (doc.documentElement || body.parentNode || body).scrollTop,

        rect = el.getBoundingClientRect();

    if (el !== body) {
        var parent = el.parentNode;

        // The element's rect will be affected by the scroll positions of
        // *all* of its scrollable parents, not just the window, so we have
        // to walk up the tree and collect every scroll offset. Good times.
        while (parent !== body) {
            offsetX += parent.scrollLeft;
            offsetY += parent.scrollTop;
            parent = parent.parentNode;
        }
    }

    return {
        bottom: rect.bottom + offsetY,
        height: rect.height,
        left: rect.left + offsetX,
        right: rect.right + offsetX,
        top: rect.top + offsetY,
        width: rect.width
    };
}

export const addHandlebarsHelpers = () => {
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifEqualsNormalize', function (arg1, arg2, options) {
        return (arg1.replaceAll(".", "-").toLowerCase().split(",")[0].replaceAll(" ", "").replaceAll("[", "b").replaceAll("]", "b") == arg2.replaceAll(".", "-").toLowerCase().split(",")[0].replaceAll(" ", "").replaceAll("[", "b").replaceAll("]", "b")) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('isParameterIsEditable', function (arg1, options) {
        return (isParameterIsEditable(arg1)) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('normalize', function (arg1, options) {
        return arg1.replaceAll(".", "-").toLowerCase().split(",")[0].replaceAll(" ", "").replaceAll("[", "b").replaceAll("]", "b");
    });

    Handlebars.registerHelper('isSecretInput', function (arg1, options) {
        if(arg1 == null) return options.inverse(this);
        return arg1.IsSecretInput ? options.fn(this) : options.inverse(this);
    });
}

export const isParameterIsEditable = (type) => {
    const baseType = type.split(",")[0].trim();
    if (baseType == "System.String" ||
    baseType == "System.Decimal" ||
    baseType == "System.Double" ||
        baseType == "System.Int32" ||
        baseType == "System.Int64" ||
        baseType == "System.Boolean") {
        return true;
    }
    return false;
}