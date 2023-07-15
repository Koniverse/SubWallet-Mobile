export interface LanguageOption {
  text: string;
  value: string;
}

export default function getLanguageOptions(): LanguageOption[] {
  return [
    // default/native
    {
      text: 'English',
      value: 'en',
    },
    {
      text: 'Vietnamese',
      value: 'vi',
    },
    {
      text: 'Chinese',
      value: 'zh',
    },
    {
      text: 'Français',
      value: 'fr',
    },
    {
      text: 'Türkce',
      value: 'tr',
    },
    {
      text: 'Polski',
      value: 'pl',
    },
    {
      text: 'ภาษาไทย',
      value: 'th',
    },
    {
      text: 'اردو',
      value: 'ur',
    },
  ];
}
