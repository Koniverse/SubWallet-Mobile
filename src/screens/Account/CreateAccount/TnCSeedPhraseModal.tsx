import { SwModal, Button, Icon, Typography, Image } from 'components/design-system-ui';
import { deviceHeight } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Aperture, CheckCircle, Coins, Eye, PlusCircle, ThumbsUp } from 'phosphor-react-native';
import { View, Text, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export function TnCSeedPhraseModal({ setDetailModalVisible, modalRef, modalVisible, modalTitle, onPressContinue }) {
  const theme = useSubWalletTheme().swThemes;
  const footer = () => {
    return (
      <View style={{ marginTop: theme.margin }}>
        <Button style={{ width: '100%' }} type={'primary'} onPress={onPressContinue}>
          Continue
        </Button>
      </View>
    );
  };
  return (
    <SwModal
      isUseModalV2
      setVisible={setDetailModalVisible}
      modalBaseV2Ref={modalRef}
      level={3}
      modalVisible={modalVisible}
      modalTitle={modalTitle}
      titleTextAlign="center"
      titleStyle={{ textAlign: 'center' }}
      isAllowSwipeDown={false}
      // onBackButtonPress={_onCloseDetailModal}
      footer={footer()}
      modalStyle={{ maxHeight: '90%' }}>
      <Image src={''} />
      <Typography.Title>This secret phrase is the master key to your wallet</Typography.Title>
      <Typography.Text>
        Tap on all checkboxes to confirm you understand the importance of your secret phrase
      </Typography.Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: deviceHeight * 0.55 }}>
        {[
          {
            icon: CheckCircle,
            color: 'rgba(230, 71, 142, 1)',
            title: 'Trust Wallet does not keep a copy of your secret phrase',
          },
          {
            icon: CheckCircle,
            color: 'rgba(230, 220, 37, 1)',
            title: 'Saving this digitally in plain text is NOT recommended. Examples include screenshots, text files, or emailing yourself',
          },
          {
            icon: CheckCircle,
            color: 'rgba(76, 234, 172, 1)',
            title: 'Write down your secret phrase and store it in a secure offline location!',
          },
        ].map(item => (
          <InstructionItem {...item} />
        ))}
      </ScrollView>
    </SwModal>
  );
}

function InstructionItem({ icon, color, title, content }) {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View
      style={{
        backgroundColor: 'rgba(26, 26, 26, 1)',
        borderRadius: theme.borderRadius,
        padding: 14,
        marginBottom: theme.marginXS,
        flexDirection: 'row',
      }}>
      <View style={{ justifyContent: 'center', paddingRight: 10 }}>
        <Icon phosphorIcon={icon} iconColor={color} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Typography.Title style={{ color: 'white' }}>{title}</Typography.Title>
        <Typography.Text style={{ color: theme.colorTextSecondary, width: '100%' }}>{content}</Typography.Text>
      </View>
    </View>
  );
}
