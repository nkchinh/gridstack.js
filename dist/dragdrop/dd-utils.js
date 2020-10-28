// dd-utils.ts 2.0.2 @preserve
/**
 * https://gridstackjs.com/
 * (c) 2020 Alain Dumesny, rhlin
 * gridstack.js may be freely distributed under the MIT license.
*/
var DDUtils = /** @class */ (function () {
    function DDUtils() {
    }
    DDUtils.clone = function (el) {
        var node = el.cloneNode(true);
        node.removeAttribute('id');
        return node;
    };
    DDUtils.appendTo = function (el, parent) {
        var parentNode;
        if (typeof parent === 'string') {
            parentNode = document.querySelector(parent);
        }
        else {
            parentNode = parent;
        }
        if (parentNode) {
            parentNode.append(el);
        }
    };
    DDUtils.setPositionRelative = function (el) {
        if (!(/^(?:r|a|f)/).test(window.getComputedStyle(el).position)) {
            el.style.position = "relative";
        }
    };
    DDUtils.throttle = function (callback, delay) {
        var isWaiting = false;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!isWaiting) {
                callback.apply(void 0, args);
                isWaiting = true;
                setTimeout(function () { return isWaiting = false; }, delay);
            }
        };
    };
    DDUtils.addElStyles = function (el, styles) {
        if (styles instanceof Object) {
            var _loop_1 = function (s) {
                if (styles.hasOwnProperty(s)) {
                    if (Array.isArray(styles[s])) {
                        // support fallback value
                        styles[s].forEach(function (val) {
                            el.style[s] = val;
                        });
                    }
                    else {
                        el.style[s] = styles[s];
                    }
                }
            };
            for (var s in styles) {
                _loop_1(s);
            }
        }
    };
    DDUtils.copyProps = function (dst, src, props) {
        for (var i = 0; i < props.length; i++) {
            var p = props[i];
            dst[p] = src[p];
        }
    };
    DDUtils.initEvent = function (e, info) {
        var kbdProps = 'altKey,ctrlKey,metaKey,shiftKey'.split(',');
        var ptProps = 'pageX,pageY,clientX,clientY,screenX,screenY'.split(',');
        var evt = { type: info.type };
        var obj = {
            button: 0,
            which: 0,
            buttons: 1,
            bubbles: true,
            cancelable: true,
            originEvent: e,
            target: info.target ? info.target : e.target
        };
        if (e instanceof DragEvent) {
            Object.assign(obj, { dataTransfer: e.dataTransfer });
        }
        DDUtils.copyProps(evt, e, kbdProps);
        DDUtils.copyProps(evt, e, ptProps);
        DDUtils.copyProps(evt, obj, Object.keys(obj));
        return evt;
    };
    return DDUtils;
}());
export { DDUtils };
//# sourceMappingURL=dd-utils.js.map