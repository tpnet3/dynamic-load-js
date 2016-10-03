# Dynamic Load JS
Lightweight, Scalable

## Installation
Hosted by github
```
<script type="text/javascript" src="https://tpnet3.github.io/dynamic-load-js/dist/latest/DynamicLoad.min.js"></script>
```

Download via bower
```
bower install dynamic-load-js
```

## Usage
index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE-edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <script type="text/javascript" src="https://tpnet3.github.io/dynamic-load-js/dist/latest/DynamicLoad.min.js"></script>
    <script>window.onload = function() { DynamicLoad.Route.run("route.json"); }</script>
</head>
<body></body>
</html>
```

route.json
```json
{
  "/foo": "foo-route.json",
  "/foo/{*}": "foo-route.json",
  "/bar/{param}": {
    "html": "home.html",
    "css": ["main.css", "home.css"],
    "js": {
      "home.js": {
        "create": "Home.create",
        "destroy": "Home.destroy",
        "data": {
          "app": "bar"
        }
      }
    }
  },
  "/": {
    "html": "home.html",
    "css": ["main.css", "home.css"],
    "js": {
      "home.js": {
        "create": "Home.create",
        "destroy": "Home.destroy",
        "data": {
          "app": "root"
        }
      }
    }
  },
  "/{*}": {
    "html": "not-found.html"
  }
}
```

## License
[MIT License](LICENSE)
