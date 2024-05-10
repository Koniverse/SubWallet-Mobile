import React, { useCallback, useRef } from 'react';
import { Typography, Number, SwModal } from 'components/design-system-ui';
import { ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ChooseFeeItem } from 'components/Item/Swap/ChooseFeeItem';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getAssetPriceId, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { FontSemiBold } from 'styles/sharedStyles';
import { deviceHeight } from 'constants/index';
import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  estimatedFee: string | number | BigN;
  items: string[] | undefined;
  onSelectItem: (slug: string) => void;
  selectedItem?: string;
  currencyData: CurrencyJson;
}

export const ChooseFeeTokenModal = ({
  modalVisible,
  setModalVisible,
  estimatedFee,
  selectedItem,
  onSelectItem,
  items,
  currencyData,
}: Props) => {
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const getFeeAssetInfo = useCallback(
    (slug: string) => {
      return assetRegistry[slug];
    },
    [assetRegistry],
  );

  const renderItems = useCallback(
    (_items: string[]) => {
      return _items.map((item, index) => {
        const feeAssetInfo = getFeeAssetInfo(item);
        const getConvertedAmountToPay = () => {
          if (!priceMap[_getAssetPriceId(feeAssetInfo)] || !priceMap[_getAssetPriceId(feeAssetInfo)]) {
            return undefined;
          }

          return new BigN(estimatedFee).div(priceMap[_getAssetPriceId(feeAssetInfo)] || 0);
        };

        return (
          <ChooseFeeItem
            tokenSlug={item}
            key={index}
            selected={!!selectedItem}
            symbol={_getAssetSymbol(getFeeAssetInfo(item))}
            value={getConvertedAmountToPay()}
            onSelect={onSelectItem}
          />
        );
      });
    },
    [estimatedFee, getFeeAssetInfo, onSelectItem, priceMap, selectedItem],
  );

  return (
    <SwModal
      isUseModalV2
      level={2}
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={'Choose fee token'}
      modalBaseV2Ref={modalBaseV2Ref}>
      <ScrollView style={{ maxHeight: deviceHeight * 0.6 }} contentContainerStyle={{ gap: theme.paddingXL + 4 }}>
        <View style={{ gap: theme.padding, paddingTop: theme.padding, alignItems: 'center' }}>
          <Typography.Text style={{ color: theme.colorTextLight4 }}>{'Estimated fee'}</Typography.Text>
          <Number
            value={estimatedFee}
            decimal={0}
            prefix={currencyData?.symbol}
            size={38}
            textStyle={{ ...FontSemiBold, lineHeight: 38 }}
            subFloatNumber
            decimalOpacity={0.45}
          />
          <Typography.Text style={{ color: theme.colorTextLight4 }}>{'Pay with token:'}</Typography.Text>
        </View>
        {items && renderItems(items)}
      </ScrollView>
    </SwModal>
  );
};
