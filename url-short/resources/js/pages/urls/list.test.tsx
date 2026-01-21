import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UrlsList from './list';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
}));

describe('UrlsList', () => {
    it('renderiza filas cuando el endpoint responde data', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                ok: true,
                data: [
                    { id: 1, code: 'aaaa1111', original_url: 'https://one.test' },
                    { id: 2, code: 'bbbb2222', original_url: 'https://two.test' },
                ],
            }),
        });

        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        render(<UrlsList />);

        // Header
        expect(await screen.findByText('Shortened URLs')).toBeInTheDocument();

        // Rows
        expect(await screen.findByText('aaaa1111')).toBeInTheDocument();
        expect(await screen.findByText('bbbb2222')).toBeInTheDocument();
        expect(await screen.findByText('https://one.test')).toBeInTheDocument();
        expect(await screen.findByText('https://two.test')).toBeInTheDocument();

        // Open links should point to {system origin}/{code}
        const origin = window.location.origin;
        const openLinks = screen.getAllByTitle('Open') as HTMLAnchorElement[];
        expect(openLinks.map((a) => a.getAttribute('href'))).toEqual(
            expect.arrayContaining([
                `${origin}/aaaa1111`,
                `${origin}/bbbb2222`,
            ]),
        );
    });

    it('desactiva (DELETE) y remueve la fila del UI', async () => {
        const fetchMock = vi
            .fn()
            // initial GET /urls
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ok: true,
                    data: [
                        { id: 1, code: 'aaaa1111', original_url: 'https://one.test' },
                        { id: 2, code: 'bbbb2222', original_url: 'https://two.test' },
                    ],
                }),
            })
            // DELETE /urls/aaaa1111
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ok: true,
                    data: { id: 1, code: 'aaaa1111', active: false },
                }),
            });

        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        // CSRF token meta (para el header X-CSRF-TOKEN)
        document.head.innerHTML = '<meta name="csrf-token" content="test-csrf" />';

        const user = userEvent.setup();
        render(<UrlsList />);

        expect(await screen.findByText('aaaa1111')).toBeInTheDocument();
        expect(await screen.findByText('bbbb2222')).toBeInTheDocument();

        await user.click(screen.getByLabelText('Delete aaaa1111'));

        await waitFor(() => {
            expect(screen.queryByText('aaaa1111')).not.toBeInTheDocument();
        });
        expect(screen.getByText('bbbb2222')).toBeInTheDocument();

        expect(fetchMock).toHaveBeenCalledWith(
            '/urls/aaaa1111',
            expect.objectContaining({
                method: 'DELETE',
                credentials: 'same-origin',
                headers: expect.objectContaining({
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': 'test-csrf',
                }),
            }),
        );
    });
});

