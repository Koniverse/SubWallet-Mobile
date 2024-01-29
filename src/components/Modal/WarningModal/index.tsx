import React from 'react';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { Linking, Text, View } from 'react-native';
import { CheckCircle, Warning, XCircle } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onPressBtn: () => void;
}

const WarningModal = ({ visible, setVisible, onPressBtn }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);
  const navigation = useNavigation<RootNavigationProps>();

  return (
    <SwModal
      isUseModalV2={true}
      setVisible={setVisible}
      modalVisible={visible}
      disabledOnPressBackDrop
      modalTitle={'Claim ASTR staking rewards'}
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
            <Text
              style={{ color: theme.colorLink, textDecorationLine: 'underline' }}
              onPress={() =>
                Linking.openURL(
                  'https://docs.astar.network/docs/learn/dapp-staking/dapp-staking-faq/#q-what-about-unclaimed-rewards',
                )
              }>
              Astar dApp staking V3
            </Text>{' '}
            is launching in early February. Make sure to claim any ASTR rewards before the launch or they will be lost.
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
              navigation.navigate('BrowserTabsManager', { url: 'https://portal.astar.network/', name: 'Astar Portal' });
            }}
            icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}>
            {'Claim now'}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default WarningModal;
