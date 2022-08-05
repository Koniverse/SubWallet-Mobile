import React from 'react';
import {
  AccountInfoByNetwork,
  BalanceContainerType,
  SelectionProviderType,
  TokenBalanceItemType,
} from 'types/ui-types';
import BigN from 'bignumber.js';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import useConvertedBalanceValue from 'hooks/screen/Home/CtyptoTab/TabContainerHeader/useConvertedBalanceValue';
import useBalanceValue from 'hooks/screen/Home/CtyptoTab/TabContainerHeader/useBalanceValue';
import { BalanceBlock } from 'screens/Home/CtyptoTab/BalanceBlock';
import { BalanceInfo } from '../../../types';

export interface TabsContainerHeaderProps {
  currentView: string;
  currentTgKey: string;
  totalBalanceValue: BigN;
  tokenGroupMap: Record<string, string[]>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  networkBalanceMap: Record<string, BalanceInfo>;
  selectedNetworkInfo?: AccountInfoByNetwork;
  selectedTokenSymbol: string;
  selectedTokenDisplayName: string;
}

const containerStyle: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  paddingTop: 21,
};

function getActionButtonContainerStyle(viewStep: string) {
  if (viewStep === ViewStep.TOKEN_HISTORY) {
    return {
      paddingTop: 25,
    };
  }

  return undefined;
}

function getSelectionProvider(
  currentView: string,
  selectedTokenSymbol: string,
  selectedNetworkInfo?: AccountInfoByNetwork,
): SelectionProviderType | undefined {
  if (currentView === ViewStep.CHAIN_DETAIL) {
    if (selectedNetworkInfo) {
      return { selectedNetworkKey: selectedNetworkInfo.networkKey };
    }
  } else if (currentView === ViewStep.TOKEN_HISTORY) {
    if (selectedNetworkInfo) {
      return {
        selectedNetworkKey: selectedNetworkInfo.networkKey,
        selectedToken: selectedTokenSymbol,
      };
    }
  }

  return undefined;
}

function getBalanceBlockProps(
  viewStep: string,
  balanceValue: BigN,
  amountToUsd: BigN,
  selectedTokenDisplayName: string,
): BalanceContainerType {
  const props: BalanceContainerType = {
    balanceValue,
  };

  if (viewStep === ViewStep.TOKEN_HISTORY) {
    props.isShowBalanceToUsd = true;
    props.startWithSymbol = false;
    props.symbol = selectedTokenDisplayName;
    props.amountToUsd = amountToUsd;
  }

  return props;
}

const TabsContainerHeader = ({
  currentView,
  totalBalanceValue,
  currentTgKey,
  tokenGroupMap,
  tokenBalanceMap,
  selectedNetworkInfo,
  selectedTokenSymbol,
  selectedTokenDisplayName,
  networkBalanceMap,
}: TabsContainerHeaderProps) => {
  const selectionProvider = getSelectionProvider(currentView, selectedTokenSymbol, selectedNetworkInfo);
  const balanceValueProp = useBalanceValue(
    currentView,
    currentTgKey,
    totalBalanceValue,
    tokenGroupMap,
    tokenBalanceMap,
    networkBalanceMap,
    selectedTokenSymbol,
    selectedNetworkInfo,
  );
  const amountToUsdProp = useConvertedBalanceValue(selectedNetworkInfo, selectedTokenSymbol, tokenBalanceMap);
  const balanceBlockProps: BalanceContainerType = getBalanceBlockProps(
    currentView,
    balanceValueProp,
    amountToUsdProp,
    selectedTokenDisplayName,
  );

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <BalanceBlock {...balanceBlockProps} />
      <ActionButtonContainer style={getActionButtonContainerStyle(currentView)} selectionProvider={selectionProvider} />
    </View>
  );
};

export default TabsContainerHeader;
