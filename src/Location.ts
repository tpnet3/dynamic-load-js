namespace DynamicLoad {

    export class Location {

        static enchantUrl(): boolean {
            var href: string = window.location.href;
            href = href.replace(/#+!+\/*|$/, "#!/");

            var splitIndex: number = href.indexOf("#!/") + 3;
            var firstHref: string = href.slice(0, splitIndex);
            var lastHref: string = href.slice(splitIndex);
            lastHref = lastHref.replace(/\/{2,}/g, "/");
            if (lastHref.length > 0 && lastHref.slice(-1) == "/") lastHref = lastHref.slice(0, -1);
            href = firstHref + lastHref;

            var equal: boolean = window.location.href == href;

            if (!equal) {
                window.location.replace(href);
            }

            return equal;
        }

        static uri(goUri?: string): string {
            var href: string = window.location.href;
            var index: number = href.indexOf("#!");

            if (goUri) {
                window.location.replace(href.slice(0, index == -1 ? href.length : index) + "#!" + goUri);
                return goUri;
            } else if (index != -1) {
                var uri: string = href.slice(index + 2, href.length);
                return uri ? uri : "/";
            } else {
                return "/";
            }
        }

        static path(): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            var lastPathIndex = uri.length;

            if (q != -1 && h != -1) lastPathIndex = (q < h ? q : h);
            else if (q != -1 && h == -1) lastPathIndex = q;
            else if (q == -1 && h != -1) lastPathIndex = h;

            return uri.slice(0, lastPathIndex).replace(/\/{2,}/g, "/");
        }

        static query(name?: string): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");

            if (name) {
                var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(this.query());
                if (!results) return null;
                if (!results[2]) return "";
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            } else {
                return uri.slice(q, (h < uri.length && q < h ? h : uri.length));
            }
        }

        static hash(): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            return uri.slice(h + 1, (q < uri.length && h < q ? q : uri.length));
        }
    }
}
