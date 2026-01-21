import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { redirectTo } from '../../lib/navigation';

type ShowResponse =
    | {
          ok: true;
          data: {
              id: number;
              code: string;
              original_url: string;
              created_at: string;
              updated_at: string;
          };
      }
    | { ok: false; message?: string };

type Props = {
    code: string;
};

function isValidAbsoluteHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function UrlsWait({ code }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(`/urls/${encodeURIComponent(code)}`, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const json = (await res.json().catch(() => null)) as ShowResponse | null;

                if (!res.ok) {
                    const msg =
                        (json && 'message' in json && json.message) ||
                        `Error HTTP ${res.status}`;
                    throw new Error(msg);
                }

                if (!json || json.ok !== true) {
                    throw new Error('Respuesta inválida del servidor.');
                }

                const candidate = json.data.original_url;
                const next = isValidAbsoluteHttpUrl(candidate) ? candidate : '/urls/create';

                if (!cancelled) setRedirectUrl(next);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Error desconocido';
                if (!cancelled) {
                    setError(msg);
                    setRedirectUrl('/urls/create');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        // Esperamos 2s (hardcodeado) y luego redireccionamos
        // - Si el backend dio una original_url válida: redirigimos ahí
        // - Si hubo error o URL inválida: redirigimos a /urls/create
        // Nota: `redirectTo` se setea arriba cuando termina la consulta.
        // Hacemos un segundo effect abajo para iniciar el timer cuando exista.

        return () => {
            cancelled = true;
        };
    }, [code]);

    useEffect(() => {
        if (!redirectUrl) return;
        if (typeof window === 'undefined') return;

        const id = setTimeout(() => {
            redirectTo(redirectUrl);
        }, 2000);

        return () => clearTimeout(id);
    }, [redirectUrl]);

    return (
        <>
            <Head title="Wait a moment" />

            <main className="mx-auto w-full max-w-3xl px-4 py-10">
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                        Wait a moment
                    </h1>

                    <p className="mt-2 text-sm text-neutral-600">
                        Validando el código: <span className="font-mono">{code}</span>
                    </p>

                    <p className="mt-6 text-sm text-neutral-600">
                        {isLoading
                            ? 'Consultando...'
                            : redirectUrl
                              ? 'Redirigiendo...'
                              : 'Preparando redirección...'}
                    </p>

                    {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
                </section>
            </main>
        </>
    );
}

