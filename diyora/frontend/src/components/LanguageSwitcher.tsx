import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
    ];

    return (
        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <Globe className="w-4 h-4 text-slate-400 ml-1" />
            <div className="flex gap-1">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${i18n.language === lang.code
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-500 hover:bg-white hover:text-primary'
                            }`}
                        title={lang.name}
                    >
                        {lang.code.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};
