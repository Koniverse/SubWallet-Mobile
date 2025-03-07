import React, { useCallback, useMemo, useState } from 'react';
import { FeeChainType, FeeDetail, TransactionFee } from '@subwallet/extension-base/types';
import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { VoidFunction } from 'types/index';
import BigN from 'bignumber.js';
import { Keyboard, Platform, StatusBar, View } from 'react-native';
import { ActivityIndicator, Typography, Number, Button, Icon } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import { PencilSimpleLine } from 'phosphor-react-native';
import { ASSET_HUB_CHAIN_SLUGS } from '@subwallet/extension-base/constants';
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
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

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
  tokenSlug,
  setModalVisible,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const priceMap = useSelector((state: RootState) => state.price.priceMap);

  const [chooseFeeModalVisible, setChooseFeeModalVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tokenAsset = (() => {
    return assetRegistry[tokenPayFeeSlug] || undefined;
  })();

  const nativeAsset = (() => {
    return assetRegistry[nativeTokenSlug] || undefined;
  })();

  const decimals = _getAssetDecimals(tokenAsset);
  // @ts-ignore
  // const priceId = _getAssetPriceId(tokenAsset);
  // const priceValue = priceMap[priceId] || 0;
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

  // const onSelectTransactionFee = useCallback(
  //   (fee: TransactionFee) => {
  //     onSelect?.(fee);
  //   },
  //   [onSelect],
  // );

  const isXcm = useMemo(() => {
    return chainValue && destChainValue && chainValue !== destChainValue;
  }, [chainValue, destChainValue]);

  const isEditButton = useMemo(() => {
    return (
      !!(
        chainValue &&
        ASSET_HUB_CHAIN_SLUGS.includes(chainValue) &&
        feeType === 'substrate' &&
        listTokensCanPayFee.length
      ) && !isXcm
    );
  }, [isXcm, chainValue, feeType, listTokensCanPayFee.length]);

  const onPressEdit = useCallback(() => {
    Keyboard.dismiss();

    if (!isEditButton) {
      setTimeout(() => {
        setTooltipVisible(true);
      }, 500);

      return;
    }

    if (chainValue && ASSET_HUB_CHAIN_SLUGS.includes(chainValue)) {
      setTimeout(() => {
        setChooseFeeModalVisible(true);
      }, 300);
    } else {
      setTimeout(() => {
        setModalVisible(true);
      }, 100);
    }
  }, [chainValue, isEditButton, setModalVisible]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', flex: 1, gap: theme.sizeXXS, alignItems: 'center' }}>
            <Typography.Text style={{ color: theme.colorTextLight4, ...FontMedium }}>
              {`${i18n.inputLabel.estimatedFee}:`}
            </Typography.Text>
            <View>
              {!isDataReady ? (
                <ActivityIndicator size={20} indicatorColor={theme.colorTextLight4} />
              ) : (
                <Number
                  size={14}
                  // textStyle={{ color: theme.colorTextLight4, ...FontSemiBold }}
                  value={isNativeTokenValue ? estimateFee : convertedEstimatedFee}
                  suffix={isNativeTokenValue ? nativeTokenSymbol : symbol}
                  decimal={isNativeTokenValue ? nativeTokenDecimals : decimals}
                  unitColor={theme.colorTextLight4}
                  decimalColor={theme.colorTextLight4}
                  intColor={theme.colorTextLight4}
                />
              )}
            </View>
          </View>
          {feeType !== 'ton' && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Number size={14} value={convertedFeeValueToUSD} decimal={0} prefix={'~ $'} />
                <Tooltip
                  isVisible={tooltipVisible}
                  disableShadow={true}
                  placement={'top'}
                  displayInsets={{ right: 0, top: 0, bottom: 0, left: 0 }}
                  showChildInTooltip={false}
                  topAdjustment={
                    Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0
                  }
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
    </>
  );
};

export default FeeEditor;
