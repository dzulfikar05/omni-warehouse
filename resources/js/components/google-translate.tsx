import React, { useEffect } from 'react';

declare global {
    interface Window {
        google?: any;
        googleTranslateElementInit?: () => void;
    }
}

export default function GoogleTranslate() {
    useEffect(() => {
        // 1. Definisikan fungsi callback global jika belum ada
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = () => {
                if (window.google && window.google.translate) {
                    // Cek apakah elemen wadah sudah ada di DOM sebelum diinisialisasi
                    const container = document.getElementById('google_translate_element');
                    if (container && container.innerHTML === '') {
                        new window.google.translate.TranslateElement(
                            {
                                pageLanguage: 'en', // Set ke 'en' agar opsi bahasa Indonesia & Inggris konsisten muncul
                                includedLanguages: 'id,en',
                                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                                autoDisplay: false,
                            },
                            'google_translate_element'
                        );
                    }
                }
            };
        }

        // 2. Muat script Google Translate jika belum dimuat di dokumen
        let script = document.getElementById('google-translate-script') as HTMLScriptElement;
        if (!script) {
            script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Jika script sudah ada, panggil ulang inisialisasi jika elemen kosong
            if (window.google && window.google.translate) {
                window.googleTranslateElementInit();
            }
        }
    }, []);

    return (
        <div className="flex items-center notranslate">
            {/* Wadah widget Google Translate */}
            <div id="google_translate_element" className="scale-90 origin-left" />
        </div>
    );
}