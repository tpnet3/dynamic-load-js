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

        bind(data: {[index: string]: any}) {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                this.element.parentNode.removeChild(this.cloneNodes[i].node);
            }

            this.cloneNodes = [];

            var bindedNode = this.bindedNode(data);

            this.element.parentNode.insertBefore(bindedNode, this.element.nextSibling);

            this.cloneNodes.push({
                data: data,
                node: bindedNode
            });

            return this;
        }

        repeat(data: [{[index: string]: any}]) {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                if (data.indexOf(this.cloneNodes[i].data) == -1) {
                    this.element.parentNode.removeChild(this.cloneNodes[i].node);
                    this.cloneNodes.splice(i, 1);
                    --i;
                }
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
                    node: bindedNode
                });
            }

            return this;
        }

        private bindedNode(data: {[index: string]: any}) {
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
