import React from 'react';
import { ReceiveModal } from 'screens/Home/CtyptoTab/ReceiveModal';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { getNetworkLogo } from 'utils/index';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceVal } from 'components/BalanceVal';
import BigN from 'bignumber.js';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';
import { BalancesVisibility } from 'components/BalancesVisibility';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  onPressBack: () => void;
  onShoHideReceiveModal: (isShowModal: boolean) => void;
  receiveModalVisible: boolean;
  selectedTokenName: string;
  selectedNetworkInfo: AccountInfoByNetwork;
  tokenBalanceValue: BigN;
  tokenConvertedValue: BigN;
  tokenHistorySymbol: string;
  onPressSendFundBtn: () => void;
}

const containerStyle: StyleProp<any> = {
  paddingBottom: 0,
};

const tokenHistoryHeader: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const tokenHistoryHeaderTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

const balanceContainer: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: '#222222',
  paddingTop: 21,
};

const convertedBalanceStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

export const TokenHistoryScreen = ({
  onPressBack,
  onShoHideReceiveModal,
  receiveModalVisible,
  selectedTokenName,
  selectedNetworkInfo,
  tokenBalanceValue,
  tokenConvertedValue,
  tokenHistorySymbol,
  onPressSendFundBtn,
}: Props) => {
  const {
    settings: { isShowBalance },
  } = useSelector((state: RootState) => state);

  const renderHeaderContent = () => {
    return (
      <View style={tokenHistoryHeader}>
        {getNetworkLogo(selectedNetworkInfo.networkKey, 20)}
        <Text style={tokenHistoryHeaderTitle} numberOfLines={1}>
          {selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '')}
        </Text>
        <Text
          style={{
            ...sharedStyles.mediumText,
            ...FontSemiBold,
            color: ColorMap.light,
            paddingLeft: 4,
          }}>
          {`(${selectedTokenName})`}
        </Text>
      </View>
    );
  };

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      backgroundColor={ColorMap.dark2}
      title={''}
      style={containerStyle}
      headerContent={renderHeaderContent}>
      <>
        <View style={balanceContainer}>
          <BalancesVisibility value={tokenBalanceValue} startWithSymbol={false} symbol={tokenHistorySymbol} />

          <View style={{ flexDirection: 'row' }}>
            <Text style={convertedBalanceStyle}>{'('}</Text>
            {isShowBalance ? (
              <BalanceVal
                value={tokenConvertedValue}
                startWithSymbol
                symbol={'$'}
                balanceValTextStyle={convertedBalanceStyle}
              />
            ) : (
              <Text style={convertedBalanceStyle}>{'******'}</Text>
            )}

            <Text style={convertedBalanceStyle}>{')'}</Text>
          </View>

          <ActionButtonContainer
            onPressSendFundBtn={onPressSendFundBtn}
            openReceiveModal={() => onShoHideReceiveModal(true)}
            style={{ paddingTop: 25 }}
          />
        </View>

        <View style={{ backgroundColor: ColorMap.dark1, flex: 1 }}>
          <HistoryTab networkKey={selectedNetworkInfo.networkKey} token={selectedTokenName} />
        </View>

        <ReceiveModal receiveModalVisible={receiveModalVisible} onChangeVisible={() => onShoHideReceiveModal(false)} />
      </>
    </ContainerWithSubHeader>
  );
};
