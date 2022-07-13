import React from 'react';
import { HorizontalTabView } from 'components/HorizontalTabView';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainDetail/TokensTab';
import { StyleProp, Text, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SlidersHorizontal } from 'phosphor-react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { AccountInfoByNetwork, BalanceContainerType } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import BigN from 'bignumber.js';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';

interface Props {
  onPressBack: () => void;
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
  ) => void;
  balanceContainerProps: BalanceContainerType;
}

const containerStyle: StyleProp<any> = {
  paddingBottom: 0,
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
  selectedNetworkInfo,
  selectedBalanceInfo,
  onPressTokenItem,
  balanceContainerProps,
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
          {`(${toShort(selectedNetworkInfo.formattedAddress, 4, 4)})`}
        </Text>
      </View>
    );
  };

  // @ts-ignore
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'history':
        return <HistoryTab networkKey={selectedNetworkInfo.networkKey} />;
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
      style={containerStyle}
      onPressRightIcon={() => {}}>
      <>
        <BalanceBlock {...balanceContainerProps} />

        <HorizontalTabView routes={ROUTES} renderScene={renderScene} />
      </>
    </ContainerWithSubHeader>
  );
};
