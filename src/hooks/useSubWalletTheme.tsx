import { useContext } from 'react';
import { ThemeContext } from 'providers/contexts';

export const useSubWalletTheme = () => {
  return useContext(ThemeContext);
};
