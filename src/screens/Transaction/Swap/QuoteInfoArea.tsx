import { CommonOptimalSwapPath, ProcessType, SwapQuote } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { SwapError } from '@subwallet/extension-base/background/errors/SwapError';
import { VoidFunction } from 'types/index';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { AppModalContext } from 'providers/AppModalContext';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Keyboard, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Icon, NumberDisplay, Tag, Typography } from 'components/design-system-ui';
import { CaretRight, Info, ListBullets, PencilSimpleLine, XCircle } from 'phosphor-react-native';
import { SwapProviderId } from '@subwallet/extension-base/types/swap';
import Tooltip from 'react-native-walkthrough-tooltip';
import { getAmountAfterSlippage, getSwapChainsFromPath } from '@subwallet/extension-base/services/swap-service/utils';
import MetaInfo from 'components/MetaInfo';
import { QuoteResetTime } from 'components/Swap/QuoteResetTime';
import { TransactionProcessPreview } from 'components/TransactionProcess';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { TransactionProcessStepItemType } from 'types/component';
import useGetSwapProcessSteps from 'hooks/transaction/process/useGetSwapProcessSteps';
import QuoteRateDisplay from 'components/Swap/QuoteRateDisplay';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

type Props = {
  currentQuote: SwapQuote | undefined;
  quoteOptions: SwapQuote[];
  currentOptimalSwapPath: CommonOptimalSwapPath | undefined;
  isFormInvalid: boolean;
  estimatedFeeValue: BigN;
  handleRequestLoading: boolean;
  quoteAliveUntil: number | undefined;
  fromAssetInfo: _ChainAsset | undefined;
  toAssetInfo: _ChainAsset | undefined;
  swapError: SwapError | undefined;
  openSwapQuotesModal: VoidFunction;
  slippage: number;
  openSlippageModal: VoidFunction;
};

