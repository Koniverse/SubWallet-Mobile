import { useContext } from 'react';
import { ThemeContext } from 'providers/contexts';

export function useSubWalletTheme() {
  return useContext(ThemeContext);
}
