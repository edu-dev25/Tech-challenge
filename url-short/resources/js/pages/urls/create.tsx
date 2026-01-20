import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function UrlsCreate() {
    const [originalUrl, setOriginalUrl] = useState('');

    return (
        <>
            <Head title="Crear URL corta" />

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                        Create new URL
                    </h1>

                    <form
                        className="mt-6 flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // eslint-disable-next-line no-alert
                            alert(`URL enviada: ${originalUrl}`);
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="original_url"
                                className="text-sm font-medium text-neutral-800"
                            >
                                Original URL
                            </label>

                            <input
                                id="original_url"
                                name="original_url"
                                type="url"
                                inputMode="url"
                                placeholder="https://example.com/..."
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100"
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                required
                            />

                            <p className="text-sm text-neutral-500">
                                Tip: incluye <code className="font-mono">https://</code>
                            </p>
                        </div>

                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!originalUrl.trim()}
                            >
                                CREATE
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </>
    );
}

