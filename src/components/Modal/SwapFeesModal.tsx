import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CommonFeeComponent, SwapFeeType, SwapQuote } from '@subwallet/extension-base/types';
import { VoidFunction } from 'types/index';
import BigN from 'bignumber.js';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_TEN, BN_ZERO } from '@subwallet/extension-base/utils';
import { Button, Divider, Icon, SwModal, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Info } from 'phosphor-react-native';
import { FontSemiBold } from 'styles/sharedStyles';

export interface SwapFeesModalProps {
  currentQuote: SwapQuote;
  estimatedFeeValue: BigN;
}

type Props = SwapFeesModalProps & {
  onCancel: VoidFunction;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
};

interface FeeItem {
  value: BigN;
  type: SwapFeeType;
  label: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

const defaultTooltipMap: Record<SwapFeeType, (percentage?: number) => string> = {
  [SwapFeeType.PLATFORM_FEE]: () =>
    'Fee paid to third-party providers to facilitate the swap. It is not paid to SubWallet',
  [SwapFeeType.NETWORK_FEE]: () =>
    'Fee paid to process your transaction on the blockchain. It is not paid to SubWallet',
  [SwapFeeType.WALLET_FEE]: (percentage?: number) => {
    if (!percentage) {
      return 'Fee charged by SubWallet, which is automatically factored into this quote';
    } else {
      return `A fee of ${percentage}% is automatically factored into this quote`;
    }
  },
};

interface SwapFeeItemProps {
  item: FeeItem;
}

const SwapFeeItem: React.FC<SwapFeeItemProps> = ({ item }: SwapFeeItemProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <MetaInfo.Number
      label={
        <Tooltip
          isVisible={tooltipVisible}
          disableShadow={true}
          placement={'top'}
          showChildInTooltip={false}
          topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
          contentStyle={styles.tooltipContentStyle}
          closeOnBackgroundInteraction={true}
          onClose={() => {
            setTooltipVisible(false);
          }}
          content={
            <Typography.Text size={'sm'} style={styles.tooltipContentTextStyle}>
              {item.tooltip || ''}
            </Typography.Text>
          }>
          <TouchableOpacity style={styles.tooltipLabelStyle} onPress={() => setTooltipVisible(true)}>
            <Typography.Text style={{ color: theme.colorTextLight4, ...FontSemiBold }}>{item.label}</Typography.Text>
            <Icon phosphorIcon={Info} size="xs" iconColor={theme.colorTextLight4} weight={'bold'} />
          </TouchableOpacity>
        </Tooltip>
      }
      decimals={0}
      prefix={item.prefix}
      suffix={item.suffix}
      useNumberDisplay
      value={item.value}
    />
  );
};

const SwapFeesModal: React.FC<Props> = ({
  currentQuote,
  estimatedFeeValue,
  onCancel,
  modalVisible,
  setModalVisible,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const getConvertedBalance = useCallback(
    (feeItem: CommonFeeComponent) => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        return new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price);
      }

      return BN_ZERO;
    },
    [assetRegistryMap, priceMap],
  );

  const feeItems = useMemo(() => {
    const result: FeeItem[] = [];

    const feeConfigs = [
      {
        type: SwapFeeType.NETWORK_FEE,
        label: 'Network fee',
        getTooltip: () => defaultTooltipMap[SwapFeeType.NETWORK_FEE](),
      },
      {
        type: SwapFeeType.PLATFORM_FEE,
        label: 'Provider fee',
        getTooltip: () => defaultTooltipMap[SwapFeeType.PLATFORM_FEE](),
      },
      {
        type: SwapFeeType.WALLET_FEE,
        label: 'SubWallet fee',
        getTooltip: (percentage?: number) => defaultTooltipMap[SwapFeeType.WALLET_FEE](percentage),
      },
    ];

    const createFeeItem = (
      type: SwapFeeType,
      label: string,
      getTooltip: (percentage?: number) => string,
      percentage?: number,
    ): FeeItem => ({
      label,
      value: new BigN(0),
      prefix: currencyData.isPrefix ? currencyData.symbol : '',
      suffix: !currencyData.isPrefix ? currencyData.symbol : '',
      type,
      tooltip: getTooltip(percentage),
    });

    const activeFeeTypes = new Set(currentQuote?.feeInfo?.feeComponent?.map(item => item.feeType) ?? []);

    const feeTypeMap: Record<SwapFeeType, FeeItem> = feeConfigs
      .filter(config => activeFeeTypes.has(config.type))
      .reduce(
        (map, { getTooltip, label, type }) => ({
          ...map,
          [type]: createFeeItem(type, label, getTooltip),
        }),
        {} as Record<SwapFeeType, FeeItem>,
      );

    currentQuote?.feeInfo.feeComponent.forEach(feeItem => {
      const { feeType, percentage } = feeItem;

      feeTypeMap[feeType].value = feeTypeMap[feeType].value.plus(getConvertedBalance(feeItem));

      if (feeType === SwapFeeType.WALLET_FEE) {
        feeTypeMap[feeType].tooltip = defaultTooltipMap[feeType](percentage);
      }
    });

    Object.values(feeTypeMap).forEach(fee => {
      if (!fee.value.lt(new BigN(0))) {
        result.push(fee);
      }
    });

    return result;
  }, [currencyData.isPrefix, currencyData.symbol, currentQuote?.feeInfo.feeComponent, getConvertedBalance]);

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalTitle={'Swap fees'}
      footer={
        <Button style={{ marginTop: theme.margin }} onPress={onCancel}>
          Close
        </Button>
      }>
      <MetaInfo hasBackgroundWrapper labelColorScheme={'gray'} spaceSize={'sm'} valueColorScheme={'light'}>
        <View style={{ gap: theme.size }}>
          {feeItems.map(item => (
            <SwapFeeItem item={item} />
          ))}

          <Divider type={'horizontal'} />

          <MetaInfo.Number
            decimals={0}
            label={
              <Typography.Text style={{ color: theme.colorTextLight4, ...FontSemiBold }}>
                {'Estimated total fee'}
              </Typography.Text>
            }
            prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
            suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
            useNumberDisplay={true}
            value={estimatedFeeValue}
          />
        </View>
      </MetaInfo>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    tooltipContentStyle: { backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG },
    tooltipContentTextStyle: { color: theme.colorWhite, textAlign: 'center' },
    tooltipLabelStyle: { flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS },
  });
}

export default SwapFeesModal;
