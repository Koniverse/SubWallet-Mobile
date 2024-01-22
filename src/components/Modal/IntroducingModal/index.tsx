import React from 'react';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { View } from 'react-native';
import { CheckCircle, Vault, XCircle } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { mmkvStore } from 'utils/storage';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const IntroducingModal = ({ visible, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);
  const navigation = useNavigation<RootNavigationProps>();

  return (
    <SwModal
      isUseModalV2={true}
      setVisible={setVisible}
      modalVisible={visible}
      disabledOnPressBackDrop
      modalTitle={'Introducing Earning feature'}
      titleTextAlign={'center'}
      isAllowSwipeDown={false}>
      <View style={{ width: '100%' }}>
        <View style={{ paddingVertical: theme.padding, alignItems: 'center', gap: theme.padding }}>
          <PageIcon icon={Vault} color={theme['green-7']} />
          <Typography.Text
            style={{
              color: theme.colorTextTertiary,
              ...FontMedium,
              paddingHorizontal: theme.padding,
              textAlign: 'center',
            }}>
            SubWallet's <Typography.Text style={{ color: theme.colorWhite }}>Staking</Typography.Text> feature has been
            updated to become <Typography.Text style={{ color: theme.colorWhite }}>Earning</Typography.Text> feature.
            Now, you can earn yield with native staking, liquid staking, lending, and staking dApp on SubWallet.
          </Typography.Text>
        </View>

        <View style={_style.footerAreaStyle}>
          <Button
            type={'secondary'}
            style={{ flex: 1 }}
            onPress={() => {
              mmkvStore.set('isOpenIntroductionFirstTime', true);
              setVisible(false);
            }}
            icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}>
            {'Dismiss'}
          </Button>

          <Button
            style={{ flex: 1 }}
            onPress={() => {
              mmkvStore.set('isOpenIntroductionFirstTime', true);
              setVisible(false);
              navigation.navigate('Home', {
                screen: 'Main',
                params: { screen: 'Earning', params: { screen: 'EarningList', params: { step: 1 } } },
              });
            }}
            icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}>
            {'Earn now'}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default IntroducingModal;
