import type { SupportedLanguage } from '@algoviz/core/types';

interface LanguageOption {
  label: string;
  value: SupportedLanguage;
  enabled: boolean;
}

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

const languages: LanguageOption[] = [
  { label: 'Python', value: 'python', enabled: true },
  { label: 'JavaScript', value: 'javascript', enabled: true },
  { label: 'Java', value: 'java', enabled: true },
  { label: 'C#', value: 'csharp', enabled: true },
];

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector" role="tablist" aria-label="Language">
      {languages.map((language) => (
        <button
          aria-selected={value === language.value}
          className={languageButtonClass(language, value)}
          disabled={!language.enabled}
          key={language.value}
          onClick={() => onChange(language.value)}
          role="tab"
          title={language.enabled ? language.label : 'Coming soon'}
          type="button"
        >
          {language.label}
          {!language.enabled ? <span className="language-selector__tooltip">Coming soon</span> : null}
        </button>
      ))}
    </div>
  );
}

function languageButtonClass(language: LanguageOption, active: SupportedLanguage): string {
  if (!language.enabled) {
    return 'language-selector__tab language-selector__tab--disabled';
  }

  if (language.value === active) {
    return 'language-selector__tab language-selector__tab--active';
  }

  return 'language-selector__tab';
}
