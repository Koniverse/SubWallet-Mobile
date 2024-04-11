import { Typography } from 'components/design-system-ui';
import React, { useEffect, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TextStyle } from 'react-native';

interface Props {
  quoteAliveUntilValue?: number;
  style?: TextStyle;
}

export const QuoteResetTime = ({ quoteAliveUntilValue, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [quoteCountdownTime, setQuoteCountdownTime] = useState<number>(0);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;

    if (quoteAliveUntilValue) {
      const updateQuoteCountdownTime = () => {
        const dateNow = Date.now();

        if (dateNow > quoteAliveUntilValue) {
          setQuoteCountdownTime(0);
          clearInterval(timer);
        } else {
          setQuoteCountdownTime(Math.round((quoteAliveUntilValue - dateNow) / 1000));
        }
      };

      timer = setInterval(updateQuoteCountdownTime, 1000);

      updateQuoteCountdownTime();
    } else {
      setQuoteCountdownTime(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [quoteAliveUntilValue, setQuoteCountdownTime]);

  return (
    <Typography.Text
      style={[{ color: theme.colorWarning }, style]}>{`Quote reset in: ${quoteCountdownTime}s`}</Typography.Text>
  );
};
