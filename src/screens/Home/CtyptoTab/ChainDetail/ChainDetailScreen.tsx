import React from 'react';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainDetail/TokensTab';
import { StyleProp, Text, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SlidersHorizontal } from 'phosphor-react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { HistoryTab } from 'screens/Home/CtyptoTab/ChainDetail/HistoryTab';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { getTotalConvertedBalanceValue } from 'screens/Home/CtyptoTab/utils';

interface Props {
  onPressBack: () => void;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressSendFundBtn: () => void;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
  ) => void;
}

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingTop: 21,
};

const chainDetailHeader: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const chainDetailHeaderTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

const ROUTES = [
  { key: 'tokens', title: 'Tokens' },
  { key: 'history', title: 'History' },
];

export const ChainDetailScreen = ({
  onPressBack,
  onShoHideReceiveModal,
  receiveModalVisible,
  selectedNetworkInfo,
  selectedBalanceInfo,
  onPressTokenItem,
  onPressSendFundBtn,
}: Props) => {
  const renderHeaderContent = () => {
    return (
      <View style={chainDetailHeader}>
        {getNetworkLogo(selectedNetworkInfo.networkKey, 20)}
        <Text style={chainDetailHeaderTitle} numberOfLines={1}>
          {selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '')}
        </Text>
        <Text
          style={{
            ...sharedStyles.mainText,
            ...FontMedium,
            color: ColorMap.disabled,
            paddingLeft: 4,
          }}>
          {`(${toShort(selectedNetworkInfo.address, 4, 4)})`}
        </Text>
      </View>
    );
  };

  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'history':
        return <HistoryTab />;
      case 'tokens':
      default:
        return (
          <TokensTab
            selectedNetworkInfo={selectedNetworkInfo}
            selectedBalanceInfo={selectedBalanceInfo}
            onPressTokenItem={onPressTokenItem}
          />
        );
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
          <BalanceVal value={getTotalConvertedBalanceValue(selectedBalanceInfo)} startWithSymbol symbol={'$'} />

          <ActionButtonContainer onPressSendFundBtn={onPressSendFundBtn} openReceiveModal={() => onShoHideReceiveModal(true)} />
        </View>

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </ContainerWithSubHeader>
  );
};
