import React, { useCallback, useMemo, useRef } from 'react';
import { SwModal, Typography, Number } from 'components/design-system-ui';
import { ScrollView, View } from 'react-native';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import BigN from 'bignumber.js';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { ChooseFeeItem } from 'components/Modal/TransactionFee/FeeEditor/ChooseFeeItem';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { _AssetType } from '@subwallet/chain-list/types';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deviceHeight } from 'constants/index';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  estimateFee: string | number | BigN;
  convertedFeeValueToUSD: string | number | BigN;
  items: TokenHasBalanceInfo[] | undefined;
  onSelectItem: (slug: string) => void;
  selectedItem?: string;
  nativeTokenDecimals: number;
  tokenSlug: string;
  feePercentageSpecialCase?: number;
}

interface TokenWithFeeInfo extends TokenHasBalanceInfo {
  isDisableItem: boolean;
  convertedAmountToPay: BigN;
}

const numberMetadata = { maxNumberFormat: 8 };

export const ChooseFeeTokenModal = ({
  modalVisible,
  setModalVisible,
  estimateFee,
  convertedFeeValueToUSD,
  items,
  onSelectItem: _onSelectItem,
  selectedItem,
  tokenSlug,
  feePercentageSpecialCase,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { currencyData } = useSelector((state: RootState) => state.price);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const onCancel = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const estimateFeeSpecial = useMemo(() => {
    return feePercentageSpecialCase && !tokenSlug.includes(_AssetType.NATIVE)
      ? new BigN(estimateFee).multipliedBy(feePercentageSpecialCase).div(100).toString()
      : estimateFee;
  }, [estimateFee, feePercentageSpecialCase, tokenSlug]);

  const tokensWithFeeInfo: TokenWithFeeInfo[] | undefined = useMemo(() => {
    if (!items) {
      return undefined;
    }

    const processedItems = items.map(item => {
      const { free: balance, rate, slug } = item;
      const estimatedFeeValue = slug !== tokenSlug ? estimateFee : estimateFeeSpecial;
      const convertedAmountToPay = new BigN(estimatedFeeValue).multipliedBy(rate).integerValue(BigN.ROUND_UP);

      const isDisableItem =
        !convertedAmountToPay || convertedAmountToPay.lte(0) || new BigN(balance).lt(convertedAmountToPay);

      return { ...item, isDisableItem, convertedAmountToPay };
    });

    return processedItems.sort((a, b) => {
      return (a.isDisableItem ? 1 : 0) - (b.isDisableItem ? 1 : 0);
    });
  }, [estimateFee, estimateFeeSpecial, items, tokenSlug]);

  const onSelectItem = useCallback(
    (slug: string) => {
      _onSelectItem(slug);
      setModalVisible(false);
    },
    [_onSelectItem, setModalVisible],
  );

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={'Select token to pay fee'}
      titleTextAlign={'center'}
      onBackdropPress={onCancel}
      modalBaseV2Ref={modalBaseV2Ref}
      isAllowSwipeDown={false}
      isUseModalV2={true}>
      <ScrollView style={{ maxHeight: deviceHeight * 0.6 }}>
        <View style={{ alignItems: 'center', gap: theme.size, marginBottom: theme.sizeLG }}>
          <Typography.Text style={{ color: theme.colorTextTertiary }}>{'Estimated fee'}</Typography.Text>
          <Number
            value={convertedFeeValueToUSD}
            customFormatter={swapCustomFormatter}
            decimal={0}
            decimalOpacity={0.45}
            formatType={'custom'}
            metadata={numberMetadata}
            prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
            size={30}
            textStyle={{ ...FontSemiBold, lineHeight: 38 }}
            suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          />
          <Typography.Text style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>{'Pay with:'}</Typography.Text>
        </View>

        {tokensWithFeeInfo &&
          tokensWithFeeInfo.map((item, index) => (
            <ChooseFeeItem
              amountToPay={item.convertedAmountToPay}
              slug={item.slug}
              balance={item?.free}
              isDisable={item.isDisableItem}
              key={`${item.slug}-${index}`}
              onSelect={onSelectItem}
              selected={selectedItem === item.slug}
            />
          ))}
      </ScrollView>
    </SwModal>
  );
};
