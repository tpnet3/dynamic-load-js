namespace DynamicLoad {

    export class Element {

        element: HTMLElement;
        elemNode: Node;
        cloneNodes = [];

        constructor(element: HTMLElement) {
            this.element = element;
            this.elemNode = this.element.cloneNode(true);
            this.element.style.display = "none";
        }

        bind(data: {[index: string]: any}): Element {
            for (var i = 1; i < this.cloneNodes.length; i++) {
                this.element.parentNode.removeChild(this.cloneNodes[i].node);
            }

            if (this.cloneNodes.length != 0) {
                this.cloneNodes = [this.cloneNodes[0]];

                var keys = Object.keys(data);

                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[0].cloneData[keys[j]] != data[keys[j]]) {
                        var bindedNode = this.bindedNode(data);
                        this.element.parentNode.insertBefore(bindedNode, this.cloneNodes[0].node.nextSibling);
                        this.element.parentNode.removeChild(this.cloneNodes[0].node);
                        this.cloneNodes[0].node = bindedNode;
                        this.cloneNodes[0].cloneData = JSON.parse(JSON.stringify(data));
                        break;
                    }
                }
            } else {
                var bindedNode = this.bindedNode(data);
                this.element.parentNode.insertBefore(bindedNode, this.element.nextSibling);
                this.cloneNodes.push({
                    data: data,
                    cloneData: JSON.parse(JSON.stringify(data)),
                    node: bindedNode
                });
            }

            // Tric MDL
            if (componentHandler) componentHandler.upgradeAllRegistered();

            return this;
        }

        refresh(): Element {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                var keys = Object.keys(this.cloneNodes[i].data);

                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[i].cloneData[keys[j]] != this.cloneNodes[i].data[keys[j]]) {
                        var bindedNode = this.bindedNode(this.cloneNodes[i].data);
                        this.element.parentNode.insertBefore(bindedNode, this.cloneNodes[i].node.nextSibling);
                        this.element.parentNode.removeChild(this.cloneNodes[i].node);
                        this.cloneNodes[i].node = bindedNode;
                        this.cloneNodes[i].cloneData = JSON.parse(JSON.stringify(this.cloneNodes[i].data));
                        break;
                    }
                }
            }

            // Tric MDL
            if (componentHandler) componentHandler.upgradeAllRegistered();

            return this;
        }

        repeat(data: [{[index: string]: any}], refresh?: boolean): Element {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                if (data.indexOf(this.cloneNodes[i].data) == -1) {
                    this.element.parentNode.removeChild(this.cloneNodes[i].node);
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

                var bindedNode = this.bindedNode(data[i]);

                var nextSibling = nextNodeIndex == -1 ? this.element.nextSibling : this.cloneNodes[nextNodeIndex].node.nextSibling;

                this.element.parentNode.insertBefore(bindedNode, nextSibling);

                this.cloneNodes.splice(nextNodeIndex + 1, 0, {
                    data: data[i],
                    cloneData: JSON.parse(JSON.stringify(data[i])),
                    node: bindedNode
                });
            }

            // Tric MDL
            if (componentHandler) componentHandler.upgradeAllRegistered();

            return this;
        }

        private bindedNode(data: {[index: string]: any}): Node {
            var temp: HTMLDivElement = document.createElement("div");
            temp.appendChild(this.elemNode.cloneNode(true));

            if (data) {
                var keys = Object.keys(data);

                for (var i = 0; i < keys.length; i++) {
                    var regex = new RegExp("{{" + keys[i] + "}}", "g");
                    temp.innerHTML = temp.innerHTML.replace(regex, data[keys[i]]);
                }
            }

            return temp.childNodes[0];
        }
    }
}
