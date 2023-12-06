import { SwModal, Button, Icon, Typography } from 'components/design-system-ui';
import { deviceHeight } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Aperture, CheckCircle, Coins, Eye, PlusCircle, ThumbsUp } from 'phosphor-react-native';
import { View, Text, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export function InstructionModal({ setDetailModalVisible, modalRef, modalVisible, modalTitle, onPressStake }) {
  const theme = useSubWalletTheme().swThemes;
  const footer = () => {
    return (
      <View style={{ marginTop: theme.margin }}>
        <Button
          style={{ width: '100%' }}
          type={'primary'}
          onPress={onPressStake}
          icon={<Icon phosphorIcon={PlusCircle} weight="fill" size={'lg'} iconColor={theme.colorWhite} />}>
          Stake
        </Button>
      </View>
    );
  };
  return (
    <>
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
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: deviceHeight * 0.55 }}>
          {[
            {
              icon: Aperture,
              color: 'rgba(230, 71, 142, 1)',
              id: 'ins_1',
              title: 'Mint an NFT before staking',
              content:
                "If you're participating in the Coinbase - Vara quests, be sure to mint an NFT before staking to qualify for Coinbase rewards.",
            },
            {
              icon: Coins,
              color: 'rgba(230, 220, 37, 1)',
              id: 'state_2',
              title: 'Unstake and withdraw',
              content:
                'Once staked, your funds will be locked. Unstake your funds anytime and withdraw after a 7-day period. Keep in mind that these actions are not automated and will incur network fees.',
            },
            {
              icon: CheckCircle,
              color: 'rgba(76, 234, 172, 1)',
              id: 'state_3',
              title: 'Keep your free balance',
              content:
                'Ensure that your free balance (transferrable balance) includes a minimum of 12 VARA to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals.',
            },
            {
              icon: Eye,
              color: 'rgba(78, 180, 242, 1)',
              id: 'state_4',
              title: 'Track your stake',
              content: 'Keep an eye on your stake periodically, as rewards and staking status can fluctuate over time.',
            },
            {
              icon: ThumbsUp,
              color: 'rgba(170, 218, 98, 1)',
              id: 'state_5',
              title: 'Select active pool',
              content:
                'It is recommended that you select an active pool. Check out the list of active pools in our FAQ.',
            },
          ].map(item => (
            <InstructionItem {...item} key={item.id} />
          ))}
        </ScrollView>
        <Typography.Text
          style={{
            color: theme.colorTextSecondary,
            fontSize: 14,
            textAlign: 'center',
            marginTop: 16,
            marginHorizontal: 20,
          }}>
          For more information and staking instructions, read{' '}
          <Text
            onPress={() => {
              Linking.openURL(
                'https://subwallet.notion.site/subwallet/Coinbase-VARA-Quests-FAQs-855c4425812046449125e1f7805e6a16',
              );
            }}
            style={{ color: 'rgba(0, 75, 255, 1)' }}>
            this FAQ.
          </Text>
        </Typography.Text>
      </SwModal>
    </>
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
