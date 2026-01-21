import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/navigation', () => ({
    redirectTo: vi.fn(),
}));

import { redirectTo } from '../../lib/navigation';
import UrlsWait from './wait';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
}));

describe('UrlsWait', () => {
    it('consulta /urls/{code} y redirecciona a la original_url después de 2s', async () => {
        vi.useFakeTimers();
        const redirectMock = vi.mocked(redirectTo);
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                ok: true,
                data: {
                    id: 1,
                    code: 'aaaa1111',
                    original_url: 'https://one.test/path',
                    created_at: '2026-01-01T00:00:00.000000Z',
                    updated_at: '2026-01-01T00:00:00.000000Z',
                },
            }),
        });

        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        render(<UrlsWait code="aaaa1111" />);

        expect(screen.getByText('Wait a moment')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalled();

        // Deja que se resuelvan los awaits del useEffect (fetch + json + setState)
        await act(async () => {
            for (let i = 0; i < 10; i++) await Promise.resolve();
        });

        // Ya debería estar listo para redirigir (pero aún no han pasado 2s)
        expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
        expect(redirectMock).not.toHaveBeenCalled();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1999);
        });
        expect(redirectMock).not.toHaveBeenCalled();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1);
        });
        expect(redirectMock).toHaveBeenCalledWith('https://one.test/path');

        vi.useRealTimers();
    });

    it('si el backend falla o no existe el code, redirecciona a /urls/create', async () => {
        vi.useFakeTimers();
        const redirectMock = vi.mocked(redirectTo);
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({
                ok: false,
                message: 'Código no encontrado.',
            }),
        });

        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        render(<UrlsWait code="ffff0000" />);

        await act(async () => {
            for (let i = 0; i < 10; i++) await Promise.resolve();
        });

        expect(screen.getByText('Código no encontrado.')).toBeInTheDocument();
        expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(redirectMock).toHaveBeenCalledWith('/urls/create');

        vi.useRealTimers();
    });
});

