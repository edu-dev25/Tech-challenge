import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UrlsCreate from './create';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
}));

describe('UrlsCreate', () => {
    it('hace alert con la URL capturada', async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        render(<UrlsCreate />);

        await user.type(screen.getByLabelText(/original url/i), 'https://example.com');
        await user.click(screen.getByRole('button', { name: /create/i }));

        expect(alertSpy).toHaveBeenCalledWith('URL enviada: https://example.com');
    });
});

