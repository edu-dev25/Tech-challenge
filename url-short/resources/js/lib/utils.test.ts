import { describe, expect, it } from 'vitest';

import { getCsrfToken } from './utils';

describe('getCsrfToken', () => {
    it('returns empty string when meta tag is missing', () => {
        document.head.innerHTML = '';
        expect(getCsrfToken()).toBe('');
    });

    it('returns meta csrf-token content when present', () => {
        document.head.innerHTML = '<meta name="csrf-token" content="test-csrf" />';
        expect(getCsrfToken()).toBe('test-csrf');
    });
});

