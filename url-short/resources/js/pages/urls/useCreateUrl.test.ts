import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateUrl } from './useCreateUrl';

describe('useCreateUrl', () => {
    it('inicializa con URL vacía e inválida', () => {
        const { result } = renderHook(() => useCreateUrl());

        expect(result.current.originalUrl).toBe('');
        expect(result.current.isValidUrl).toBe(false);
        expect(result.current.isInvalidUrl).toBe(false);
    });

    it('marca inválida cuando hay texto pero no es URL', () => {
        const { result } = renderHook(() => useCreateUrl());

        act(() => {
            result.current.setOriginalUrl('no-es-url');
        });

        expect(result.current.isValidUrl).toBe(false);
        expect(result.current.isInvalidUrl).toBe(true);
    });

    it('marca válida solo para http/https', () => {
        const { result } = renderHook(() => useCreateUrl());

        act(() => {
            result.current.setOriginalUrl('https://example.com');
        });
        expect(result.current.isValidUrl).toBe(true);
        expect(result.current.isInvalidUrl).toBe(false);

        act(() => {
            result.current.setOriginalUrl('ftp://example.com');
        });
        expect(result.current.isValidUrl).toBe(false);
        expect(result.current.isInvalidUrl).toBe(true);
    });

    it('submitUrl no hace fetch si la URL es inválida', async () => {
        const fetchMock = vi.fn();
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        const { result } = renderHook(() => useCreateUrl());
        act(() => {
            result.current.setOriginalUrl('no-es-url');
        });

        const out = await result.current.submitUrl();

        expect(out).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('submitUrl hace POST /urls con CSRF y body correcto cuando es válida', async () => {
        document.head.innerHTML = '<meta name="csrf-token" content="test-csrf" />';

        const fetchMock = vi.fn().mockResolvedValue({
            status: 201,
            json: async () => ({ ok: true }),
        });
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const { result } = renderHook(() => useCreateUrl());
        act(() => {
            result.current.setOriginalUrl('https://example.com');
        });

        const out = await result.current.submitUrl();

        expect(fetchMock).toHaveBeenCalledWith('/urls', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': 'test-csrf',
            },
            body: JSON.stringify({ original_url: 'https://example.com' }),
        });

        expect(logSpy).toHaveBeenCalledWith('POST /urls status:', 201);
        expect(logSpy).toHaveBeenCalledWith('Response:', { ok: true });
        expect(out?.data).toEqual({ ok: true });
    });
});

