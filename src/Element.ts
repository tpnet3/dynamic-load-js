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

        bind(data: {[index: string]: string}) {
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
        }

        repeat(data: [{[index: string]: string}]) {
            // 없는 데이터제거
            for (var i = 0; i < this.cloneNodes.length; i++) {
                if (data.indexOf(this.cloneNodes[i].data) == -1) {
                    this.element.parentNode.removeChild(this.cloneNodes[i].node);
                    this.cloneNodes.splice(i, 1);
                    --i;
                }
            }

            var nextNode = this.cloneNodes[0];


            for (var i = data.length; i > 0; i--) {
                var bindedNode = this.bindedNode(data[i]);

                this.element.parentNode.insertBefore(bindedNode, this.element.nextSibling);

                this.cloneNodes.unshift({
                    data: data,
                    node: bindedNode
                });
            }
        }

        private bindedNode(data: {[index: string]: string}) {
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
