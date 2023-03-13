!(function(global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(global.jQuery, global);
    }

}(this, function($, global) {
    'use strict';

    var win = window;
    var doc = document;
    var docEl = doc.documentElement;

    var defaults = {
        width: 500,
        height: 400,
        offsetX: 0,
        offsetY: 0,
        zIndex: 999,
        closeBtnClass: 'popup-close'
    };

    var extend = function(to, from) {
        for (var p in from) {
            if (from.hasOwnProperty(p)) {
                to[p] = from[p];
            }
        }
        return to;
    };

    var winW = function() {
        return win.innerWidth || docEl.clientWidth;
    };

    var winH = function() {
        return win.innerHeight || docEl.clientHeight;
    };

    var scrollX = function() {
        return win.pageXOffset || docEl.scrollLeft;
    };

    var scrollY = function() {
        return win.pageYOffset || docEl.scrollTop;
    };

    var byClass = function(cls, el) {
        el = el || doc;
        if (el.getElementsByClassName) {
            return el.getElementsByClassName(cls);
        } else {
            var ret = [];
            var re = new RegExp('^|\\s+' + cls + '\\s+|$');
            var tags = el.getElementsByTagName('*');

            for (var i = 0, len = tags.length; i < len; i++) {
                if (re.test(tags[i].className)) {
                ret.push(tags[i]);
                }
            }
            return ret;
        }
    };

    var bind = function(el, type, listener) {
        if (el.addEventListener) {
            el.addEventListener(type, listener, false);
        } else {
            el.attachEvent('on' + type, listener);
        }
    };


    function Popup(el, opts) {
        if (!(this instanceof Popup)) {
            return new Popup(el, opts);
        }
        this.opts = extend({}, extend(defaults, opts));
        this.el = el;
        this.init();
    }

    extend(Popup.prototype, {

        init: function() {
            var opts = this.opts;

            extend(this.el.style, {
                position: 'absolute',
                width: opts.width + 'px',
                height: opts.height + 'px',
                zIndex: opts.zIndex
            });
        document.getElementById("popup-header").innerText = opts.header;
        document.getElementById("popup-body").innerHTML = opts.body;
        //document.getElementById("popup-footer").innerHTML = opts.footer;

        this.bindEvent();
        },

        bindEvent: function() {
            var closeBtn = byClass(this.opts.closeBtnClass)[0];
            var self = this;

            bind(closeBtn, 'click', function() {
                self.close();
            });

            bind(doc, 'keydown', function(e) {
                e = e || window.event;
                var keyCode = e.which || e.keyCode;

                if (keyCode === 27) {
                    self.close();
                }
            });

            bind(win, 'resize', function() {
                self.setPosition();
            });
        },

        open: function() {
            this.el.style.display = 'block';
            this.setPosition();
        },
 
        close: function() {
            this.el.style.display = 'none';
        },

        setPosition: function() {
            var opts = this.opts;

            var top = scrollY() + Math.max(0, (winH() - opts.height) / 2);
            var left = scrollX() + Math.max(0, (winW() - opts.width) / 2);

            extend(this.el.style, {
                top: top + opts.offsetY + 'px',
                left: left + opts.offsetX + 'px'
            });
        }
    });

    if ($ && $.fn) {
        $.fn.popup = function(opts) {
            var popups = [];
            this.each(function(i, el) {
                popups.push(new Popup(el, opts));
            });

            return {
                open: function() {
                    $.each(popups, function(i, popup) {
                        popup.open();
                    });
                },
                close: function() {
                    $.each(popups, function(i, popup) {
                        popup.close();
                    });
                }
            };
        };
    } else if (global) {
        global.Popup = Popup;
    }

    return Popup;

}));
