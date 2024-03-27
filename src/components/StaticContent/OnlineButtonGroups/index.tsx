import React, { useCallback } from 'react';
import { Button } from 'components/design-system-ui';
import { View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AppContentButton } from 'types/staticContent';

interface Props {
  buttons: AppContentButton[];
  onPressButton?: (url?: string) => void;
}

export const OnlineButtonGroups = ({ buttons, onPressButton }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const renderItem = useCallback(
    (button: AppContentButton) => {
      return (
        <Button
          key={button.id}
          block
          type={button.color}
          onPress={() => onPressButton && onPressButton(button.action?.url)}>
          {button.label}
        </Button>
      );
    },
    [onPressButton],
  );

  return (
    <View style={{ flexDirection: 'row', gap: theme.sizeSM, marginTop: theme.size }}>
      {buttons.map(btn => renderItem(btn))}
    </View>
  );
};
