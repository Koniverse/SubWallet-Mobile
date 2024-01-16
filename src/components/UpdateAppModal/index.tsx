import React from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { Linking, ScrollView, View } from 'react-native';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { deviceHeight } from 'constants/index';
import MetaInfo from 'components/MetaInfo';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  updateAppData: { title: string; data: string }[];
  onPressUpdate: () => void;
  onPressCancel: () => void;
}

const UpdateAppModal = ({ visible, setVisible, updateAppData, onPressUpdate, onPressCancel }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);

  return (
    <SwModal
      modalTitle={'New version available'}
      isUseModalV2={true}
      setVisible={setVisible}
      modalVisible={visible}
      disabledOnPressBackDrop
      isAllowSwipeDown={false}>
      <View style={{ width: '100%' }}>
        <ScrollView
          style={{ height: deviceHeight * 0.6, marginBottom: theme.padding }}
          contentContainerStyle={{ gap: theme.paddingXS }}
          showsVerticalScrollIndicator={false}>
          {updateAppData.map((item, index) => (
            <MetaInfo hasBackgroundWrapper key={index}>
              <MetaInfo.Text label={'Release version'} value={item.title} />
              <MetaInfo.Data label={'Change log:'}>{item.data}</MetaInfo.Data>
            </MetaInfo>
          ))}
          <View>
            <Typography.Text style={{ color: theme.colorWhite }}>{'Pre-version'}</Typography.Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography.Text style={{ color: theme.colorTextTertiary }}>
                {'Please see our releases '}
                <Typography.Text
                  style={{ textDecorationLine: 'underline', color: theme.colorPrimary }}
                  onPress={() => Linking.openURL('https://github.com/Koniverse/SubWallet-Mobile/releases')}>
                  {'Github page'}
                </Typography.Text>
                {' for a full list of changes of old releases'}
              </Typography.Text>
            </View>
          </View>
        </ScrollView>

        <View style={_style.footerAreaStyle}>
          <Button
            type={'secondary'}
            style={{ flex: 1 }}
            onPress={onPressCancel}
            icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}>
            {i18n.buttonTitles.cancel}
          </Button>
          <Button
            onPress={onPressUpdate}
            style={{ flex: 1 }}
            icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}>
            {'Update'}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default UpdateAppModal;
