import React, { useCallback, useMemo, useState } from 'react';
import { FeeChainType, FeeDetail, TransactionFee } from '@subwallet/extension-base/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { VoidFunction } from 'types/index';
import BigN from 'bignumber.js';
import { Keyboard, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Typography, Number, Button, Icon } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { PencilSimpleLine } from 'phosphor-react-native';
import { _SUPPORT_TOKEN_PAY_FEE_GROUP, isChainSupportTokenPayFee } from '@subwallet/extension-base/constants';
import {
  _getAssetDecimals,
  _getAssetPriceId,
  _getAssetSymbol,
  _isNativeTokenBySlug,
} from '@subwallet/extension-base/services/chain-service/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-base/utils';
import { ChooseFeeTokenModal } from 'components/Modal/TransactionFee/FeeEditor/ChooseFeeTokenModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import Tooltip from 'react-native-walkthrough-tooltip';
import { FeeEditorModal } from 'components/Modal/TransactionFee/FeeEditor/FeeEditorModal';
import { ThemeTypes } from 'styles/themes';

export type RenderFieldNodeParams = {
  isLoading: boolean;
  feeInfo: {
    decimals: number;
    symbol: string;
    value: BigN;
    convertedValue: BigN;
  };
  disableEdit: boolean;
  onPressEdit: VoidFunction;
};

