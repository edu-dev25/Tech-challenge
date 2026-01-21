<!doctype html>
<html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API Docs (Swagger)</title>
        <meta name="csrf-token" content="{{ csrf_token() }}" />
        <link
            rel="stylesheet"
            href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
        />
        <style>
            body {
                margin: 0;
                background: #f8fafc;
            }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
            window.ui = SwaggerUIBundle({
                url: '/docs/openapi.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis],
                layout: 'BaseLayout',
                requestInterceptor: (req) => {
                    // Importante para CSRF en Laravel: mandar cookies de sesión (same-origin)
                    req.credentials = 'same-origin';

                    // Tomamos el CSRF token de la propia página /docs (misma sesión)
                    const token = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content');

                    if (token) {
                        req.headers = req.headers || {};
                        req.headers['X-CSRF-TOKEN'] = token;
                        req.headers['X-Requested-With'] = 'XMLHttpRequest';
                    }

                    return req;
                },
            });
        </script>
    </body>
</html>

