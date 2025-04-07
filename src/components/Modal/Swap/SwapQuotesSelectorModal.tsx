import React, { useCallback, useMemo, useRef } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SwapQuotesItem } from 'components/Item/Swap/SwapQuotesItem';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { deviceHeight } from 'constants/index';
import { CheckCircle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  items: SwapQuote[];
  setModalVisible: (value: boolean) => void;
  onSelectItem: (quote: SwapQuote) => void;
  selectedItem?: SwapQuote;
  optimalQuoteItem?: SwapQuote;
  loading: boolean;
  onConfirmationItem: (quote: SwapQuote) => Promise<void>;
}

export const SwapQuotesSelectorModal = ({
  modalVisible,
  setModalVisible,
  items,
  optimalQuoteItem,
  selectedItem,
  onSelectItem,
  loading,
  onConfirmationItem,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const getToAssetInfo = useCallback(
    (quote: SwapQuote) => {
      return assetRegistryMap[quote.pair.to] || undefined;
    },
    [assetRegistryMap],
  );

  const handleApplySlippage = useCallback(() => {
    if (selectedItem) {
      onConfirmationItem(selectedItem).catch(error => {
        console.error('Error when confirm swap quote:', error);
      });
    }
  }, [onConfirmationItem, selectedItem]);

  const renderItems = useCallback(
    (_items: SwapQuote[]) => {
      return _items.map(item => {
        const decimals = _getAssetDecimals(getToAssetInfo(item));
        const symbol = _getAssetSymbol(getToAssetInfo(item));

        return (
          <SwapQuotesItem
            isRecommend={optimalQuoteItem?.provider.id === item.provider.id}
            key={item.provider.id}
            onSelect={onSelectItem}
            quote={item}
            selected={selectedItem?.provider.id === item.provider.id}
            decimals={decimals}
            symbol={symbol}
          />
        );
      });
    },
    [getToAssetInfo, onSelectItem, optimalQuoteItem?.provider.id, selectedItem?.provider.id],
  );

  const footer = useMemo(() => {
    return (
      <View style={{ paddingTop: theme.padding }}>
        <Button
          disabled={loading}
          loading={loading}
          onPress={handleApplySlippage}
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}>
          {i18n.buttonTitles.confirm}
        </Button>
      </View>
    );
  }, [handleApplySlippage, loading, theme.padding]);

  return (
    <SwModal
      isUseModalV2
      level={2}
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={'Swap quote'}
      footer={footer}
      modalBaseV2Ref={modalBaseV2Ref}>
      <ScrollView style={{ maxHeight: deviceHeight * 0.6 }} contentContainerStyle={{ gap: theme.sizeXS }}>
        {!!items && !!items.length && renderItems(items)}
      </ScrollView>
    </SwModal>
  );
};