interface Props {
  onSelect?: (option: TransactionFee) => void;
  isLoadingFee: boolean;
  isLoadingToken: boolean;
  tokenPayFeeSlug: string;
  tokenSlug: string;
  feePercentageSpecialCase?: number;
  feeOptionsInfo?: FeeDetail;
  estimateFee: string;
  renderFieldNode?: (params: RenderFieldNodeParams) => React.ReactNode;
  feeType?: FeeChainType;
  listTokensCanPayFee: TokenHasBalanceInfo[];
  onSetTokenPayFee: (slug: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  destChainValue?: string;
  selectedFeeOption?: TransactionFee;
  nativeTokenSlug: string;
}

const FEE_TYPES_CAN_SHOW: Array<FeeChainType | undefined> = ['substrate', 'evm', 'bitcoin'];

const FeeEditor = ({
  chainValue,
  currentTokenPayFee,
  destChainValue,
  estimateFee,
  feeOptionsInfo,
  feePercentageSpecialCase,
  feeType,
  isLoadingFee = false,
  isLoadingToken,
  listTokensCanPayFee,
  nativeTokenSlug,
  onSetTokenPayFee,
  renderFieldNode,
  tokenPayFeeSlug,
  selectedFeeOption,
  tokenSlug,
  onSelect,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { priceMap, currencyData } = useSelector((state: RootState) => state.price);

  const [chooseFeeModalVisible, setChooseFeeModalVisible] = useState(false);
  const [feeEditorModalVisible, setFeeEditorModalVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tokenAsset = (() => {
    return assetRegistry[tokenPayFeeSlug] || undefined;
  })();

  const nativeAsset = (() => {
    return assetRegistry[nativeTokenSlug] || undefined;
  })();

  const decimals = _getAssetDecimals(tokenAsset);
  const priceId = _getAssetPriceId(tokenAsset);
  const priceValue = priceMap[priceId] || 0;
  const symbol = _getAssetSymbol(tokenAsset);
  const priceNativeId = _getAssetPriceId(nativeAsset);
  const priceNativeValue = priceMap[priceNativeId] || 0;
  const nativeTokenSymbol = _getAssetSymbol(nativeAsset);
  const nativeTokenDecimals = _getAssetDecimals(nativeAsset);

  const feeValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const feePriceValue = useMemo(() => {
    return BN_ZERO;
  }, []);

  const isDataReady = !isLoadingFee && !isLoadingFee && !isLoadingToken && !!feeOptionsInfo;

  const convertedFeeValueToUSD = useMemo(() => {
    if (!isDataReady) {
      return 0;
    }

    return new BigN(estimateFee)
      .multipliedBy(priceNativeValue)
      .dividedBy(BN_TEN.pow(nativeTokenDecimals || 0))
      .toNumber();
  }, [estimateFee, isDataReady, nativeTokenDecimals, priceNativeValue]);

  const onSelectTransactionFee = useCallback(
    (fee: TransactionFee) => {
      onSelect?.(fee);
    },
    [onSelect],
  );

  const isXcm = useMemo(() => {
    return chainValue && destChainValue && chainValue !== destChainValue;
  }, [chainValue, destChainValue]);

  const isEditButton = useMemo(() => {
    const isSubstrateSupport = !!(
      chainValue &&
      feeType === 'substrate' &&
      listTokensCanPayFee.length &&
      isChainSupportTokenPayFee(chainValue)
    );
    const isEvmSupport = !!(chainValue && feeType === 'evm');

    return (isSubstrateSupport || isEvmSupport) && !isXcm;
  }, [isXcm, chainValue, feeType, listTokensCanPayFee.length]);

  const onPressEdit = useCallback(() => {
    Keyboard.dismiss();

    if (!isEditButton) {
      setTimeout(() => {
        setTooltipVisible(true);
      }, 500);

      return;
    }

    if (
      chainValue &&
      (_SUPPORT_TOKEN_PAY_FEE_GROUP.assetHub.includes(chainValue) ||
        _SUPPORT_TOKEN_PAY_FEE_GROUP.hydration.includes(chainValue))
    ) {
      setTimeout(() => {
        setChooseFeeModalVisible(true);
      }, 300);
    } else {
      setTimeout(() => {
        setFeeEditorModalVisible(true);
      }, 100);
    }
  }, [chainValue, isEditButton, setFeeEditorModalVisible]);

  const customFieldNode = useMemo(() => {
    if (!renderFieldNode) {
      return null;
    }

    return renderFieldNode({
      isLoading: isLoadingFee,
      feeInfo: {
        decimals,
        symbol,
        value: feeValue,
        convertedValue: feePriceValue,
      },
      disableEdit: isLoadingFee,
      onPressEdit,
    });
  }, [decimals, feeValue, isLoadingFee, onPressEdit, renderFieldNode, symbol, feePriceValue]);

  const rateValue = useMemo(() => {
    const selectedToken = listTokensCanPayFee.find(item => item.slug === tokenPayFeeSlug);

    return selectedToken?.rate || 1;
  }, [listTokensCanPayFee, tokenPayFeeSlug]);

  const convertedEstimatedFee = useMemo(() => {
    const rs = new BigN(estimateFee).multipliedBy(rateValue);
    const isTransferLocalTokenAndPayThatTokenAsFee =
      !_isNativeTokenBySlug(tokenSlug) && !_isNativeTokenBySlug(tokenPayFeeSlug) && tokenPayFeeSlug === tokenSlug;

    return isTransferLocalTokenAndPayThatTokenAsFee ? rs.multipliedBy(feePercentageSpecialCase || 100).div(100) : rs;
  }, [estimateFee, rateValue, tokenSlug, tokenPayFeeSlug, feePercentageSpecialCase]);

  const isNativeTokenValue = !!(!isEditButton && isXcm);

  return (
    <>
      {customFieldNode || (
        <View style={styles.container}>
          <View style={styles.leftArea}>
            <Typography.Text style={styles.label}>{`${i18n.inputLabel.estimatedFee}:`}</Typography.Text>
            <View>
              {!isDataReady ? (
                <ActivityIndicator size={20} indicatorColor={theme.colorTextLight4} />
              ) : (
                <Number
                  size={14}
                  value={isNativeTokenValue ? estimateFee : convertedEstimatedFee}
                  suffix={isNativeTokenValue ? nativeTokenSymbol : symbol}
                  decimal={isNativeTokenValue ? nativeTokenDecimals : decimals}
                  unitColor={theme['gray-5']}
                  decimalColor={theme['gray-5']}
                  intColor={theme['gray-5']}
                />
              )}
            </View>
          </View>
          {FEE_TYPES_CAN_SHOW.includes(feeType) && (
            <View style={styles.rightArea}>
              <Number
                size={14}
                value={convertedFeeValueToUSD}
                decimal={0}
                prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
                suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              />
              <Tooltip
                isVisible={tooltipVisible}
                disableShadow={true}
                placement={'top'}
                displayInsets={{ right: 0, top: 0, bottom: 0, left: 0 }}
                showChildInTooltip={false}
                topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
                contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
                closeOnBackgroundInteraction={true}
                onClose={() => setTooltipVisible(false)}
                content={
                  <Typography.Text size={'sm'} style={{ color: theme.colorWhite, textAlign: 'center' }}>
                    {'Coming soon!'}
                  </Typography.Text>
                }>
                <Button
                  size={'xs'}
                  type={'ghost'}
                  icon={<Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={theme['gray-5']} />}
                  style={{ marginRight: -10 }}
                  disabled={!isDataReady}
                  loading={isLoadingToken}
                  onPress={onPressEdit}
                />
              </Tooltip>
            </View>
          )}
        </View>
      )}

      <ChooseFeeTokenModal
        tokenSlug={tokenSlug}
        convertedFeeValueToUSD={convertedFeeValueToUSD}
        estimateFee={estimateFee}
        feePercentageSpecialCase={feePercentageSpecialCase}
        items={listTokensCanPayFee}
        nativeTokenDecimals={nativeTokenDecimals}
        onSelectItem={onSetTokenPayFee}
        selectedItem={currentTokenPayFee || tokenPayFeeSlug}
        modalVisible={chooseFeeModalVisible}
        setModalVisible={setChooseFeeModalVisible}
      />

      {feeEditorModalVisible && (
        <FeeEditorModal
          modalVisible={feeEditorModalVisible}
          setModalVisible={setFeeEditorModalVisible}
          tokenSlug={tokenPayFeeSlug}
          decimals={decimals}
          symbol={symbol}
          onSetTokenPayFee={onSetTokenPayFee}
          currentTokenPayFee={currentTokenPayFee}
          feeType={feeType}
          chainValue={chainValue}
          priceValue={priceValue}
          listTokensCanPayFee={listTokensCanPayFee}
          feeOptionsInfo={feeOptionsInfo}
          selectedFeeOption={selectedFeeOption}
          onSelectOption={onSelectTransactionFee}
        />
      )}
    </>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: { flexDirection: 'row', width: '100%', alignItems: 'center', paddingBottom: 6 },
    leftArea: { flexDirection: 'row', flex: 1, gap: theme.sizeXXS, alignItems: 'center', flexWrap: 'wrap' },
    label: { color: theme['gray-5'], ...FontMedium },
    rightArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  });
}

export default FeeEditor;
