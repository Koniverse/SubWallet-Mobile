import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { getNetworkLogo } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountInfoByNetwork } from 'types/ui-types';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';

interface Props {
  onPressBack: () => void;
  selectedTokenName: string;
  selectedNetworkInfo: AccountInfoByNetwork;
  balanceBlockComponent: () => JSX.Element;
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

export const TokenHistoryScreen = ({
  onPressBack,
  selectedTokenName,
  selectedNetworkInfo,
  balanceBlockComponent: BalanceBlock,
}: Props) => {
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
        <BalanceBlock />

        <View style={{ backgroundColor: ColorMap.dark1, flex: 1 }}>
          <HistoryTab networkKey={selectedNetworkInfo.networkKey} token={selectedTokenName} />
        </View>
      </>
    </ContainerWithSubHeader>
  );
};
