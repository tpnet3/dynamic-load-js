declare var componentHandler: any;

namespace DynamicLoad {

    export class LoadHtml {
        private http: Http;
        private src: string;
        private element: HTMLElement;
        private isAppend: boolean = false;
        private callback: Array<(status?: number, responseText?: string) => void> = [];
        //private jsList: LoadJs[] = [];
        //private static jsAllList: { [index: string]: { jsList: LoadJs[], target: HTMLElement[] } } = {};

        constructor(src: string) {
            this.src = src;
            //this.jsList = (LoadHtml.jsAllList[src] ? LoadHtml.jsAllList[src]["jsList"] : []);

            this.http = Http.get(src)
                .addCallback((status: number, responseText: string) => {
                    var temp: HTMLDivElement = document.createElement("div");
                    temp.innerHTML = responseText;

                    var callback = () => {
                        for (var i: number = 0; i < this.callback.length; i++) {
                            this.callback[i](status, responseText);
                        }
                    };

                    /*
                    var nextScripts: NodeListOf<HTMLScriptElement> = temp.getElementsByTagName("script");

                    if (nextScripts.length != 0) {
                        do {
                            var responseScript: HTMLScriptElement = nextScripts[0];
                            this.jsList.push(LoadJs.getInstance(responseScript.src, responseScript.type).load());
                            temp.removeChild(responseScript);
                            nextScripts = temp.getElementsByTagName("script");
                        } while (nextScripts.length != 0);

                        LoadHtml.jsAllList[src] = LoadHtml.jsAllList[src] || { jsList: this.jsList, target: [] };
                        LoadHtml.jsAllList[src]["target"].push(this.element);
                    }
                    */

                    var body: HTMLBodyElement = temp.getElementsByTagName("body")[0];

                    if (this.isAppend) {
                      // Set append
                      this.element.appendChild(body ? body : temp);
                    } else {
                      // set innerHTML
                      this.element.innerHTML = body ? body.innerHTML : temp.innerHTML;
                    }

                    // Tric MDL
                    if (componentHandler) componentHandler.upgradeAllRegistered();

                    // Callback
                    callback();
                });
        }

        addCallback(func: (status?: number, responseText?: string) => void): LoadHtml {
            this.callback.push(func);
            return this;
        }

        put(elem: HTMLElement): LoadHtml {
            this.element = elem;
            this.isAppend = false;
            this.http.asString();
            return this;
        }

        append(elem: HTMLElement): LoadHtml {
            this.element = elem;
            this.isAppend = true;
            this.http.asString();
            return this;
        }

        destroy(elem?: HTMLElement): void {
            if (elem) this.element = elem;
            if (!this.element) return;

            /*
            var jsListObj = LoadHtml.jsAllList[this.src];

            if (jsListObj) {
                var target = jsListObj["target"];
                var targetIndex = target.indexOf(this.element);
                this.jsList = jsListObj["jsList"];

                if (targetIndex != -1) {
                      for (var i: number = 0; i < this.jsList.length; i++) {
                          this.jsList[i].destroy();
                      }

                      target.splice(targetIndex, 1);

                      if (target.length == 0) {
                          delete LoadHtml.jsAllList[this.src]
                      }
                }
            }
            */

            this.element.innerHTML = "";
        }

        static getInstance(src: string): LoadHtml {
            return new LoadHtml(src);
        }
    }
}
