import React from 'react';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainDetail/TokensTab';
import { StyleProp, Text, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SlidersHorizontal } from 'phosphor-react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
import { getTotalConvertedBalanceValue } from 'screens/Home/CtyptoTab/utils';
import { MaterialTabBar, MaterialTabBarProps, Tabs } from 'react-native-collapsible-tab-view';

interface Props {
  onPressBack: () => void;
  selectedNetworkInfo: AccountInfoByNetwork;
  onPressTokenItem: (tokenName: string, tokenSymbol: string) => void;
  networkBalanceMaps: Record<string, BalanceInfo>;
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

export const ChainDetailScreen = ({
  onPressBack,
  selectedNetworkInfo,
  onPressTokenItem,
  networkBalanceMaps,
}: Props) => {
  const currentBalanceInfo = networkBalanceMaps[selectedNetworkInfo.networkKey];
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

  const renderTabBar = (props: MaterialTabBarProps<any>) => (
    <MaterialTabBar
      {...props}
      activeColor={ColorMap.light}
      inactiveColor={ColorMap.light}
      indicatorStyle={{ backgroundColor: ColorMap.light, marginHorizontal: 16 }}
      tabStyle={{ backgroundColor: ColorMap.dark2 }}
      style={{ backgroundColor: ColorMap.dark2 }}
      labelStyle={{ ...sharedStyles.mediumText, ...FontSemiBold }}
    />
  );

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      backgroundColor={ColorMap.dark2}
      title={''}
      headerContent={renderHeaderContent}
      showRightBtn
      statusBarColor={ColorMap.dark2}
      rightIcon={SlidersHorizontal}
      style={containerStyle}
      disableRightButton={true}
      onPressRightIcon={() => {}}>
      <Tabs.Container
        lazy
        allowHeaderOverscroll={true}
        renderTabBar={renderTabBar}
        renderHeader={() => {
          return (
            <BalanceBlock
              balanceValue={getTotalConvertedBalanceValue(currentBalanceInfo)}
              selectionProvider={{ selectedNetworkKey: selectedNetworkInfo.networkKey }}
            />
          );
        }}
        snapThreshold={0.5}>
        <Tabs.Tab name="token" label="Token">
          <TokensTab
            selectedNetworkInfo={selectedNetworkInfo}
            selectedBalanceInfo={currentBalanceInfo}
            onPressTokenItem={onPressTokenItem}
          />
        </Tabs.Tab>
        <Tabs.Tab name="chain" label="History">
          <HistoryTab networkKey={selectedNetworkInfo.networkKey} isUseCollapsibleTabView />
        </Tabs.Tab>
      </Tabs.Container>
    </ContainerWithSubHeader>
  );
};
