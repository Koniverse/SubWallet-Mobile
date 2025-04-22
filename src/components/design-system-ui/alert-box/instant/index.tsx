import React, { useMemo } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { Typography } from 'components/design-system-ui';
import { FAQ_URL } from 'constants/index';

interface Props {
  type: 'new-address-format';
}

const AlertBoxInstant: React.FC<Props> = ({ type }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  if (type === 'new-address-format') {
    return (
      <AlertBox
        title={'New address format'}
        type={'info'}
        description={
          <Typography.Text>
            <Typography.Text>
              {
                'This network has 2 address formats, a Legacy format and a New format that starts with 1. SubWallet automatically transforms Legacy formats into New one without affecting your transfer.'
              }
            </Typography.Text>
            <Typography.Text onPress={() => Linking.openURL(FAQ_URL)} style={styles.highlightText}>
              {'Learn more'}
            </Typography.Text>
          </Typography.Text>
        }
      />
    );
  }
  return null;
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    highlightText: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
  });
}

export default AlertBoxInstant;
