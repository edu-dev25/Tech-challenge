import { useMemo } from 'react';

type NavItem = {
    label: string;
    href: string;
    external?: boolean;
};

export function AppHeader() {
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const items = useMemo<NavItem[]>(
        () => [
            { label: 'Create', href: '/urls/create' },
            { label: 'List', href: '/urls/list' },
            { label: 'Swagger', href: '/docs', external: true },
        ],
        [],
    );

    return (
        <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-neutral-900">
                        URL Shortener
                    </span>
                </div>

                <nav aria-label="Primary" className="flex items-center gap-1">
                    {items.map((item) => {
                        const isActive =
                            item.external !== true && pathname === item.href;

                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                target={item.external ? '_blank' : undefined}
                                rel={item.external ? 'noreferrer' : undefined}
                                className={[
                                    'inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium',
                                    isActive
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                                    'focus:outline-none focus:ring-4 focus:ring-neutral-100',
                                ].join(' ')}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

