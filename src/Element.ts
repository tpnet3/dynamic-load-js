namespace DynamicLoad {

    export class Element {

        element: HTMLElement;
        parent: Node;
        elemHTML: string;
        cloneNodes = [];

        constructor(elemOrHtml: any, parent?: HTMLElement) {
            if (elemOrHtml instanceof HTMLElement) {
                // MDL Tric
                if (componentHandler) {
                    var mdlComponents = elemOrHtml.querySelectorAll('[data-upgraded]');
                    if (mdlComponents.length > 0) componentHandler.downgradeElements(mdlComponents);
                }

                var temp = document.createElement("div");
                temp.appendChild(elemOrHtml.cloneNode(true));

                this.element = elemOrHtml;
                this.elemHTML = temp.innerHTML;
                elemOrHtml.style.display = "none";

                if (parent) parent.innerHTML = "";
                this.parent = parent || elemOrHtml.parentNode;
            } else {
                this.elemHTML = elemOrHtml;

                if (parent) parent.innerHTML = "";
                this.parent = parent;
            }

        }

        bind(data: {[index: string]: any}): Element {
            for (var i = 1; i < this.cloneNodes.length; i++) {
                this.parent.removeChild(this.cloneNodes[i].node);
            }

            if (this.cloneNodes.length != 0) {
                this.cloneNodes = [this.cloneNodes[0]];

                var keys = Object.keys(data);

                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[0].cloneData[keys[j]] != data[keys[j]]) {
                        var bindedNodes = this.bindedNodes(data);

                        for (var k = 0; k < bindedNodes.length; k++) {
                            this.parent.insertBefore(bindedNodes[k], this.cloneNodes[0].nodes[this.cloneNodes[0].nodes.length - 1].nextSibling);
                        }

                        for (var k = 0; k < this.cloneNodes[0].nodes.length; k++) {
                            this.parent.removeChild(this.cloneNodes[0].nodes[k]);
                        }

                        this.cloneNodes[0].nodes = bindedNodes;
                        this.cloneNodes[0].cloneData = JSON.parse(JSON.stringify(data));
                        break;
                    }
                }
            } else {
                var bindedNodes = this.bindedNodes(data);

                var nextSibling = this.element ? this.element.nextSibling : this.parent.firstChild

                for (var k = 0; k < bindedNodes.length; k++) {
                    this.parent.insertBefore(bindedNodes[k], nextSibling);
                }

                this.cloneNodes.push({
                    data: data,
                    cloneData: JSON.parse(JSON.stringify(data)),
                    nodes: bindedNodes
                });
            }

            return this;
        }

        refresh(): Element {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                var keys = Object.keys(this.cloneNodes[i].data);

                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[i].cloneData[keys[j]] != this.cloneNodes[i].data[keys[j]]) {
                        var bindedNodes = this.bindedNodes(this.cloneNodes[i].data);

                        for (var k = 0; k < bindedNodes.length; k++) {
                            this.parent.insertBefore(bindedNodes[k], this.cloneNodes[i].nodes[this.cloneNodes[i].nodes.length - 1].nextSibling);
                        }

                        for (var k = 0; k < this.cloneNodes[i].nodes.length; k++) {
                            this.parent.removeChild(this.cloneNodes[i].nodes[k]);
                        }

                        this.cloneNodes[i].nodes = bindedNodes;
                        this.cloneNodes[i].cloneData = JSON.parse(JSON.stringify(this.cloneNodes[i].data));
                        break;
                    }
                }
            }

            return this;
        }

        repeat(data: [{[index: string]: any}], refresh?: boolean): Element {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                if (data.indexOf(this.cloneNodes[i].data) == -1) {
                    for (var k = 0; k < this.cloneNodes[i].nodes.length; k++) {
                        this.parent.removeChild(this.cloneNodes[i].nodes[k]);
                    }

                    this.cloneNodes.splice(i, 1);
                    --i;
                }
            }

            if (refresh) {
                this.refresh();
            }

            var nextNodeIndex = this.cloneNodes.length - 1;

            for (var i = data.length - 1; i >= 0; i--) {
                if (nextNodeIndex != -1 && this.cloneNodes[nextNodeIndex].data === data[i]) {
                    nextNodeIndex--;
                    continue;
                }

                var bindedNodes = this.bindedNodes(data[i]);

                var nextSibling = nextNodeIndex == -1 ? (this.element ? this.element.nextSibling : this.parent.firstChild) : this.cloneNodes[nextNodeIndex].nodes[this.cloneNodes[nextNodeIndex].nodes.length - 1].nextSibling;

                for (var k = 0; k < bindedNodes.length; k++) {
                    this.parent.insertBefore(bindedNodes[k], nextSibling);
                }

                this.cloneNodes.splice(nextNodeIndex + 1, 0, {
                    data: data[i],
                    cloneData: JSON.parse(JSON.stringify(data[i])),
                    nodes: bindedNodes
                });
            }

            return this;
        }

        private bindedNodes(data: {[index: string]: any}): Node[] {
            var temp: HTMLDivElement = document.createElement("div");
            temp.innerHTML = this.elemHTML;

            if (data) {
                var keys = Object.keys(data);

                for (var i = 0; i < keys.length; i++) {
                    var regex = new RegExp("{{" + keys[i] + "}}", "g");
                    temp.innerHTML = temp.innerHTML.replace(regex, data[keys[i]]);
                }
            }

            var array = [];

            array.length = temp.childNodes.length;

            for (var i = 0; i < temp.childNodes.length; i++) {
                array[i] = temp.childNodes[i];
            }

            return array;
        }
    }
}
