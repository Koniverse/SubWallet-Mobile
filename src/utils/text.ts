import { FontBold, sharedStyles } from 'styles/sharedStyles';

export const getStakingInputValueStyle = (inputValue: string) => {
  const initStyle = {
    ...sharedStyles.largeText,
    ...FontBold,
  };

  if (inputValue.length > 17) {
    return {
      ...initStyle,
      fontSize: 24,
      lineHeight: 30,
    };
  } else if (inputValue.length > 12) {
    return {
      ...initStyle,
      fontSize: 32,
      lineHeight: 38,
    };
  } else if (inputValue.length > 9) {
    return {
      ...initStyle,
      fontSize: 36,
      lineHeight: 42,
    };
  }

  return {
    ...initStyle,
  };
};
