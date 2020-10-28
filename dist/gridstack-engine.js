// gridstack-engine.ts 2.0.2 @preserve
/**
 * https://gridstackjs.com/
 * (c) 2014-2020 Alain Dumesny, Dylan Weiss, Pavel Reznikov
 * gridstack.js may be freely distributed under the MIT license.
*/
import { Utils, obsolete } from './utils';
/**
 * Defines the GridStack engine that does most no DOM grid manipulation.
 * See GridStack methods and vars for descriptions.
 *
 * NOTE: values should not be modified directly - call the main GridStack API instead
 */
var GridStackEngine = /** @class */ (function () {
    function GridStackEngine(column, onchange, float, maxRow, nodes) {
        if (column === void 0) { column = 12; }
        if (float === void 0) { float = false; }
        if (maxRow === void 0) { maxRow = 0; }
        if (nodes === void 0) { nodes = []; }
        this.addedNodes = [];
        this.removedNodes = [];
        /** @internal legacy method renames */
        this.getGridHeight = obsolete(this, GridStackEngine.prototype.getRow, 'getGridHeight', 'getRow', 'v1.0.0');
        this.column = column;
        this.onchange = onchange;
        this._float = float;
        this.maxRow = maxRow;
        this.nodes = nodes;
    }
    GridStackEngine.prototype.batchUpdate = function () {
        if (this.batchMode)
            return this;
        this.batchMode = true;
        this._prevFloat = this._float;
        this._float = true; // let things go anywhere for now... commit() will restore and possibly reposition
        return this;
    };
    GridStackEngine.prototype.commit = function () {
        if (!this.batchMode)
            return this;
        this.batchMode = false;
        this._float = this._prevFloat;
        delete this._prevFloat;
        this._packNodes();
        this._notify();
        return this;
    };
    /** @internal */
    GridStackEngine.prototype._fixCollisions = function (node) {
        this._sortNodes(-1);
        var nn = node;
        var hasLocked = Boolean(this.nodes.find(function (n) { return n.locked; }));
        if (!this.float && !hasLocked) {
            nn = { x: 0, y: node.y, width: this.column, height: node.height };
        }
        while (true) {
            var collisionNode = this.nodes.find(function (n) { return n !== node && Utils.isIntercepted(n, nn); }, { node: node, nn: nn });
            if (!collisionNode) {
                return this;
            }
            var moved = void 0;
            if (collisionNode.locked) {
                // if colliding with a locked item, move ourself instead
                moved = this.moveNode(node, node.x, collisionNode.y + collisionNode.height, node.width, node.height, true);
            }
            else {
                moved = this.moveNode(collisionNode, collisionNode.x, node.y + node.height, collisionNode.width, collisionNode.height, true);
            }
            if (!moved) {
                return this;
            } // break inf loop if we couldn't move after all (ex: maxRow, fixed)
        }
    };
    GridStackEngine.prototype.isAreaEmpty = function (x, y, width, height) {
        var nn = { x: x || 0, y: y || 0, width: width || 1, height: height || 1 };
        var collisionNode = this.nodes.find(function (n) {
            return Utils.isIntercepted(n, nn);
        });
        return !collisionNode;
    };
    /** re-layout grid items to reclaim any empty space */
    GridStackEngine.prototype.compact = function () {
        var _this = this;
        if (this.nodes.length === 0) {
            return this;
        }
        this.batchUpdate();
        this._sortNodes();
        var copyNodes = this.nodes;
        this.nodes = []; // pretend we have no nodes to conflict layout to start with...
        copyNodes.forEach(function (node) {
            if (!node.noMove && !node.locked) {
                node.autoPosition = true;
            }
            _this.addNode(node, false); // 'false' for add event trigger
            node._dirty = true; // force attr update
        });
        this.commit();
        return this;
    };
    Object.defineProperty(GridStackEngine.prototype, "float", {
        /** float getter method */
        get: function () { return this._float || false; },
        /** enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html) */
        set: function (val) {
            if (this._float === val) {
                return;
            }
            this._float = val || false;
            if (!val) {
                this._packNodes();
                this._notify();
            }
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    GridStackEngine.prototype._sortNodes = function (dir) {
        this.nodes = Utils.sort(this.nodes, dir, this.column);
        return this;
    };
    /** @internal */
    GridStackEngine.prototype._packNodes = function () {
        var _this = this;
        this._sortNodes();
        if (this.float) {
            this.nodes.forEach(function (n, i) {
                if (n._updating || n._packY === undefined || n.y === n._packY) {
                    return _this;
                }
                var newY = n.y;
                var _loop_1 = function () {
                    var box = { x: n.x, y: newY, width: n.width, height: n.height };
                    var collisionNode = _this.nodes
                        .slice(0, i)
                        .find(function (bn) { return Utils.isIntercepted(box, bn); }, { n: n, newY: newY });
                    if (!collisionNode) {
                        n._dirty = true;
                        n.y = newY;
                    }
                    --newY;
                };
                while (newY >= n._packY) {
                    _loop_1();
                }
            });
        }
        else {
            this.nodes.forEach(function (n, i) {
                if (n.locked) {
                    return _this;
                }
                var _loop_2 = function () {
                    var newY = n.y - 1;
                    var canBeMoved = i === 0;
                    var box = { x: n.x, y: newY, width: n.width, height: n.height };
                    if (i > 0) {
                        var collisionNode = _this.nodes
                            .slice(0, i)
                            .find(function (bn) { return Utils.isIntercepted(box, bn); }, { n: n, newY: newY });
                        canBeMoved = collisionNode === undefined;
                    }
                    if (!canBeMoved) {
                        return "break";
                    }
                    // Note: must be dirty (from last position) for GridStack::OnChange CB to update positions
                    // and move items back. The user 'change' CB should detect changes from the original
                    // starting position instead.
                    n._dirty = (n.y !== newY);
                    n.y = newY;
                };
                while (n.y > 0) {
                    var state_1 = _loop_2();
                    if (state_1 === "break")
                        break;
                }
            });
        }
        return this;
    };
    /**
     * given a random node, makes sure it's coordinates/values are valid in the current grid
     * @param node to adjust
     * @param resizing if out of bound, resize down or move into the grid to fit ?
     */
    GridStackEngine.prototype.prepareNode = function (node, resizing) {
        node = node || {};
        node._id = node._id || GridStackEngine._idSeq++;
        // if we're missing position, have the grid position us automatically (before we set them to 0,0)
        if (node.x === undefined || node.y === undefined || node.x === null || node.y === null) {
            node.autoPosition = true;
        }
        // assign defaults for missing required fields
        var defaults = { width: 1, height: 1, x: 0, y: 0 };
        node = Utils.defaults(node, defaults);
        node.autoPosition = node.autoPosition || false;
        node.noResize = node.noResize || false;
        node.noMove = node.noMove || false;
        // check for NaN (in case messed up strings were passed. can't do parseInt() || defaults.x above as 0 is valid #)
        if (Number.isNaN(node.x)) {
            node.x = defaults.x;
            node.autoPosition = true;
        }
        if (Number.isNaN(node.y)) {
            node.y = defaults.y;
            node.autoPosition = true;
        }
        if (Number.isNaN(node.width)) {
            node.width = defaults.width;
        }
        if (Number.isNaN(node.height)) {
            node.height = defaults.height;
        }
        if (node.maxWidth) {
            node.width = Math.min(node.width, node.maxWidth);
        }
        if (node.maxHeight) {
            node.height = Math.min(node.height, node.maxHeight);
        }
        if (node.minWidth) {
            node.width = Math.max(node.width, node.minWidth);
        }
        if (node.minHeight) {
            node.height = Math.max(node.height, node.minHeight);
        }
        if (node.width > this.column) {
            node.width = this.column;
        }
        else if (node.width < 1) {
            node.width = 1;
        }
        if (this.maxRow && node.height > this.maxRow) {
            node.height = this.maxRow;
        }
        else if (node.height < 1) {
            node.height = 1;
        }
        if (node.x < 0) {
            node.x = 0;
        }
        if (node.y < 0) {
            node.y = 0;
        }
        if (node.x + node.width > this.column) {
            if (resizing) {
                node.width = this.column - node.x;
            }
            else {
                node.x = this.column - node.width;
            }
        }
        if (this.maxRow && node.y + node.height > this.maxRow) {
            if (resizing) {
                node.height = this.maxRow - node.y;
            }
            else {
                node.y = this.maxRow - node.height;
            }
        }
        return node;
    };
    GridStackEngine.prototype.getDirtyNodes = function (verify) {
        // compare original X,Y,W,H (or entire node?) instead as _dirty can be a temporary state
        if (verify) {
            var dirtNodes_1 = [];
            this.nodes.forEach(function (n) {
                if (n._dirty) {
                    if (n.y === n._origY && n.x === n._origX && n.width === n._origW && n.height === n._origH) {
                        delete n._dirty;
                    }
                    else {
                        dirtNodes_1.push(n);
                    }
                }
            });
            return dirtNodes_1;
        }
        return this.nodes.filter(function (n) { return n._dirty; });
    };
    /** @internal */
    GridStackEngine.prototype._notify = function (nodes, removeDOM) {
        if (removeDOM === void 0) { removeDOM = true; }
        if (this.batchMode) {
            return this;
        }
        nodes = (nodes === undefined ? [] : (Array.isArray(nodes) ? nodes : [nodes]));
        var dirtyNodes = nodes.concat(this.getDirtyNodes());
        if (this.onchange) {
            this.onchange(dirtyNodes, removeDOM);
        }
        return this;
    };
    GridStackEngine.prototype.cleanNodes = function () {
        if (this.batchMode) {
            return this;
        }
        this.nodes.forEach(function (n) { delete n._dirty; });
        return this;
    };
    GridStackEngine.prototype.addNode = function (node, triggerAddEvent) {
        if (triggerAddEvent === void 0) { triggerAddEvent = false; }
        node = this.prepareNode(node);
        if (node.autoPosition) {
            this._sortNodes();
            var _loop_3 = function (i) {
                var x = i % this_1.column;
                var y = Math.floor(i / this_1.column);
                if (x + node.width > this_1.column) {
                    return "continue";
                }
                var box = { x: x, y: y, width: node.width, height: node.height };
                if (!this_1.nodes.find(function (n) { return Utils.isIntercepted(box, n); }, { x: x, y: y, node: node })) {
                    node.x = x;
                    node.y = y;
                    delete node.autoPosition; // found our slot
                    return "break";
                }
            };
            var this_1 = this;
            for (var i = 0;; ++i) {
                var state_2 = _loop_3(i);
                if (state_2 === "break")
                    break;
            }
        }
        this.nodes.push(node);
        if (triggerAddEvent) {
            this.addedNodes.push(node);
        }
        this._fixCollisions(node);
        this._packNodes();
        this._notify();
        return node;
    };
    GridStackEngine.prototype.removeNode = function (node, removeDOM, triggerEvent) {
        if (removeDOM === void 0) { removeDOM = true; }
        if (triggerEvent === void 0) { triggerEvent = false; }
        if (triggerEvent) { // we wait until final drop to manually track removed items (rather than during drag)
            this.removedNodes.push(node);
        }
        node._id = null; // hint that node is being removed
        // TODO: .splice(findIndex(),1) would be faster but apparently there are cases we have 2 instances ! (see spec 'load add new, delete others')
        // this.nodes = this.nodes.filter(n => n !== node);
        this.nodes.splice(this.nodes.findIndex(function (n) { return n === node; }), 1);
        if (!this.float) {
            this._packNodes();
        }
        this._notify(node, removeDOM);
        return this;
    };
    GridStackEngine.prototype.removeAll = function (removeDOM) {
        if (removeDOM === void 0) { removeDOM = true; }
        delete this._layouts;
        if (this.nodes.length === 0) {
            return this;
        }
        if (removeDOM) {
            this.nodes.forEach(function (n) { n._id = null; }); // hint that node is being removed
        }
        this.removedNodes = this.nodes;
        this.nodes = [];
        this._notify(this.removedNodes, removeDOM);
        return this;
    };
    GridStackEngine.prototype.canMoveNode = function (node, x, y, width, height) {
        if (!this.isNodeChangedPosition(node, x, y, width, height)) {
            return false;
        }
        var hasLocked = Boolean(this.nodes.find(function (n) { return n.locked; }));
        if (!this.maxRow && !hasLocked) {
            return true;
        }
        var clonedNode;
        var clone = new GridStackEngine(this.column, null, this.float, 0, this.nodes.map(function (n) {
            if (n === node) {
                clonedNode = Utils.clone(n);
                return clonedNode;
            }
            return Utils.clone(n);
        }));
        if (!clonedNode) {
            return true;
        }
        clone.moveNode(clonedNode, x, y, width, height);
        var canMove = true;
        if (hasLocked) {
            canMove = canMove && !Boolean(clone.nodes.find(function (n) {
                return n !== clonedNode && Boolean(n.locked) && Boolean(n._dirty);
            }));
        }
        if (this.maxRow) {
            canMove = canMove && (clone.getRow() <= this.maxRow);
        }
        return canMove;
    };
    GridStackEngine.prototype.canBePlacedWithRespectToHeight = function (node) {
        if (!this.maxRow) {
            return true;
        }
        var clone = new GridStackEngine(this.column, null, this.float, 0, this.nodes.map(function (n) { return Utils.clone(n); }));
        clone.addNode(node);
        return clone.getRow() <= this.maxRow;
    };
    GridStackEngine.prototype.isNodeChangedPosition = function (node, x, y, width, height) {
        if (typeof x !== 'number') {
            x = node.x;
        }
        if (typeof y !== 'number') {
            y = node.y;
        }
        if (typeof width !== 'number') {
            width = node.width;
        }
        if (typeof height !== 'number') {
            height = node.height;
        }
        if (node.maxWidth) {
            width = Math.min(width, node.maxWidth);
        }
        if (node.maxHeight) {
            height = Math.min(height, node.maxHeight);
        }
        if (node.minWidth) {
            width = Math.max(width, node.minWidth);
        }
        if (node.minHeight) {
            height = Math.max(height, node.minHeight);
        }
        if (node.x === x && node.y === y && node.width === width && node.height === height) {
            return false;
        }
        return true;
    };
    GridStackEngine.prototype.moveNode = function (node, x, y, width, height, noPack) {
        if (node.locked) {
            return null;
        }
        if (typeof x !== 'number') {
            x = node.x;
        }
        if (typeof y !== 'number') {
            y = node.y;
        }
        if (typeof width !== 'number') {
            width = node.width;
        }
        if (typeof height !== 'number') {
            height = node.height;
        }
        // constrain the passed in values and check if we're still changing our node
        var resizing = (node.width !== width || node.height !== height);
        var nn = { x: x, y: y, width: width, height: height,
            maxWidth: node.maxWidth, maxHeight: node.maxHeight, minWidth: node.minWidth, minHeight: node.minHeight };
        nn = this.prepareNode(nn, resizing);
        if (node.x === nn.x && node.y === nn.y && node.width === nn.width && node.height === nn.height) {
            return null;
        }
        node._dirty = true;
        node.x = node._lastTriedX = nn.x;
        node.y = node._lastTriedY = nn.y;
        node.width = node._lastTriedWidth = nn.width;
        node.height = node._lastTriedHeight = nn.height;
        this._fixCollisions(node);
        if (!noPack) {
            this._packNodes();
            this._notify();
        }
        return node;
    };
    GridStackEngine.prototype.getRow = function () {
        return this.nodes.reduce(function (memo, n) { return Math.max(memo, n.y + n.height); }, 0);
    };
    GridStackEngine.prototype.beginUpdate = function (node) {
        if (node._updating)
            return this;
        node._updating = true;
        this.nodes.forEach(function (n) { n._packY = n.y; });
        return this;
    };
    GridStackEngine.prototype.endUpdate = function () {
        var n = this.nodes.find(function (n) { return n._updating; });
        if (n) {
            delete n._updating;
            this.nodes.forEach(function (n) { delete n._packY; });
        }
        return this;
    };
    /** saves the current layout returning a list of widgets for serialization */
    GridStackEngine.prototype.save = function (saveElement) {
        if (saveElement === void 0) { saveElement = true; }
        var widgets = [];
        Utils.sort(this.nodes);
        this.nodes.forEach(function (n) {
            var w = {};
            for (var key in n) {
                if (key[0] !== '_' && n[key] !== null && n[key] !== undefined)
                    w[key] = n[key];
            }
            // delete other internals
            if (!saveElement)
                delete w.el;
            delete w.grid;
            // delete default values (will be re-created on read)
            if (!w.autoPosition)
                delete w.autoPosition;
            if (!w.noResize)
                delete w.noResize;
            if (!w.noMove)
                delete w.noMove;
            if (!w.locked)
                delete w.locked;
            widgets.push(w);
        });
        return widgets;
    };
    /** @internal called whenever a node is added or moved - updates the cached layouts */
    GridStackEngine.prototype.layoutsNodesChange = function (nodes) {
        var _this = this;
        if (!this._layouts || this._ignoreLayoutsNodeChange)
            return this;
        // remove smaller layouts - we will re-generate those on the fly... larger ones need to update
        this._layouts.forEach(function (layout, column) {
            if (!layout || column === _this.column)
                return _this;
            if (column < _this.column) {
                _this._layouts[column] = undefined;
            }
            else {
                // we save the original x,y,w (h isn't cached) to see what actually changed to propagate better.
                // Note: we don't need to check against out of bound scaling/moving as that will be done when using those cache values.
                nodes.forEach(function (node) {
                    var n = layout.find(function (l) { return l._id === node._id; });
                    if (!n)
                        return _this; // no cache for new nodes. Will use those values.
                    var ratio = column / _this.column;
                    // Y changed, push down same amount
                    // TODO: detect doing item 'swaps' will help instead of move (especially in 1 column mode)
                    if (node.y !== node._origY) {
                        n.y += (node.y - node._origY);
                    }
                    // X changed, scale from new position
                    if (node.x !== node._origX) {
                        n.x = Math.round(node.x * ratio);
                    }
                    // width changed, scale from new width
                    if (node.width !== node._origW) {
                        n.width = Math.round(node.width * ratio);
                    }
                    // ...height always carries over from cache
                });
            }
        });
        return this;
    };
    /**
     * @internal Called to scale the widget width & position up/down based on the column change.
     * Note we store previous layouts (especially original ones) to make it possible to go
     * from say 12 -> 1 -> 12 and get back to where we were.
     *
     * @param oldColumn previous number of columns
     * @param column  new column number
     * @param nodes different sorted list (ex: DOM order) instead of current list
     */
    GridStackEngine.prototype.updateNodeWidths = function (oldColumn, column, nodes) {
        var _this = this;
        if (!this.nodes.length || oldColumn === column) {
            return this;
        }
        // cache the current layout in case they want to go back (like 12 -> 1 -> 12) as it requires original data
        var copy = [];
        this.nodes.forEach(function (n, i) { copy[i] = { x: n.x, y: n.y, width: n.width, _id: n._id }; }); // only thing we change is x,y,w and id to find it back
        this._layouts = this._layouts || []; // use array to find larger quick
        this._layouts[oldColumn] = copy;
        // if we're going to 1 column and using DOM order rather than default sorting, then generate that layout
        if (column === 1 && nodes && nodes.length) {
            var top_1 = 0;
            nodes.forEach(function (n) {
                n.x = 0;
                n.width = 1;
                n.y = Math.max(n.y, top_1);
                top_1 = n.y + n.height;
            });
        }
        else {
            nodes = Utils.sort(this.nodes, -1, oldColumn); // current column reverse sorting so we can insert last to front (limit collision)
        }
        // see if we have cached previous layout.
        var cacheNodes = this._layouts[column] || [];
        // if not AND we are going up in size start with the largest layout as down-scaling is more accurate
        var lastIndex = this._layouts.length - 1;
        if (cacheNodes.length === 0 && column > oldColumn && column < lastIndex) {
            cacheNodes = this._layouts[lastIndex] || [];
            if (cacheNodes.length) {
                // pretend we came from that larger column by assigning those values as starting point
                oldColumn = lastIndex;
                cacheNodes.forEach(function (cacheNode) {
                    var j = nodes.findIndex(function (n) { return n._id === cacheNode._id; });
                    if (j !== -1) {
                        // still current, use cache info positions
                        nodes[j].x = cacheNode.x;
                        nodes[j].y = cacheNode.y;
                        nodes[j].width = cacheNode.width;
                    }
                });
                cacheNodes = []; // we still don't have new column cached data... will generate from larger one.
            }
        }
        // if we found cache re-use those nodes that are still current
        var newNodes = [];
        cacheNodes.forEach(function (cacheNode) {
            var j = nodes.findIndex(function (n) { return n && n._id === cacheNode._id; });
            if (j !== -1) {
                // still current, use cache info positions
                nodes[j].x = cacheNode.x;
                nodes[j].y = cacheNode.y;
                nodes[j].width = cacheNode.width;
                newNodes.push(nodes[j]);
                nodes[j] = null; // erase it so we know what's left
            }
        });
        // ...and add any extra non-cached ones
        var ratio = column / oldColumn;
        nodes.forEach(function (node) {
            if (!node)
                return _this;
            node.x = (column === 1 ? 0 : Math.round(node.x * ratio));
            node.width = ((column === 1 || oldColumn === 1) ? 1 : (Math.round(node.width * ratio) || 1));
            newNodes.push(node);
        });
        // finally re-layout them in reverse order (to get correct placement)
        newNodes = Utils.sort(newNodes, -1, column);
        this._ignoreLayoutsNodeChange = true;
        this.batchUpdate();
        this.nodes = []; // pretend we have no nodes to start with (we use same structures) to simplify layout
        newNodes.forEach(function (node) {
            _this.addNode(node, false); // 'false' for add event trigger
            node._dirty = true; // force attr update
        }, this);
        this.commit();
        delete this._ignoreLayoutsNodeChange;
        return this;
    };
    /** @internal called to save initial position/size */
    GridStackEngine.prototype.saveInitial = function () {
        this.nodes.forEach(function (n) {
            n._origX = n.x;
            n._origY = n.y;
            n._origW = n.width;
            n._origH = n.height;
            delete n._dirty;
        });
        return this;
    };
    /** called to remove all internal values */
    GridStackEngine.prototype.cleanupNode = function (node) {
        for (var prop in node) {
            if (prop[0] === '_')
                delete node[prop];
        }
    };
    /** @internal */
    GridStackEngine._idSeq = 1;
    return GridStackEngine;
}());
export { GridStackEngine };
//# sourceMappingURL=gridstack-engine.js.map