declare var componentHandler: any;

namespace DynamicLoad {

    export class LoadHtml {
        private http: Http;
        private element: HTMLElement;
        private jsList: LoadJs[] = [];
        private callback: Array<(status?: number, responseText?: string) => void> = [];

        constructor(src: string) {
            this.http = Http.get(src)
                .addCallback((status: number, responseText: string) => {
                    var temp: HTMLDivElement = document.createElement("div");
                    temp.innerHTML = responseText;

                    var callback: () => void = () => {
                        for (var i: number = 0; i < this.callback.length; i++) {
                            this.callback[i](status, responseText);
                        }
                    };

                    var nextScripts: NodeListOf<HTMLScriptElement> = temp.getElementsByTagName("script");

                    if (nextScripts.length == 0) {
                        callback();
                    } else {
                        var loading: number = 0;

                        do {
                            loading++;
                            var responseScript: HTMLScriptElement = nextScripts[0];
                            this.jsList.push(LoadJs.getInstance(responseScript.src, responseScript.type).addCallback(() => {
                                loading--;

                                if (loading == 0) {
                                    callback();
                                }
                            }).load());
                            temp.removeChild(responseScript);
                            nextScripts = temp.getElementsByTagName("script");
                        } while (nextScripts.length != 0);
                    }

                    var body: HTMLBodyElement = temp.getElementsByTagName("body")[0];

                    // set innerHTML
                    this.element.innerHTML = body ? body.innerHTML : temp.innerHTML;

                    // Tric MDL
                    if (componentHandler) componentHandler.upgradeAllRegistered();
                });
        }

        addCallback(func: (status?: number, responseText?: string) => void): LoadHtml {
            this.callback.push(func);
            return this;
        }

        put(elem: HTMLElement): LoadHtml {
            this.element = elem;
            this.http.asString();
            return this;
        }

        destroy(elem?: HTMLElement): void {
            if (elem) this.element = elem;
            this.element.innerHTML = "";

            for (var i: number = 0; i < this.jsList.length; i++) {
                this.jsList[i].destroy();
            }

            this.jsList = [];
        }


        static getInstance(src: string): LoadHtml {
            return new LoadHtml(src);
        }
    }
}
