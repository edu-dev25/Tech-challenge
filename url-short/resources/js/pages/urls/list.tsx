import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import { getCsrfToken } from '../../lib/utils';

type ShortUrlItem = {
    id: number;
    code: string;
    original_url: string;
};

type ListResponse =
    | { ok: true; data: ShortUrlItem[] }
    | { ok: false; message?: string; data?: unknown };

function buildShortUrl(code: string): string {
    // Queremos la URL de nuestro sistema (ej. http://localhost:8000/{code})
    // En browser, `window.location.origin` apunta al dominio actual (APP_URL en dev).
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/${code}`;
    }

    // Fallback (SSR/tests): relativo al host actual
    return `/${code}`;
}

export default function UrlsList() {
    const [items, setItems] = useState<ShortUrlItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(() => new Set());

    const hasItems = useMemo(() => items.length > 0, [items.length]);

    const deleteByCode = async (id: number, code: string) => {
        // Evita doble click / requests duplicados.
        if (deletingIds.has(id)) return;

        setDeletingIds((prev) => new Set(prev).add(id));
        setError(null);

        try {
            const res = await fetch(`/urls/${encodeURIComponent(code)}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
            });

            const json = (await res.json().catch(() => null)) as
                | { ok: true }
                | { ok: false; message?: string }
                | null;

            // Si ya no existe (404), lo tratamos como "ya no está" y lo quitamos igual del UI.
            if (!res.ok && res.status !== 404) {
                const msg =
                    (json && 'message' in json && json.message) ||
                    `Error HTTP ${res.status}`;
                throw new Error(msg);
            }

            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Error desconocido';
            setError(msg);
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch('/urls', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const json = (await res.json().catch(() => null)) as ListResponse | null;

                if (!res.ok) {
                    const msg =
                        (json && 'message' in json && json.message) ||
                        `Error HTTP ${res.status}`;
                    throw new Error(msg);
                }

                if (!json || json.ok !== true) {
                    throw new Error('Respuesta inválida del servidor.');
                }

                if (!cancelled) setItems(json.data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Error desconocido';
                if (!cancelled) setError(msg);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Head title="Shortened URLs" />

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <header className="flex items-center justify-between gap-4">
                        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                            Shortened URLs
                        </h1>
                        <a
                            href="/urls/create"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-base font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-100"
                            aria-label="Create new short URL"
                            title="Create new short URL"
                        >
                            +
                        </a>
                    </header>

                    {isLoading ? (
                        <p className="mt-6 text-sm text-neutral-600">Cargando...</p>
                    ) : error ? (
                        <p className="mt-6 text-sm text-red-600">{error}</p>
                    ) : !hasItems ? (
                        <p className="mt-6 text-sm text-neutral-600">
                            Aún no hay URLs creadas.
                        </p>
                    ) : (
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr className="text-left text-neutral-700">
                                        <th className="border-b border-neutral-200 px-3 py-3 font-medium">
                                            #
                                        </th>
                                        <th className="border-b border-neutral-200 px-3 py-3 font-medium">
                                            Code
                                        </th>
                                        <th className="border-b border-neutral-200 px-3 py-3 font-medium">
                                            original url
                                        </th>
                                        <th className="border-b border-neutral-200 px-3 py-3 font-medium">
                                            actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-900">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border-b border-neutral-100 px-3 py-3">
                                                {item.id}
                                            </td>
                                            <td className="border-b border-neutral-100 px-3 py-3 font-mono">
                                                {item.code}
                                            </td>
                                            <td className="border-b border-neutral-100 px-3 py-3">
                                                <span className="break-all">
                                                    {item.original_url}
                                                </span>
                                            </td>
                                            <td className="border-b border-neutral-100 px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={buildShortUrl(item.code)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex h-9 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-100"
                                                        aria-label={`Open /${item.code}`}
                                                        title="Open"
                                                    >
                                                        ↗
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-9 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-900 opacity-60 hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Delete ${item.code}`}
                                                        title="Delete"
                                                        disabled={deletingIds.has(item.id)}
                                                        onClick={async () => {
                                                            await deleteByCode(item.id, item.code);
                                                        }}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

