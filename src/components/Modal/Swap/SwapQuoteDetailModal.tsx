import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackgroundIcon,
  Divider,
  Icon,
  Logo,
  PageIcon,
  SwFullSizeModal,
  Typography,
} from 'components/design-system-ui';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { TouchableOpacity, View } from 'react-native';
import { CaretDown, CaretRight, CaretUp, Info, ListBullets, PencilSimpleLine } from 'phosphor-react-native';
import { FeeItem } from 'screens/Transaction/Swap';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { QuoteResetTime } from 'components/Swap/QuoteResetTime';
import { SwapRoute } from 'components/Swap/SwapRoute';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  renderRateInfo: () => React.JSX.Element | null;
  openChooseFeeToken: () => void;
  currentQuote?: SwapQuote;
  minimumReceived: string;
  symbol: string;
  quoteAliveUntil?: number;
  value: string | number | BigN;
  feeItems: FeeItem[];
  feeAssetInfo?: _ChainAsset;
  openSwapSelectorModal: () => void;
  renderSlippage: () => React.JSX.Element;
  handleRequestLoading: boolean;
  currencyData: CurrencyJson;
  decimals: number;
}

const numberMetadata = { maxNumberFormat: 8 };

export const SwapQuoteDetailModal = ({
  modalVisible,
  value,
  setModalVisible,
  renderRateInfo,
  currentQuote,
  minimumReceived,
  openChooseFeeToken,
  quoteAliveUntil,
  symbol,
  feeItems,
  openSwapSelectorModal,
  feeAssetInfo,
  renderSlippage,
  handleRequestLoading,
  currencyData,
  decimals,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const [isViewFeeDetails, setIsViewFeeDetails] = useState<boolean>(false);

  const onToggleFeeDetails = useCallback(() => {
    setIsViewFeeDetails(prev => !prev);
  }, []);

  return (
    <SwFullSizeModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      modalBaseV2Ref={modalBaseV2Ref}>
      <ContainerWithSubHeader
        title={'Swap quote detail'}
        style={{ paddingHorizontal: theme }}
        onPressBack={() => setModalVisible(false)}>
        <View style={{ paddingHorizontal: theme.padding }}>
          {handleRequestLoading ? (
            <View
              style={{
                marginTop: theme.margin,
                backgroundColor: theme.colorBgSecondary,
                alignItems: 'center',
                height: 184,
                justifyContent: 'center',
                borderRadius: theme.borderRadiusLG,
              }}>
              <PageIcon
                customSize={64}
                icon={ListBullets}
                color={theme.colorTextTertiary}
                backgroundColor={theme['gray-2']}
                customIcon={<ActivityIndicator size={36} />}
              />
              <Typography.Text style={{ color: theme.colorWhite, marginTop: theme.margin, textAlign: 'center' }}>
                {'Loading...'}
              </Typography.Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 40,
                  marginBottom: theme.marginXXS,
                }}
                disabled={!currentQuote}
                onPress={openSwapSelectorModal}>
                <View style={{ flexDirection: 'row', gap: theme.sizeXXS, alignItems: 'center' }}>
                  <BackgroundIcon
                    backgroundColor={theme.colorPrimary}
                    phosphorIcon={Info}
                    weight={'fill'}
                    shape={'circle'}
                  />
                  <Typography.Text size={'md'} style={{ color: theme.colorWhite }}>
                    {'Swap quote'}
                  </Typography.Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXS }}>
                  <Typography.Text style={{ color: theme.colorTextLight4 }}>{'View quote'}</Typography.Text>
                  <Icon phosphorIcon={CaretRight} iconColor={theme['gray-5']} size={'sm'} />
                </View>
              </TouchableOpacity>

              {currentQuote ? (
                <>
                  <MetaInfo hasBackgroundWrapper labelColorScheme={'gray'} spaceSize={'sm'} valueColorScheme={'gray'}>
                    <MetaInfo.Default label={'Quote rate'}>{<View>{renderRateInfo()}</View>}</MetaInfo.Default>
                    <MetaInfo.Default label={'Swap provider'}>
                      <View style={{ flexDirection: 'row', gap: theme.sizeXXS }}>
                        <Logo
                          isShowSubLogo={false}
                          network={currentQuote.provider.id.toLowerCase()}
                          shape="squircle"
                          size={24}
                        />
                        <Typography.Text style={{ color: theme.colorWhite }}>
                          {currentQuote.provider.name}
                        </Typography.Text>
                      </View>
                    </MetaInfo.Default>
                    <MetaInfo.Default label={'Swap route'} />
                    <SwapRoute swapRoute={currentQuote.route} />
                    <MetaInfo.Number
                      customFormatter={swapCustomFormatter}
                      formatType={'custom'}
                      metadata={numberMetadata}
                      valueColorSchema={'light'}
                      label={'Minimum received'}
                      value={minimumReceived}
                      suffix={symbol}
                      unitColor={theme.colorTextLight4}
                      decimals={decimals}
                    />
                  </MetaInfo>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: theme.marginXXS,
                      marginBottom: theme.margin,
                      justifyContent: 'space-between',
                    }}>
                    <QuoteResetTime quoteAliveUntilValue={quoteAliveUntil} />
                    {renderSlippage()}
                  </View>

                  <MetaInfo hasBackgroundWrapper labelColorScheme={'gray'} valueColorScheme={'light'} spaceSize={'xs'}>
                    <TouchableOpacity activeOpacity={1} onPress={onToggleFeeDetails}>
                      <MetaInfo.Number
                        valueColorSchema={'light'}
                        label={'Estimated fee'}
                        value={value}
                        decimals={0}
                        prefix={currencyData?.symbol}
                        suffixNode={
                          <Icon
                            phosphorIcon={isViewFeeDetails ? CaretUp : CaretDown}
                            size={'sm'}
                            iconColor={theme['gray-5']}
                          />
                        }
                      />
                    </TouchableOpacity>

                    {isViewFeeDetails && (
                      <View style={{ paddingLeft: theme.padding, gap: theme.sizeXS, paddingBottom: theme.sizeXXS }}>
                        {feeItems.map(item => (
                          <MetaInfo.Number
                            decimals={0}
                            key={item.type}
                            label={item.label}
                            prefix={item.prefix}
                            suffix={item.suffix}
                            value={item.value}
                          />
                        ))}
                      </View>
                    )}

                    <Divider type={'horizontal'} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Typography.Text style={{ color: theme.colorTextLight4 }}>{'Fee paid in'}</Typography.Text>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={openChooseFeeToken}>
                        <Logo size={24} shape={'circle'} token={feeAssetInfo && feeAssetInfo.slug.toLowerCase()} />
                        <Typography.Text
                          style={{
                            color: theme.colorWhite,
                            paddingLeft: theme.paddingXS,
                            paddingRight: theme.paddingXXS,
                          }}>
                          {_getAssetSymbol(feeAssetInfo)}
                        </Typography.Text>
                        <Icon phosphorIcon={PencilSimpleLine} size={'sm'} iconColor={theme['gray-5']} />
                      </TouchableOpacity>
                    </View>
                  </MetaInfo>
                </>
              ) : (
                <View
                  style={{
                    backgroundColor: theme.colorBgSecondary,
                    alignItems: 'center',
                    paddingVertical: 36,
                    borderRadius: theme.borderRadiusLG,
                  }}>
                  <PageIcon
                    customSize={64}
                    icon={ListBullets}
                    color={theme.colorTextTertiary}
                    backgroundColor={'rgba(77, 77, 77, 0.1)'}
                  />
                  <Typography.Text style={{ color: theme.colorWhite, marginTop: theme.margin }}>
                    {'No routes available at this time.'}
                  </Typography.Text>
                  <Typography.Text style={{ color: theme.colorWhite }}>
                    {'Please try a different pair.'}
                  </Typography.Text>
                </View>
              )}
            </>
          )}
        </View>
      </ContainerWithSubHeader>
    </SwFullSizeModal>
  );
};
