// gridstack-dd-jqueryui.ts 2.0.2 @preserve
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { GridStackDD } from '../gridstack-dd';
// TODO: TEMPORARY until can remove jquery-ui drag&drop and this class and use HTML5 instead !
// see https://stackoverflow.com/questions/35345760/importing-jqueryui-with-typescript-and-requirejs
import * as $ from './jquery';
export { $ };
export * from './jquery-ui';
/**
 * Jquery-ui based drag'n'drop plugin.
 */
var GridStackDDJQueryUI = /** @class */ (function (_super) {
    __extends(GridStackDDJQueryUI, _super);
    function GridStackDDJQueryUI(grid) {
        return _super.call(this, grid) || this;
    }
    GridStackDDJQueryUI.prototype.resizable = function (el, opts, key, value) {
        var $el = $(el);
        if (opts === 'enable') {
            $el.resizable().resizable(opts);
        }
        else if (opts === 'disable' || opts === 'destroy') {
            if ($el.data('ui-resizable')) { // error to call destroy if not there
                $el.resizable(opts);
            }
        }
        else if (opts === 'option') {
            $el.resizable(opts, key, value);
        }
        else {
            var handles = $el.data('gs-resize-handles') ? $el.data('gs-resize-handles') : this.grid.opts.resizable.handles;
            $el.resizable(__assign({}, this.grid.opts.resizable, { handles: handles }, {
                start: opts.start,
                stop: opts.stop,
                resize: opts.resize // || function() {}
            }));
        }
        return this;
    };
    GridStackDDJQueryUI.prototype.draggable = function (el, opts, key, value) {
        var $el = $(el);
        if (opts === 'enable') {
            $el.draggable().draggable('enable');
        }
        else if (opts === 'disable' || opts === 'destroy') {
            if ($el.data('ui-draggable')) { // error to call destroy if not there
                $el.draggable(opts);
            }
        }
        else if (opts === 'option') {
            $el.draggable(opts, key, value);
        }
        else {
            $el.draggable(__assign({}, this.grid.opts.draggable, {
                containment: (this.grid.opts._isNested && !this.grid.opts.dragOut) ?
                    $(this.grid.el).parent() : (this.grid.opts.draggable.containment || null),
                start: opts.start,
                stop: opts.stop,
                drag: opts.drag // || function() {}
            }));
        }
        return this;
    };
    GridStackDDJQueryUI.prototype.dragIn = function (el, opts) {
        var $el = $(el); // workaround Type 'string' is not assignable to type 'PlainObject<any>' - see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/29312
        $el.draggable(opts);
        return this;
    };
    GridStackDDJQueryUI.prototype.droppable = function (el, opts, key, value) {
        var $el = $(el);
        if (typeof opts.accept === 'function' && !opts._accept) {
            // convert jquery event to generic element
            opts._accept = opts.accept;
            opts.accept = function ($el) { return opts._accept($el.get(0)); };
        }
        $el.droppable(opts, key, value);
        return this;
    };
    GridStackDDJQueryUI.prototype.isDroppable = function (el) {
        var $el = $(el);
        return Boolean($el.data('ui-droppable'));
    };
    GridStackDDJQueryUI.prototype.isDraggable = function (el) {
        var $el = $(el); // workaround Type 'string' is not assignable to type 'PlainObject<any>' - see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/29312
        return Boolean($el.data('ui-draggable'));
    };
    GridStackDDJQueryUI.prototype.on = function (el, name, callback) {
        var $el = $(el);
        $el.on(name, function (event, ui) { callback(event, ui.draggable ? ui.draggable[0] : event.target, ui.helper ? ui.helper[0] : null); });
        return this;
    };
    GridStackDDJQueryUI.prototype.off = function (el, name) {
        var $el = $(el);
        $el.off(name);
        return this;
    };
    return GridStackDDJQueryUI;
}(GridStackDD));
export { GridStackDDJQueryUI };
// finally register ourself
GridStackDD.registerPlugin(GridStackDDJQueryUI);
//# sourceMappingURL=gridstack-dd-jqueryui.js.map