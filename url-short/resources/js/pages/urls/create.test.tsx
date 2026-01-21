import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UrlsCreate from './create';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
}));

const useCreateUrlMock = vi.fn();
vi.mock('./useCreateUrl', () => ({
    useCreateUrl: () => useCreateUrlMock(),
}));

describe('UrlsCreate', () => {
    it('renderiza input y botón según el estado del hook', () => {
        const submitUrl = vi.fn();
        const setOriginalUrl = vi.fn();

        useCreateUrlMock.mockReturnValue({
            originalUrl: '',
            setOriginalUrl,
            submitUrl,
            isInvalidUrl: false,
            isValidUrl: false,
        });

        render(<UrlsCreate />);

        expect(screen.getByLabelText(/original url/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
        expect(screen.getByText(/tip: incluye/i)).toBeInTheDocument();
    });

    it('muestra el estado inválido (input rojo + mensaje) cuando isInvalidUrl=true', () => {
        const submitUrl = vi.fn();
        const setOriginalUrl = vi.fn();

        useCreateUrlMock.mockReturnValue({
            originalUrl: 'no-es-url',
            setOriginalUrl,
            submitUrl,
            isInvalidUrl: true,
            isValidUrl: false,
        });

        render(<UrlsCreate />);

        const input = screen.getByLabelText(/original url/i);
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input.className).toContain('border-red-300');
        expect(screen.getByText(/ingresa una url válida/i)).toBeInTheDocument();
    });

    it('llama setOriginalUrl al escribir en el input', async () => {
        const user = userEvent.setup();
        const submitUrl = vi.fn();
        const setOriginalUrl = vi.fn();

        useCreateUrlMock.mockReturnValue({
            originalUrl: '',
            setOriginalUrl,
            submitUrl,
            isInvalidUrl: false,
            isValidUrl: false,
        });

        render(<UrlsCreate />);

        await user.type(screen.getByLabelText(/original url/i), 'a');
        expect(setOriginalUrl).toHaveBeenCalled();
    });

    it('al submit invoca submitUrl del hook', async () => {
        const user = userEvent.setup();
        const submitUrl = vi.fn().mockResolvedValue(null);
        const setOriginalUrl = vi.fn();

        useCreateUrlMock.mockReturnValue({
            originalUrl: 'https://example.com',
            setOriginalUrl,
            submitUrl,
            isInvalidUrl: false,
            isValidUrl: true,
        });

        render(<UrlsCreate />);

        await user.click(screen.getByRole('button', { name: /create/i }));
        expect(submitUrl).toHaveBeenCalledTimes(1);
    });
});

