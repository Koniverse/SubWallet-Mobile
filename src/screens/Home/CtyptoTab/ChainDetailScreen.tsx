import React from 'react';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { TokensTab } from 'screens/Home/CtyptoTab/TokensTab';
import { StyleProp, Text, View } from 'react-native';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SlidersHorizontal } from 'phosphor-react-native';
import { getNetworkLogo } from 'utils/index';
import { HistoryTab } from 'screens/Home/CtyptoTab/HistoryTab';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props {
  onPressBack: () => void;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
}

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingTop: 21,
};

const ROUTES = [
  { key: 'tokens', title: 'Tokens' },
  { key: 'History', title: 'History' },
];

export const ChainDetailScreen = ({ onPressBack, onShoHideReceiveModal, receiveModalVisible }: Props) => {
  const renderHeaderContent = () => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {getNetworkLogo('polkadot', 20)}
        <Text style={{ ...sharedStyles.mediumText, ...FontSemiBold, color: ColorMap.light, paddingLeft: 4 }}>
          {'Polkadot'}
        </Text>
        <Text
          style={{
            ...sharedStyles.mainText,
            ...FontMedium,
            color: ColorMap.disabled,
            paddingLeft: 4,
          }}>
          {'(123123)'}
        </Text>
      </View>
    );
  };

  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'tokens':
        return <TokensTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <HistoryTab />;
    }
  };

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      backgroundColor={ColorMap.dark2}
      title={''}
      headerContent={renderHeaderContent}
      showRightBtn
      rightIcon={SlidersHorizontal}
      onPressRightIcon={() => {}}>
      <>
        <View style={balanceContainer}>
          {/*<BalancesVisibility />*/}

          <ActionButtonContainer openReceiveModal={() => onShoHideReceiveModal(true)} />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </ContainerWithSubHeader>
  );
};
