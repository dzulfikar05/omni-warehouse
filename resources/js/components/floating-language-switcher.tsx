import { LanguageDropdown } from '@/components/language-dropdown';

export default function FloatingLanguageSwitcher() {
    return (
        <div className="fixed bottom-5 left-5 z-40 rounded-xl bg-background/90 p-1 shadow-lg backdrop-blur-md">
            <LanguageDropdown />
        </div>
    );
}
