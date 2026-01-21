import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/navigation', () => ({
    redirectTo: vi.fn(),
}));

import { redirectTo } from '@/lib/navigation';
import { useCreateUrl } from './useCreateUrl';

describe('useCreateUrl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.head.innerHTML = '';
    });

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

        const redirectMock = vi.mocked(redirectTo);
        const fetchMock = vi.fn().mockResolvedValue({
            status: 201,
            ok: true,
            json: async () => ({ ok: true }),
        });
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const { result } = renderHook(() => useCreateUrl());
        act(() => {
            result.current.setOriginalUrl('https://example.com');
        });

        const out = await act(async () => result.current.submitUrl());

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

        expect(redirectMock).toHaveBeenCalledWith('/urls/list');
    });

    it('si el backend responde 409, expone submitError para mostrarlo bajo el input', async () => {
        document.head.innerHTML = '<meta name="csrf-token" content="test-csrf" />';

        const redirectMock = vi.mocked(redirectTo);
        const fetchMock = vi.fn().mockResolvedValue({
            status: 409,
            ok: false,
            json: async () => ({ ok: false, message: 'Esta URL ya cuenta con un registro.' }),
        });
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

        const { result } = renderHook(() => useCreateUrl());
        act(() => {
            result.current.setOriginalUrl('https://dup.test');
        });

        await act(async () => {
            await result.current.submitUrl();
        });

        expect(result.current.submitError).toBe('Esta URL ya cuenta con un registro.');
        expect(redirectMock).not.toHaveBeenCalled();
    });
});

