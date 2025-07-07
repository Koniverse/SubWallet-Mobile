import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { SwapQuotesItem } from 'components/Item/Swap/SwapQuotesItem';
import { ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { deviceHeight } from 'constants/index';
import { CheckCircle } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { VoidFunction } from 'types/index';
import { QuoteResetTime } from 'components/Swap/QuoteResetTime';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  items: SwapQuote[];
  applyQuote: (quote: SwapQuote) => Promise<void>;
  selectedItem?: SwapQuote;
  onCancel: VoidFunction;
  quoteAliveUntil: number | undefined;
  disableConfirmButton?: boolean;
}

export const SwapQuotesSelectorModal = ({
  modalVisible,
  setModalVisible,
  items,
  selectedItem,
  applyQuote,
  onCancel,
  quoteAliveUntil,
  disableConfirmButton,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<SwapQuote | undefined>(selectedItem);
  const onSelectItem = useCallback((quote: SwapQuote) => {
    setCurrentQuote(quote);
  }, []);

  const handleApplySlippage = useCallback(() => {
    const quoteResult = items.find(i => i.provider.id === currentQuote?.provider.id);
    if (quoteResult) {
      setLoading(true);
      applyQuote(quoteResult)
        .catch(error => {
          console.error('Error when confirm swap quote:', error);
        })
        .finally(() => {
          onCancel();
          setLoading(false);
        });
    }
  }, [applyQuote, currentQuote?.provider.id, items, onCancel]);

  useEffect(() => {
    if (items.length) {
      if (currentQuote && selectedItem && !items.some(i => i.provider.id === currentQuote.provider.id)) {
        setCurrentQuote(selectedItem);
      }
    }
  }, [currentQuote, items, selectedItem]);

  const renderItems = useCallback(
    (_items: SwapQuote[]) => {
      return _items.map((item, index) => {
        return (
          <SwapQuotesItem
            isRecommend={index === 0}
            key={item.provider.id}
            onSelect={onSelectItem}
            quote={item}
            selected={currentQuote?.provider.id === item.provider.id}
          />
        );
      });
    },
    [currentQuote, onSelectItem],
  );

  const isDisableConfirmButton = useMemo(
    () => disableConfirmButton || !currentQuote || items.length < 2,
    [currentQuote, disableConfirmButton, items.length],
  );

  const footer = useMemo(() => {
    return (
      <View style={{ paddingTop: theme.padding }}>
        <Button
          disabled={isDisableConfirmButton}
          loading={loading}
          onPress={handleApplySlippage}
          icon={
            <Icon
              iconColor={isDisableConfirmButton ? theme.colorTextLight5 : theme.colorWhite}
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          }>
          {i18n.buttonTitles.confirm}
        </Button>
      </View>
    );
  }, [handleApplySlippage, isDisableConfirmButton, loading, theme.colorTextLight5, theme.colorWhite, theme.padding]);

  return (
    <SwModal
      isUseModalV2
      level={2}
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      renderHeader={
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: theme.margin }}>
          <Typography.Title level={4} style={{ color: theme.colorWhite }}>
            {'Select provider'}
          </Typography.Title>
          <View style={{ position: 'absolute', right: 0, top: 10 }}>
            <QuoteResetTime quoteAliveUntilValue={quoteAliveUntil} />
          </View>
        </View>
      }
      footer={footer}
      modalBaseV2Ref={modalBaseV2Ref}>
      <ScrollView style={{ maxHeight: deviceHeight * 0.6 }} contentContainerStyle={{ gap: theme.sizeXS }}>
        {!!items && !!items.length && renderItems(items)}
      </ScrollView>
    </SwModal>
  );
};
