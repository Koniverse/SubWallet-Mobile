import { Icon, Typography } from 'components/design-system-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TextStyle, View } from 'react-native';
import { Timer } from 'phosphor-react-native';

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

  const textColor = useMemo(() => {
    if (quoteCountdownTime <= 10) {
      return theme.colorError;
    }

    return theme.colorWarning;
  }, [quoteCountdownTime, theme.colorError, theme.colorWarning]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
      <Icon phosphorIcon={Timer} weight={'fill'} iconColor={textColor} size={'xxs'} />
      <Typography.Text
        style={[
          { color: textColor, fontSize: theme.sizeSM, lineHeight: theme.fontSizeSM },
          style,
        ]}>{`${quoteCountdownTime}s`}</Typography.Text>
    </View>
  );
};
