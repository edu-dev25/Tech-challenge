import { useCallback, useMemo, useState } from 'react';

import { getCsrfToken } from '@/lib/utils';
import { redirectTo } from '@/lib/navigation';

export function useCreateUrl() {
    // Estado del input (la URL original escrita por el usuario).
    const [originalUrl, setOriginalUrl] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Calcula si el valor actual del input es una URL válida.
    // useMemo evita recalcular si `originalUrl` no cambió.
    const isValidUrl = useMemo(() => {
        // Quitamos espacios al inicio/fin para validar correctamente.
        const value = originalUrl.trim();
        // Si está vacío, no es válido.
        if (!value) return false;
        try {
            // `new URL(...)` lanza si el string no es una URL válida.
            const url = new URL(value);
            // Aceptamos solo http/https (no mailto:, ftp:, etc.).
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            // Si `new URL(...)` falló, no es una URL válida.
            return false;
        }
    }, [originalUrl]);

    // Flag para UI: "hay texto" pero "no es una URL válida" => input en rojo.
    const isInvalidUrl = useMemo(() => {
        // Mismo trim para evaluar el estado visual.
        const value = originalUrl.trim();
        // Solo marcamos inválido cuando el usuario ya escribió algo.
        return value.length > 0 && !isValidUrl;
    }, [isValidUrl, originalUrl]);

    // Acción de submit: manda la URL al backend (POST /urls).
    // useCallback mantiene estable la referencia de la función entre renders.
    const submitUrl = useCallback(async () => {
        // Guard clause: si la URL no es válida, no hacemos request.
        if (!isValidUrl) return null;
        setSubmitError(null);
        // Llamada al endpoint backend (ruta Laravel en routes/web.php).
        const res = await fetch('/urls', {
            // Método HTTP.
            method: 'POST',
            // En rutas web, enviamos cookies/sesión para que CSRF funcione.
            credentials: 'same-origin',
            headers: {
                // Pedimos JSON para que Laravel responda JSON (expectsJson()).
                Accept: 'application/json',
                // Body JSON.
                'Content-Type': 'application/json',
                // CSRF token desde el meta tag del layout (Laravel-style).
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            // Payload que Laravel valida como `original_url`.
            body: JSON.stringify({ original_url: originalUrl }),
        });

        // Intentamos leer JSON; si no es JSON, `data` queda null.
        const data = await res.json().catch(() => null);
        // Logs temporales para ver status y respuesta en consola.
        console.log('POST /urls status:', res.status);
        console.log('Response:', data);

        // Retornamos la respuesta por si el componente quiere usarla después.
        // Si todo salió bien, mandamos al usuario al listado.
        if (res.status === 201 && data && typeof data === 'object' && data.ok === true) {
            redirectTo('/urls/list');
            return { res, data };
        }

        // Si ya existe el registro, mostramos el mensaje bajo el input.
        if (res.status === 409 && data && typeof data === 'object' && data.ok === false) {
            const msg = 'message' in data && typeof data.message === 'string' ? data.message : null;
            setSubmitError(msg ?? 'Esta URL ya cuenta con un registro.');
            return { res, data };
        }

        // Para otros errores, mostramos un mensaje genérico si viene.
        if (!res.ok) {
            const msg = data && typeof data === 'object' && 'message' in data ? (data as any).message : null;
            setSubmitError(typeof msg === 'string' ? msg : `Error HTTP ${res.status}`);
        }

        return { res, data };
    }, [isValidUrl, originalUrl]);

    // Exponemos estado + setters + submit + flags de validación para UI.
    return {
        originalUrl,
        setOriginalUrl: (value: string) => {
            setSubmitError(null);
            setOriginalUrl(value);
        },
        submitUrl,
        isValidUrl,
        isInvalidUrl,
        submitError,
    };
}

