import React from 'react';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { Linking, View } from 'react-native';
import { ArrowCircleRight, Warning, XCircle } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onPressBtn: () => void;
}

const WarningModal = ({ visible, setVisible, onPressBtn }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);

  return (
    <SwModal
      isUseModalV2={true}
      setVisible={setVisible}
      modalVisible={visible}
      disabledOnPressBackDrop
      modalTitle={'Unstake your DOT now!'}
      titleTextAlign={'center'}
      isAllowSwipeDown={false}>
      <View style={{ width: '100%' }}>
        <View style={{ paddingVertical: theme.padding, alignItems: 'center', gap: theme.padding }}>
          <PageIcon icon={Warning} color={theme.colorWarning} />
          <Typography.Text
            style={{
              color: theme.colorTextTertiary,
              ...FontMedium,
              paddingHorizontal: theme.padding,
              textAlign: 'center',
            }}>
            You’re dual staking via both direct nomination and nomination pool, which{' '}
            <Typography.Text style={{ fontWeight: '700' }}>{'will not be supported'}</Typography.Text> in the upcoming
            Polkadot runtime upgrade. Read more to learn about the upgrade, and{' '}
            <Typography.Text
              style={{ color: theme.colorLink, textDecorationLine: 'underline' }}
              onPress={() =>
                Linking.openURL('https://docs.subwallet.app/main/mobile-app-user-guide/manage-staking/unstake')
              }>
              unstake your DOT
            </Typography.Text>{' '}
            from one of the methods to avoid issues
          </Typography.Text>
        </View>

        <View style={_style.footerAreaStyle}>
          <Button
            type={'secondary'}
            style={{ flex: 1 }}
            onPress={onPressBtn}
            icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}>
            {'Dismiss'}
          </Button>

          <Button
            style={{ flex: 1 }}
            onPress={() => {
              onPressBtn();
              Linking.openURL(
                'https://support.polkadot.network/support/solutions/articles/65000188140-changes-for-nomination-pool-members-and-opengov-participation',
              );
            }}
            icon={<Icon phosphorIcon={ArrowCircleRight} size={'lg'} weight={'fill'} />}>
            {'Read more'}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default WarningModal;
