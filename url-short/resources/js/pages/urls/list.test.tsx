import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import UrlsList from './list';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
}));

describe('UrlsList', () => {
    it('renderiza filas cuando el endpoint responde data', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
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
});

