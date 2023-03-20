import { Theme } from '@react-navigation/native';
import swThemes from './swThemes';

export type ThemeTypes = typeof swThemes & { [key: string]: any };
export interface SWTheme extends Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    notification_success: string;
    notification_warning: string;
    notification_danger: string;
    textColor: string;
    textColor2: string;
    subTextColor: string;
    warningBackgroundColor: string;
    dangerBackgroundColor: string;
    inputBackground: string;
    checkBoxBorderColor: string;
    background2: string;
  };
  swThemes: ThemeTypes;
}

export const THEME_PRESET: Record<string, SWTheme> = {
  dark: {
    dark: true,
    colors: {
      primary: '#42C59A',
      secondary: '#004BFF',
      background: '#161616',
      card: 'rgb(18, 18, 18)',
      text: 'rgb(229, 229, 231)',
      border: '#222222',
      notification: 'rgba(0, 0, 0, 0.8)',
      notification_success: 'rgba(66, 197, 154, 0.8)',
      notification_warning: 'rgba(240, 189, 24, 0.8)',
      notification_danger: '#F5000E',
      textColor: '#FFF',
      textColor2: '#999999',
      subTextColor: '#DDD',
      warningBackgroundColor: 'rgba(231, 185, 23, 0.2)',
      dangerBackgroundColor: 'rgba(175, 17, 17, 0.25)',
      inputBackground: '#262C4A',
      checkBoxBorderColor: '#2D365C',
      background2: '#222',
    },
    swThemes,
  },
  light: {
    dark: false,
    colors: {
      primary: '#42C59A',
      secondary: '#004BFF',
      background: '#FFF',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgba(0, 0, 0, 0.8)',
      notification_success: 'rgba(66, 197, 154, 0.8)',
      notification_warning: 'rgba(240, 189, 24, 0.8)',
      notification_danger: '#F5000E',
      textColor: '#00072D',
      textColor2: '#888',
      subTextColor: '#454545',
      warningBackgroundColor: 'rgba(231, 185, 23, 0.1)',
      dangerBackgroundColor: 'rgba(175, 17, 17, 0.1)',
      inputBackground: '#F5F5F5',
      checkBoxBorderColor: '#DDD',
      background2: '#222',
    },
    swThemes,
  },
};
