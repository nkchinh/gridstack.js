// utils.ts 2.0.2 @preserve
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/** checks for obsolete method names */
export function obsolete(self, f, oldName, newName, rev) {
    var wrapper = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn('gridstack.js: Function `' + oldName + '` is deprecated in ' + rev + ' and has been replaced ' +
            'with `' + newName + '`. It will be **completely** removed in v1.0');
        return f.apply(self, args);
    };
    wrapper.prototype = f.prototype;
    return wrapper;
}
/** checks for obsolete grid options (can be used for any fields, but msg is about options) */
export function obsoleteOpts(opts, oldName, newName, rev) {
    if (opts[oldName] !== undefined) {
        opts[newName] = opts[oldName];
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **completely** removed in v1.0');
    }
}
/** checks for obsolete grid options which are gone */
export function obsoleteOptsDel(opts, oldName, rev, info) {
    if (opts[oldName] !== undefined) {
        console.warn('gridstack.js: Option `' + oldName + '` is deprecated in ' + rev + info);
    }
}
/** checks for obsolete Jquery element attributes */
export function obsoleteAttr(el, oldName, newName, rev) {
    var oldAttr = el.getAttribute(oldName);
    if (oldAttr !== null) {
        el.setAttribute(newName, oldAttr);
        console.warn('gridstack.js: attribute `' + oldName + '`=' + oldAttr + ' is deprecated on this object in ' + rev + ' and has been replaced with `' +
            newName + '`. It will be **completely** removed in v1.0');
    }
}
/**
 * Utility methods
 */
var Utils = /** @class */ (function () {
    function Utils() {
    }
    /** returns true if a and b overlap */
    Utils.isIntercepted = function (a, b) {
        return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    };
    /**
     * Sorts array of nodes
     * @param nodes array to sort
     * @param dir 1 for asc, -1 for desc (optional)
     * @param width width of the grid. If undefined the width will be calculated automatically (optional).
     **/
    Utils.sort = function (nodes, dir, column) {
        if (!column) {
            var widths = nodes.map(function (n) { return n.x + n.width; });
            column = Math.max.apply(Math, widths);
        }
        if (dir === -1)
            return nodes.sort(function (a, b) { return (b.x + b.y * column) - (a.x + a.y * column); });
        else
            return nodes.sort(function (b, a) { return (b.x + b.y * column) - (a.x + a.y * column); });
    };
    /**
     * creates a style sheet with style id under given parent
     * @param id will set the 'data-gs-style-id' attribute to that id
     * @param parent to insert the stylesheet as first child,
     * if none supplied it will be appended to the document head instead.
     */
    Utils.createStylesheet = function (id, parent) {
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('data-gs-style-id', id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (style.styleSheet) { // TODO: only CSSImportRule have that and different beast ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style.styleSheet.cssText = '';
        }
        else {
            style.appendChild(document.createTextNode('')); // WebKit hack
        }
        if (!parent) {
            // default to head
            parent = document.getElementsByTagName('head')[0];
            parent.appendChild(style);
        }
        else {
            parent.insertBefore(style, parent.firstChild);
        }
        return style.sheet;
    };
    /** removed the given stylesheet id */
    Utils.removeStylesheet = function (id) {
        var el = document.querySelector('STYLE[data-gs-style-id=' + id + ']');
        if (!el || !el.parentNode)
            return;
        el.parentNode.removeChild(el);
    };
    /** inserts a CSS rule */
    Utils.addCSSRule = function (sheet, selector, rules) {
        if (typeof sheet.addRule === 'function') {
            sheet.addRule(selector, rules);
        }
        else if (typeof sheet.insertRule === 'function') {
            sheet.insertRule(selector + "{" + rules + "}");
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Utils.toBool = function (v) {
        if (typeof v === 'boolean') {
            return v;
        }
        if (typeof v === 'string') {
            v = v.toLowerCase();
            return !(v === '' || v === 'no' || v === 'false' || v === '0');
        }
        return Boolean(v);
    };
    Utils.toNumber = function (value) {
        return (value === null || value.length === 0) ? null : Number(value);
    };
    Utils.parseHeight = function (val) {
        var height;
        var heightUnit = 'px';
        if (typeof val === 'string') {
            var match = val.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%)?$/);
            if (!match) {
                throw new Error('Invalid height');
            }
            heightUnit = match[2] || 'px';
            height = parseFloat(match[1]);
        }
        else {
            height = val;
        }
        return { height: height, unit: heightUnit };
    };
    /** copies unset fields in target to use the given default sources values */
    Utils.defaults = function (target) {
        var _this = this;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            for (var key in source) {
                if (!source.hasOwnProperty(key)) {
                    return;
                }
                if (target[key] === null || target[key] === undefined) {
                    target[key] = source[key];
                }
                else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                    // property is an object, recursively add it's field over... #1373
                    _this.defaults(target[key], source[key]);
                }
            }
        });
        return target;
    };
    /** makes a shallow copy of the passed json struct */
    Utils.clone = function (target) {
        return __assign({}, target); // was $.extend({}, target)
    };
    /** return the closest parent matching the given class */
    Utils.closestByClass = function (el, name) {
        el = el.parentElement;
        if (!el)
            return null;
        if (el.classList.contains(name))
            return el;
        return Utils.closestByClass(el, name);
    };
    /** @internal */
    Utils.throttle = function (callback, delay) {
        var _this = this;
        var isWaiting = false;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!isWaiting) {
                callback.apply(_this, args);
                isWaiting = true;
                setTimeout(function () { return isWaiting = false; }, delay);
            }
        };
    };
    Utils.removePositioningStyles = function (el) {
        var style = el.style;
        if (style.position) {
            style.removeProperty('position');
        }
        if (style.left) {
            style.removeProperty('left');
        }
        if (style.top) {
            style.removeProperty('top');
        }
        if (style.width) {
            style.removeProperty('width');
        }
        if (style.height) {
            style.removeProperty('height');
        }
    };
    /** @internal */
    Utils.getScrollParent = function (el) {
        var returnEl;
        if (el === null) {
            returnEl = null;
        }
        else if (el.scrollHeight > el.clientHeight) {
            returnEl = el;
        }
        else {
            returnEl = this.getScrollParent(el.parentElement);
        }
        return returnEl;
    };
    /** @internal */
    Utils.updateScrollPosition = function (el, position, distance) {
        // is widget in view?
        var rect = el.getBoundingClientRect();
        var innerHeightOrClientHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (rect.top < 0 ||
            rect.bottom > innerHeightOrClientHeight) {
            // set scrollTop of first parent that scrolls
            // if parent is larger than el, set as low as possible
            // to get entire widget on screen
            var offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            var offsetDiffUp = rect.top;
            var scrollEl = this.getScrollParent(el);
            if (scrollEl !== null) {
                var prevScroll = scrollEl.scrollTop;
                if (rect.top < 0 && distance < 0) {
                    // moving up
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                    }
                }
                else if (distance > 0) {
                    // moving down
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    }
                    else {
                        scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                    }
                }
                // move widget y by amount scrolled
                position.top += scrollEl.scrollTop - prevScroll;
            }
        }
    };
    return Utils;
}());
export { Utils };
//# sourceMappingURL=utils.js.map