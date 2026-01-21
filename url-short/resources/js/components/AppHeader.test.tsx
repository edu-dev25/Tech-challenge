import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
    it('renderiza links a Create, List y Swagger', () => {
        window.history.pushState({}, '', '/urls/create');

        render(<AppHeader />);

        const create = screen.getByRole('link', { name: 'Create' });
        const list = screen.getByRole('link', { name: 'List' });
        const swagger = screen.getByRole('link', { name: 'Swagger' });

        expect(create).toHaveAttribute('href', '/urls/create');
        expect(list).toHaveAttribute('href', '/urls/list');
        expect(swagger).toHaveAttribute('href', '/docs');

        expect(swagger).toHaveAttribute('target', '_blank');
        expect(swagger).toHaveAttribute('rel', 'noreferrer');
    });

    it('marca como activo el link que corresponde al pathname actual', () => {
        window.history.pushState({}, '', '/urls/list');

        render(<AppHeader />);

        const create = screen.getByRole('link', { name: 'Create' });
        const list = screen.getByRole('link', { name: 'List' });
        const swagger = screen.getByRole('link', { name: 'Swagger' });

        expect(list).toHaveAttribute('aria-current', 'page');
        expect(create).not.toHaveAttribute('aria-current');
        expect(swagger).not.toHaveAttribute('aria-current');
    });
});