export const QuoteInfoArea = (props: Props) => {
  const {
    currentOptimalSwapPath,
    currentQuote,
    estimatedFeeValue,
    fromAssetInfo,
    handleRequestLoading,
    isFormInvalid,
    openSlippageModal,
    openSwapQuotesModal,
    quoteAliveUntil,
    quoteOptions,
    slippage,
    swapError,
    toAssetInfo,
  } = props;

  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const currencyData = useSelector((state: RootState) => state.price.currencyData);
  const { transactionStepsModal } = useContext(AppModalContext);
  const getSwapProcessSteps = useGetSwapProcessSteps();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const openProcessModal = useCallback(() => {
    Keyboard.dismiss();
    if (!currentOptimalSwapPath || !currentQuote) {
      return;
    }

    const items: TransactionProcessStepItemType[] = getSwapProcessSteps(currentOptimalSwapPath, currentQuote);

    setTimeout(() => {
      transactionStepsModal.setTransactionStepsModalState({
        visible: true,
        items: items,
        type: ProcessType.SWAP,
        variant: 'standard',
      });
    }, 200);
  }, [currentOptimalSwapPath, currentQuote, getSwapProcessSteps, transactionStepsModal]);

  const renderRateInfo = useCallback(() => {
    if (!currentQuote) {
      return null;
    }

    return <QuoteRateDisplay fromAssetInfo={fromAssetInfo} rateValue={currentQuote.rate} toAssetInfo={toAssetInfo} />;
  }, [currentQuote, fromAssetInfo, toAssetInfo]);

  const _renderRateInfo = useCallback(() => {
    const recommendedQuote = quoteOptions[0];

    return (
      <TouchableOpacity onPress={openSwapQuotesModal} style={styles.row}>
        {renderRateInfo()}

        {!!recommendedQuote?.provider.id && recommendedQuote?.provider.id === currentQuote?.provider.id && (
          <Tag bgType={'default'}>{'Best'}</Tag>
        )}

        <Icon phosphorIcon={CaretRight} size={'xs'} />
      </TouchableOpacity>
    );
  }, [currentQuote?.provider.id, openSwapQuotesModal, quoteOptions, renderRateInfo, styles.row]);

  const renderQuoteEmptyBlock = useCallback(() => {
    const _loading = handleRequestLoading && !isFormInvalid;

    if (swapError || (!currentQuote && !_loading)) {
      return null;
    }

    const isError = isFormInvalid;
    let message = '';

    if (isFormInvalid) {
      message = 'Invalid input. Re-enter information in the red field and try again';
    } else if (handleRequestLoading) {
      message = 'Loading...';
    }

    return (
      <View
        style={{
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingHorizontal: theme.paddingLG,
          paddingTop: theme.paddingXL,
          paddingBottom: theme.paddingLG,
          gap: theme.size,
          alignItems: 'center',
          minHeight: 184,
        }}>
        <View
          style={{
            backgroundColor: theme['gray-2'],
            width: 64,
            height: 64,
            borderRadius: theme.borderRadiusXXL,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {_loading ? (
            <ActivityIndicator size={32} indicatorColor={theme['gray-4']} />
          ) : (
            <Icon
              phosphorIcon={isError ? XCircle : ListBullets}
              weight={isError ? 'fill' : undefined}
              customSize={36}
            />
          )}
        </View>
        <Typography.Text style={styles.quoteEmptyMessage}>{message}</Typography.Text>
      </View>
    );
  }, [currentQuote, handleRequestLoading, isFormInvalid, styles.quoteEmptyMessage, swapError, theme]);

  const notSupportSlippageSelection = useMemo(() => {
    const unsupportedProviders = [
      SwapProviderId.CHAIN_FLIP_TESTNET,
      SwapProviderId.CHAIN_FLIP_MAINNET,
      SwapProviderId.SIMPLE_SWAP,
    ];

    return currentQuote?.provider.id ? unsupportedProviders.includes(currentQuote.provider.id) : false;
  }, [currentQuote?.provider.id]);

  const onOpenSlippageModal = useCallback(() => {
    Keyboard.dismiss();

    if (!notSupportSlippageSelection) {
      setTimeout(() => {
        openSlippageModal();
      }, 200);
    }
  }, [notSupportSlippageSelection, openSlippageModal]);

  const isSimpleSwapSlippage = currentQuote?.provider.id === SwapProviderId.SIMPLE_SWAP;

  const renderSlippageInfoContent = useCallback(() => {
    const slippageTitle = isSimpleSwapSlippage ? 'Slippage can be up to 5% due to market conditions' : '';
    const slippageValueString = new BigN(slippage).multipliedBy(100).toFixed();
    const slippageContent = isSimpleSwapSlippage ? `Up to ${slippageValueString}%` : `${slippageValueString}%`;

    const onPressInfo = () => {
      if (isSimpleSwapSlippage) {
        setTooltipVisible(true);
      }
    };

    return (
      <MetaInfo.Default
        label={
          <Typography.Text
            style={{ fontSize: theme.fontSizeSM, lineHeight: theme.fontSizeSM, color: theme.colorTextTertiary }}>
            {'Slippage'}
          </Typography.Text>
        }>
        <Tooltip
          isVisible={tooltipVisible}
          disableShadow={true}
          placement={'top'}
          displayInsets={{ right: 0, top: 0, bottom: 0, left: 0 }}
          showChildInTooltip={false}
          topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
          contentStyle={styles.tooltipContent}
          closeOnBackgroundInteraction={true}
          onClose={() => setTooltipVisible(false)}
          content={<Typography.Text style={styles.smallText}>{slippageTitle}</Typography.Text>}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}
            onPress={!!slippageTitle ? onPressInfo : onOpenSlippageModal}>
            {!!slippageTitle && <Icon phosphorIcon={Info} size={'xxs'} />}
            <Typography.Text style={styles.smallText}>{slippageContent}</Typography.Text>

            {!notSupportSlippageSelection && <Icon size={'xs'} phosphorIcon={PencilSimpleLine} />}
          </TouchableOpacity>
        </Tooltip>
      </MetaInfo.Default>
    );
  }, [
    isSimpleSwapSlippage,
    notSupportSlippageSelection,
    onOpenSlippageModal,
    slippage,
    styles.smallText,
    styles.tooltipContent,
    theme.colorTextTertiary,
    theme.fontSizeSM,
    theme.sizeXXS,
    tooltipVisible,
  ]);

  const processChains = useMemo(() => {
    if (!currentOptimalSwapPath) {
      return [];
    }

    return getSwapChainsFromPath(currentOptimalSwapPath.path);
  }, [currentOptimalSwapPath]);

  const minReceivableValue = useMemo(() => {
    if (!currentQuote) {
      return '0';
    }

    return getAmountAfterSlippage(currentQuote.toAmount, slippage);
  }, [currentQuote, slippage]);

  const showQuoteEmptyBlock = !currentQuote || handleRequestLoading || isFormInvalid;

  return (
    <>
      {!showQuoteEmptyBlock && (
        <MetaInfo
          hasBackgroundWrapper
          labelColorScheme={'gray'}
          labelFontWeight={'regular'}
          spaceSize={'xs'}
          valueColorScheme={'light'}>
          <MetaInfo.Default
            label={
              <View style={styles.row}>
                <Typography.Text
                  style={{ fontSize: theme.fontSizeSM, lineHeight: theme.fontSizeSM, color: theme.colorTextTertiary }}>
                  {'Quote rate'}
                </Typography.Text>
                <QuoteResetTime quoteAliveUntilValue={quoteAliveUntil} />
              </View>
            }>
            {_renderRateInfo()}
          </MetaInfo.Default>

          <MetaInfo.Default
            label={
              <Typography.Text
                style={{ fontSize: theme.fontSizeSM, lineHeight: theme.fontSizeSM, color: theme.colorTextTertiary }}>
                {'Process'}
              </Typography.Text>
            }>
            <TouchableOpacity onPress={openProcessModal} style={styles.row}>
              <TransactionProcessPreview chains={processChains} />

              <Icon phosphorIcon={CaretRight} size={'xs'} />
            </TouchableOpacity>
          </MetaInfo.Default>

          <MetaInfo.Default
            label={
              <Typography.Text
                style={{ fontSize: theme.fontSizeSM, lineHeight: theme.fontSizeSM, color: theme.colorTextTertiary }}>
                {'Estimated fee'}
              </Typography.Text>
            }>
            <NumberDisplay
              size={12}
              textStyle={{ ...FontSemiBold }}
              decimal={0}
              prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              value={estimatedFeeValue}
            />
          </MetaInfo.Default>

          <MetaInfo.Default
            label={
              <Typography.Text
                style={{ fontSize: theme.fontSizeSM, lineHeight: theme.fontSizeSM, color: theme.colorTextTertiary }}>
                {'Min receivable'}
              </Typography.Text>
            }>
            <NumberDisplay
              size={12}
              textStyle={{ ...FontSemiBold }}
              decimal={_getAssetDecimals(toAssetInfo)}
              suffix={_getAssetSymbol(toAssetInfo)}
              value={minReceivableValue}
            />
          </MetaInfo.Default>

          {renderSlippageInfoContent()}
        </MetaInfo>
      )}

      {showQuoteEmptyBlock && renderQuoteEmptyBlock()}
    </>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS },
    tooltipContent: { backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG },
    smallText: { fontSize: theme.fontSizeSM, color: theme.colorTextLight1, ...FontSemiBold },
    quoteEmptyMessage: {
      color: theme.colorTextLight1,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      textAlign: 'center',
      ...FontSemiBold,
    },
  });
}
