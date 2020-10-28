// gridstack-dd.ts 2.0.2 @preserve
/**
 * Base class for drag'n'drop plugin.
 */
var GridStackDD = /** @class */ (function () {
    function GridStackDD(grid) {
        this.grid = grid;
    }
    /** call this method to register your plugin instead of the default no-op one */
    GridStackDD.registerPlugin = function (pluginClass) {
        GridStackDD.registeredPlugins.push(pluginClass);
    };
    /** get the current registered plugin to use */
    GridStackDD.get = function () {
        return GridStackDD.registeredPlugins[0] || GridStackDD;
    };
    /** removes any drag&drop present (called during destroy) */
    GridStackDD.prototype.remove = function (el) {
        this.draggable(el, 'destroy').resizable(el, 'destroy');
        if (el.gridstackNode) {
            delete el.gridstackNode._initDD; // reset our DD init flag
        }
        return this;
    };
    GridStackDD.prototype.resizable = function (el, opts, key, value) {
        return this;
    };
    GridStackDD.prototype.draggable = function (el, opts, key, value) {
        return this;
    };
    GridStackDD.prototype.dragIn = function (el, opts) {
        return this;
    };
    GridStackDD.prototype.isDraggable = function (el) {
        return false;
    };
    GridStackDD.prototype.droppable = function (el, opts, key, value) {
        return this;
    };
    GridStackDD.prototype.isDroppable = function (el) {
        return false;
    };
    GridStackDD.prototype.on = function (el, eventName, callback) {
        return this;
    };
    GridStackDD.prototype.off = function (el, eventName) {
        return this;
    };
    GridStackDD.registeredPlugins = [];
    return GridStackDD;
}());
export { GridStackDD };
//# sourceMappingURL=gridstack-dd.js.map