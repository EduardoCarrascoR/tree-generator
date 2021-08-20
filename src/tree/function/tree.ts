import { NodewithChildren } from "../../models/tree.interface";

export class Tree {
    root
    constructor() {
        this.root = null
    }

    insertNode(node, data) {
        const newNode = new NodewithChildren(data)

        if(this.root === null) this.root = newNode
        node.children.push(newNode)
        
    }

    getRootNode() {
        return this.root;
    }
}