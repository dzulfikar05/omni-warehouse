import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useSyncExternalStore,
} from 'react';
import type { PropsWithChildren } from 'react';

import en from '@/locales/en.json';
import id from '@/locales/id.json';

export type Locale = 'id' | 'en';

type LanguageContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (text: string) => string;
};

const storageKey = 'app_locale';
const dictionaries: Record<Locale, Record<string, string>> = { en, id };
const localeSubscribers = new Set<() => void>();

const LanguageContext = createContext<LanguageContextValue | undefined>(
    undefined,
);

function isLocale(value: string | null): value is Locale {
    return value === 'id' || value === 'en';
}

function subscribeToLocale(listener: () => void) {
    localeSubscribers.add(listener);
    window.addEventListener('storage', listener);

    return () => {
        localeSubscribers.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

function getLocaleSnapshot(): Locale {
    const storedLocale = window.localStorage.getItem(storageKey);

    return isLocale(storedLocale) ? storedLocale : 'id';
}

function getServerLocaleSnapshot(): Locale {
    return 'id';
}

export function LanguageProvider({ children }: PropsWithChildren) {
    const locale = useSyncExternalStore(
        subscribeToLocale,
        getLocaleSnapshot,
        getServerLocaleSnapshot,
    );

    useEffect(() => {
        const secureAttribute =
            window.location.protocol === 'https:' ? ';Secure' : '';

        document.cookie = `${storageKey}=${locale};path=/;max-age=31536000;SameSite=Lax${secureAttribute}`;
    }, [locale]);

    const setLocale = useCallback((nextLocale: Locale) => {
        window.localStorage.setItem(storageKey, nextLocale);
        const secureAttribute =
            window.location.protocol === 'https:' ? ';Secure' : '';

        document.cookie = `${storageKey}=${nextLocale};path=/;max-age=31536000;SameSite=Lax${secureAttribute}`;

        for (const listener of localeSubscribers) {
            listener();
        }
    }, []);

    const t = useCallback(
        (text: string) =>
            Object.hasOwn(dictionaries[locale], text)
                ? dictionaries[locale][text]
                : text,
        [locale],
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            'useTranslation must be used within a LanguageProvider.',
        );
    }

    return context;
}
