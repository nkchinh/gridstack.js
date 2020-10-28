import { GridStackNode } from './types';
export declare type onChangeCB = (nodes: GridStackNode[], removeDOM?: boolean) => void;
/**
 * Defines the GridStack engine that does most no DOM grid manipulation.
 * See GridStack methods and vars for descriptions.
 *
 * NOTE: values should not be modified directly - call the main GridStack API instead
 */
export declare class GridStackEngine {
    column: number;
    maxRow: number;
    nodes: GridStackNode[];
    onchange: onChangeCB;
    addedNodes: GridStackNode[];
    removedNodes: GridStackNode[];
    batchMode: boolean;
    /** @internal */
    private _float;
    /** @internal */
    private _prevFloat;
    /** @internal */
    private _layouts?;
    /** @internal */
    private _ignoreLayoutsNodeChange;
    /** @internal */
    private static _idSeq;
    constructor(column?: number, onchange?: onChangeCB, float?: boolean, maxRow?: number, nodes?: GridStackNode[]);
    batchUpdate(): GridStackEngine;
    commit(): GridStackEngine;
    /** @internal */
    private _fixCollisions;
    isAreaEmpty(x: number, y: number, width: number, height: number): boolean;
    /** re-layout grid items to reclaim any empty space */
    compact(): GridStackEngine;
    /** enable/disable floating widgets (default: `false`) See [example](http://gridstackjs.com/demo/float.html) */
    /** float getter method */
    float: boolean;
    /** @internal */
    private _sortNodes;
    /** @internal */
    private _packNodes;
    /**
     * given a random node, makes sure it's coordinates/values are valid in the current grid
     * @param node to adjust
     * @param resizing if out of bound, resize down or move into the grid to fit ?
     */
    prepareNode(node: GridStackNode, resizing?: boolean): GridStackNode;
    getDirtyNodes(verify?: boolean): GridStackNode[];
    /** @internal */
    private _notify;
    cleanNodes(): GridStackEngine;
    addNode(node: GridStackNode, triggerAddEvent?: boolean): GridStackNode;
    removeNode(node: GridStackNode, removeDOM?: boolean, triggerEvent?: boolean): GridStackEngine;
    removeAll(removeDOM?: boolean): GridStackEngine;
    canMoveNode(node: GridStackNode, x: number, y: number, width?: number, height?: number): boolean;
    canBePlacedWithRespectToHeight(node: GridStackNode): boolean;
    isNodeChangedPosition(node: GridStackNode, x: number, y: number, width: number, height: number): boolean;
    moveNode(node: GridStackNode, x: number, y: number, width?: number, height?: number, noPack?: boolean): GridStackNode;
    getRow(): number;
    beginUpdate(node: GridStackNode): GridStackEngine;
    endUpdate(): GridStackEngine;
    /** saves the current layout returning a list of widgets for serialization */
    save(saveElement?: boolean): GridStackNode[];
    /** @internal called whenever a node is added or moved - updates the cached layouts */
    layoutsNodesChange(nodes: GridStackNode[]): GridStackEngine;
    /**
     * @internal Called to scale the widget width & position up/down based on the column change.
     * Note we store previous layouts (especially original ones) to make it possible to go
     * from say 12 -> 1 -> 12 and get back to where we were.
     *
     * @param oldColumn previous number of columns
     * @param column  new column number
     * @param nodes different sorted list (ex: DOM order) instead of current list
     */
    updateNodeWidths(oldColumn: number, column: number, nodes: GridStackNode[]): GridStackEngine;
    /** @internal called to save initial position/size */
    saveInitial(): GridStackEngine;
    /** called to remove all internal values */
    cleanupNode(node: GridStackNode): void;
    /** @internal legacy method renames */
    private getGridHeight;
}
