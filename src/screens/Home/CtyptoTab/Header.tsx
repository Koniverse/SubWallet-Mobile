import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { MagnifyingGlass, SlidersHorizontal } from 'phosphor-react-native';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import { getNetworkLogo, tokenDisplayNameMap, toShort } from 'utils/index';
import { AccountInfoByNetwork } from 'types/ui-types';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  currentView: string;
  currentTgKey: string;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  selectedNetworkInfo?: AccountInfoByNetwork;
  selectedTokenDisplayName: string;
  onPressSearchButton?: () => void;
  onPressBack: () => void;
}

const chainDetailHeaderStyle: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const chainDetailHeaderTitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

const tokenHistoryHeaderStyle: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const tokenHistoryHeaderTitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

function getTokenGroupDisplayName(tgKey: string) {
  const [symbol] = tgKey.split('|');
  return tokenDisplayNameMap[symbol] || symbol.toUpperCase();
}

const renderChainDetailHeaderContent = (selectedNetworkInfo: AccountInfoByNetwork) => {
  return () => {
    return (
      <View style={chainDetailHeaderStyle}>
        {getNetworkLogo(selectedNetworkInfo.networkKey, 20)}
        <Text style={chainDetailHeaderTitleStyle} numberOfLines={1}>
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
};

const renderTokenHistoryHeaderContent = (
  selectedNetworkInfo: AccountInfoByNetwork,
  selectedTokenDisplayName: string,
) => {
  return () => {
    return (
      <View style={tokenHistoryHeaderStyle}>
        {getNetworkLogo(selectedNetworkInfo.networkKey, 20)}
        <Text style={tokenHistoryHeaderTitleStyle} numberOfLines={1}>
          {selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '')}
        </Text>
        <Text
          style={{
            ...sharedStyles.mediumText,
            ...FontSemiBold,
            color: ColorMap.light,
            paddingLeft: 4,
          }}>
          {`(${selectedTokenDisplayName})`}
        </Text>
      </View>
    );
  };
};

const CryptoTabHeader = ({
  currentView,
  navigation,
  onPressSearchButton,
  onPressBack,
  currentTgKey,
  selectedNetworkInfo,
  selectedTokenDisplayName,
}: Props) => {
  return (
    <>
      {currentView === ViewStep.TOKEN_GROUPS && (
        <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />
      )}
      {currentView === ViewStep.TOKEN_GROUP_DETAIL && (
        <SubHeader
          showRightBtn
          backgroundColor={ColorMap.dark2}
          rightIcon={MagnifyingGlass}
          onPressRightIcon={onPressSearchButton}
          onPressBack={onPressBack}
          title={getTokenGroupDisplayName(currentTgKey)}
        />
      )}
      {currentView === ViewStep.CHAIN_DETAIL && selectedNetworkInfo && (
        <SubHeader
          showRightBtn
          backgroundColor={ColorMap.dark2}
          disableRightButton={true}
          rightIcon={SlidersHorizontal}
          onPressRightIcon={onPressSearchButton}
          onPressBack={onPressBack}
          headerContent={renderChainDetailHeaderContent(selectedNetworkInfo)}
          title={''}
        />
      )}
      {currentView === ViewStep.TOKEN_HISTORY && selectedNetworkInfo && (
        <SubHeader
          showRightBtn
          backgroundColor={ColorMap.dark2}
          onPressBack={onPressBack}
          headerContent={renderTokenHistoryHeaderContent(selectedNetworkInfo, selectedTokenDisplayName)}
          title={''}
        />
      )}
    </>
  );
};

export default CryptoTabHeader;
