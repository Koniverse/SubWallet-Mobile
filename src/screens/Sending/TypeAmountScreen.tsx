import React, { useContext, useState } from 'react';
import { ScrollView, StyleProp, TouchableOpacity, View } from 'react-native';
import {
  ContainerHorizontalPadding,
  FontMedium,
  FontSemiBold,
  MarginBottomForSubmitButton,
  sharedStyles,
} from 'styles/sharedStyles';
import { getBalanceWithSi, getNetworkLogo } from 'utils/index';
import { ColorMap } from 'styles/color';
import { BalanceToUsd } from 'components/BalanceToUsd';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';
import Text from 'components/Text';
import FormatBalance from 'components/FormatBalance';
import { SubmitButton } from 'components/SubmitButton';
import { BalanceFormatType, TokenItemType } from 'types/ui-types';
import { SiDef } from '@polkadot/util/types';
import BigN from 'bignumber.js';
import { BN_TEN } from 'utils/chainBalances';
import { CaretDown } from 'phosphor-react-native';
import { TokenSelect } from 'screens/TokenSelect';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';
import { SendAssetInputBalance } from 'screens/Sending/Field/SendAssetInputBalance';
import { WebRunnerContext } from 'providers/contexts';

interface Props {
  amount: string;
  balanceFormat: BalanceFormatType;
  si: SiDef;
  originChain: string;
  originToken: string;
  rawAmount?: string;
  onChangeAmount: (val?: string) => void;
  senderFreeBalance: string;
  inputBalanceRef: React.RefObject<unknown>;
  isSupportTransfer: boolean | null;
  onUpdateInputBalance: () => void;
  canToggleAll: boolean;
  isGasRequiredExceedsError: boolean;
  onPressToNextStep: () => void;
  onChangeSelectedToken: (tokenValueStr: string) => void;
  senderAddress: string;
  originTokenList: TokenItemType[];
  showedNetworks: string[];
}

const WarningStyle: StyleProp<any> = {
  marginBottom: 8,
};

const SelectTokenButtonStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'center',
  marginTop: 8,
};

const SelectTokenTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 8,
  paddingRight: 4,
};

const TransferableWrapperStyle: StyleProp<any> = {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingBottom: 24,
  paddingTop: 8,
};

function getUseMaxButtonTextStyle(disabled: boolean) {
  return {
    color: disabled ? ColorMap.disabled : ColorMap.primary,
    ...sharedStyles.mainText,
    ...FontMedium,
  };
}

export const TypeAmountScreen = ({
  senderFreeBalance,
  showedNetworks,
  amount,
  balanceFormat,
  rawAmount,
  si,
  originToken,
  onChangeAmount,
  inputBalanceRef,
  isSupportTransfer,
  onUpdateInputBalance,
  canToggleAll,
  isGasRequiredExceedsError,
  onPressToNextStep,
  originChain,
  onChangeSelectedToken,
  originTokenList,
  senderAddress,
}: Props) => {
  const tokenGroupMap = useTokenGroup(showedNetworks);
  const tokenBalanceKeyPriceMap = useTokenBalanceKeyPriceMap(tokenGroupMap);
  const [tokenListModalVisible, setTokenListModalVisible] = useState<boolean>(false);
  const tokenPrice = tokenBalanceKeyPriceMap[`${originChain}|${originToken}`] || 0;
  const reformatAmount = new BigN(rawAmount || '0').div(BN_TEN.pow(balanceFormat[0]));
  const amountToUsd = reformatAmount.multipliedBy(new BigN(tokenPrice));
  const amountGtAvailableBalance =
    !!rawAmount && !!senderFreeBalance && new BigN(rawAmount).gt(new BigN(senderFreeBalance));
  const canMakeTransfer = !!rawAmount && isSupportTransfer && !isGasRequiredExceedsError && !amountGtAvailableBalance;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;

  const _onChangeToken = (item: TokenItemType) => {
    onChangeSelectedToken(item.symbol);
    setTokenListModalVisible(false);
  };

  return (
    <>
      <ScrollView style={ContainerHorizontalPadding} contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity style={SelectTokenButtonStyle} onPress={() => setTokenListModalVisible(true)}>
          {getNetworkLogo(originToken || originChain, 20, originChain)}
          <Text style={SelectTokenTextStyle}>{originToken}</Text>
          <CaretDown size={16} color={ColorMap.disabled} weight={'bold'} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 56 }}>
          <View style={{ minHeight: 120, alignItems: 'center' }}>
            <SendAssetInputBalance
              value={rawAmount !== undefined ? getBalanceWithSi(amount, balanceFormat[0], si, originToken)[0] : ''}
              placeholder={'0'}
              si={si}
              maxValue={senderFreeBalance}
              onChange={onChangeAmount}
              decimals={balanceFormat[0]}
              ref={inputBalanceRef}
            />
            {reformatAmount && <BalanceToUsd amountToUsd={amountToUsd} isShowBalance={true} />}
          </View>
        </View>

        {amountGtAvailableBalance && (
          <Warning isDanger style={WarningStyle} message={i18n.sendAssetScreen.amountGtAvailableBalanceMessage} />
        )}

        {!isSupportTransfer && (
          <Warning style={WarningStyle} isDanger message={i18n.warningMessage.notSupportTransferMessage} />
        )}

        {!isNetConnected && (
          <Warning style={WarningStyle} isDanger message={'No Internet connection. Please try again later'} />
        )}
      </ScrollView>

      <View style={ContainerHorizontalPadding}>
        <View style={TransferableWrapperStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: ColorMap.light, ...sharedStyles.mainText, ...FontMedium }}>
              {i18n.common.transferable}
            </Text>
            <FormatBalance format={balanceFormat} value={senderFreeBalance} />
          </View>

          <TouchableOpacity onPress={onUpdateInputBalance} disabled={!canToggleAll}>
            <Text style={getUseMaxButtonTextStyle(!canToggleAll)}>{i18n.common.max}</Text>
          </TouchableOpacity>
        </View>

        <SubmitButton
          disabled={!canMakeTransfer || !isNetConnected}
          title={i18n.common.continue}
          style={{ width: '100%', ...MarginBottomForSubmitButton }}
          onPress={onPressToNextStep}
        />
      </View>

      <TokenSelect
        filteredNetworkKey={originChain}
        selectedToken={originToken}
        selectedNetworkKey={originChain}
        onChangeToken={_onChangeToken}
        onPressBack={() => setTokenListModalVisible(false)}
        address={senderAddress}
        modalVisible={tokenListModalVisible}
        onChangeModalVisible={() => setTokenListModalVisible(false)}
        externalTokenOptions={originTokenList}
      />
    </>
  );
};
