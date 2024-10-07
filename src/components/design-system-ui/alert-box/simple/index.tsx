import { Info } from 'phosphor-react-native';
import AlertBoxBase from '../base';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';

interface Props {
  type?: 'info' | 'warning' | 'error';
  title: string;
  description: React.ReactNode;
  wrapperStyle?: ViewStyle;
}

interface ColorText {
  iconColor: string;
  titleColor: string;
}

const AlertBox: React.FC<Props> = (props: Props) => {
  const { description, type = 'info', title, wrapperStyle } = props;

  const theme = useSubWalletTheme().swThemes;

  const colors = useMemo((): ColorText => {
    switch (type) {
      case 'error':
        return {
          iconColor: theme.colorError,
          titleColor: theme.colorError,
        };
      case 'warning':
        return {
          iconColor: theme.colorWarning,
          titleColor: theme.colorWarning,
        };
      case 'info':
      default:
        return {
          iconColor: theme.colorPrimary,
          titleColor: theme.colorTextBase,
        };
    }
  }, [theme, type]);

  return (
    <AlertBoxBase
      iconColor={colors.iconColor}
      titleColor={colors.titleColor}
      title={title}
      description={description}
      icon={Info}
      wrapperStyle={wrapperStyle}
    />
  );
};

export default AlertBox;
