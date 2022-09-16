import React from 'react';
import { Linking, StyleProp, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { ArrowDown, ArrowUp } from 'phosphor-react-native';
import { toShort } from 'utils/index';
import { ChainRegistry, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { customFormatDate } from 'utils/customFormatDate';
import { BalanceVal } from 'components/BalanceVal';
import { getBalances } from 'utils/chainBalances';
import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import i18n from 'utils/i18n/i18n';

interface Props extends TouchableOpacityProps {
  item: TransactionHistoryItemType;
  registry: ChainRegistry;
}

const tokenHistoryMainArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 16,
  paddingBottom: 16,
};

const tokenHistoryPart1: StyleProp<any> = {
  flexDirection: 'row',
  paddingLeft: 16,
  alignItems: 'center',
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingBottom: 4,
};

const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const tokenHistoryMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};

const tokenHistoryPart2: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
};

const tokenHistorySeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};

const getIconStyle: (item: TransactionHistoryItemType) => StyleProp<any> = item => {
  const baseStyle = {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderStyle: 'solid',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const borderColor =
    item.action === 'received'
      ? 'rgba(66, 197, 154, 0.15)'
      : item.isSuccess
      ? 'rgba(0, 75, 255, 0.15)'
      : 'rgba(245, 0, 14, 0.15)';

  return {
    ...baseStyle,
    borderColor,
  };
};

const part2Line1Style: StyleProp<any> = {
  flexDirection: 'row',
};

const part2Line2Style: StyleProp<any> = {
  flexDirection: 'row',
};

const balanceValStyle: StyleProp<any> = {
  marginLeft: 4,
};

type DecimalsAndSymbolInfo = {
  changeDecimals: number;
  changeSymbol: string;
  feeDecimals: number;
  feeSymbol: string;
};

function getDecimalsAndSymbolInfo(item: TransactionHistoryItemType, registry: ChainRegistry): DecimalsAndSymbolInfo {
  const result: DecimalsAndSymbolInfo = {} as DecimalsAndSymbolInfo;

  if (item.changeSymbol) {
    result.changeDecimals = registry.tokenMap[item.changeSymbol].decimals;
    result.changeSymbol = item.changeSymbol;
  } else {
    result.changeDecimals = registry.chainDecimals[0];
    result.changeSymbol = registry.chainTokens[0];
  }

  if (item.feeSymbol) {
    result.feeDecimals = registry.tokenMap[item.feeSymbol].decimals;
    result.feeSymbol = item.feeSymbol;
  } else {
    result.feeDecimals = registry.chainDecimals[0];
    result.feeSymbol = registry.chainTokens[0];
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TokenHistoryItem = ({ item, registry, ...wrapperProp }: Props) => {
  const HistorySendIcon = ArrowUp;
  const HistoryReceiveIcon = ArrowDown;
  const actionName = item.action === 'received' ? i18n.common.received : i18n.common.send;

  const { changeDecimals, changeSymbol, feeDecimals, feeSymbol } = getDecimalsAndSymbolInfo(item, registry);

  const changeValue = getBalances({
    balance: item.change,
    decimals: changeDecimals,
    symbol: changeSymbol,
  });

  const feeValue = getBalances({
    balance: item.fee || '',
    decimals: feeDecimals,
    symbol: feeSymbol,
  });
  const isSupportScanExplorer = useSupportScanExplorer(item.networkKey);
  const scanExplorerUrl = useScanExplorerTxUrl(item.networkKey, item.extrinsicHash);

  //todo: do something with isSupportScanExplorer
  return (
    <TouchableOpacity
      style={{ width: '100%' }}
      disabled={!isSupportScanExplorer || !scanExplorerUrl}
      {...wrapperProp}
      onPress={() => Linking.openURL(scanExplorerUrl)}>
      <View style={tokenHistoryMainArea}>
        <View style={tokenHistoryPart1}>
          <View style={getIconStyle(item)}>
            {item.action === 'received' ? (
              <HistoryReceiveIcon color={'rgba(66, 197, 154, 0.6)'} size={20} weight={'bold'} />
            ) : (
              <HistorySendIcon
                color={item.isSuccess ? 'rgba(0, 75, 255, 0.6)' : 'rgba(245, 0, 14, 0.6)'}
                size={20}
                weight={'bold'}
              />
            )}
          </View>
          <View style={tokenHistoryMetaWrapper}>
            <Text style={textStyle}>{toShort(item.extrinsicHash)}</Text>
            <Text style={subTextStyle}>{`${actionName} - ${customFormatDate(item.time, '#MMM# #DD#')}`}</Text>
          </View>
        </View>

        <View style={tokenHistoryPart2}>
          <View style={part2Line1Style}>
            <Text style={textStyle}>{item.action === 'received' ? '+' : '-'}</Text>

            <BalanceVal
              style={balanceValStyle}
              symbol={changeSymbol}
              value={changeValue.balanceValue}
              balanceValTextStyle={textStyle}
            />
          </View>

          {!!item.fee && (
            <View style={part2Line2Style}>
              <Text style={subTextStyle}>{i18n.common.fee}</Text>
              <BalanceVal
                style={balanceValStyle}
                symbol={feeSymbol}
                value={feeValue.balanceValue}
                balanceValTextStyle={subTextStyle}
              />
            </View>
          )}
        </View>
      </View>

      <View style={tokenHistorySeparator} />
    </TouchableOpacity>
  );
};
