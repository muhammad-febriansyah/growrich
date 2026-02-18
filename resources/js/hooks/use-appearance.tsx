import { useCallback } from 'react';

export type ResolvedAppearance = 'light';
export type Appearance = ResolvedAppearance;

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = 'light';
    const resolvedAppearance: ResolvedAppearance = 'light';

    const updateAppearance = useCallback((): void => {
        // No-op: Dark mode is disabled
    }, []);

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
