import React, { useMemo } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { ShoppingCartSimple } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountSelector } from 'components/Modal/common/AccountSelectorNew';
import { TokenSelector } from 'components/Modal/common/TokenSelectorNew';
import useBuyToken from 'hooks/screen/Home/Crypto/useBuyToken';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { PREDEFINED_TRANSAK_TOKEN_BY_SLUG } from '../../../predefined/transak';
import { StyleSheet, View } from 'react-native';
import { ServiceModal } from 'screens/Home/Crypto/ServiceModal';
import { FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { BuyTokenProps } from 'routes/wrapper';

export const BuyToken = ({
  route: {
    params: { slug: tokenGroupSlug, symbol: groupSymbol },
  },
}: BuyTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const { isAllAccount } = useSelector((state: RootState) => state.accountState);
  const {
    openSelectBuyAccount,
    openSelectBuyToken,
    selectedBuyAccount,
    selectedBuyToken,
    buyAccountSelectorItems,
    buyTokenSelectorItems,
    accountBuyRef,
    tokenBuyRef,
    serviceBuyRef,
    onBuyToken,
    onPressItem,
    selectedService,
    isOpenInAppBrowser,
    serviceUrl,
  } = useBuyToken(tokenGroupSlug, groupSymbol);

  const selectedAccount = useGetAccountByAddress(selectedBuyAccount);
  console.log('selectedBuyToken', selectedBuyToken);
  const symbol = useMemo(() => {
    return selectedBuyToken ? PREDEFINED_TRANSAK_TOKEN_BY_SLUG[selectedBuyToken].symbol : '';
  }, [selectedBuyToken]);

  return (
    <ContainerWithSubHeader
      title={i18n.header.buyToken}
      isShowMainHeader={true}
      onPressBack={() => navigation.navigate('Home')}>
      <>
        <View style={styles.contentWrapper}>
          <View style={styles.pageIconWrapper}>
            <PageIcon icon={ShoppingCartSimple} color={theme.colorSuccess} />
          </View>

          <AccountSelector
            items={buyAccountSelectorItems}
            selectedValueMap={selectedAccount ? { [selectedAccount.address]: true } : {}}
            onSelectItem={openSelectBuyAccount}
            accountSelectorRef={accountBuyRef}
            disabled={!isAllAccount}
            renderSelected={() => (
              <AccountSelectField
                label={i18n.inputLabel.selectAcc}
                accountName={selectedAccount?.name || ''}
                value={selectedBuyAccount || ''}
                showIcon
              />
            )}
          />
          <View style={styles.tokenAndServiceWrapper}>
            <View style={{ flex: 1 }}>
              <ServiceModal
                disabled={!selectedBuyAccount || !selectedBuyToken}
                onPressItem={onPressItem}
                selectedService={selectedService}
                isOpenInAppBrowser={isOpenInAppBrowser}
                serviceRef={serviceBuyRef}
                token={selectedBuyToken}
                address={selectedBuyAccount}
                onBuyToken={onBuyToken}
              />
            </View>

            <View style={{ flex: 1 }}>
              <TokenSelector
                disabled={!selectedBuyAccount || !!tokenGroupSlug}
                items={buyTokenSelectorItems}
                selectedValueMap={selectedBuyToken ? { [selectedBuyToken]: true } : {}}
                onSelectItem={openSelectBuyToken}
                tokenSelectorRef={tokenBuyRef}
                renderSelected={() => <TokenSelectField logoKey={symbol} value={symbol} showIcon />}
              />
            </View>
          </View>
          <Typography.Text style={styles.buyTokenText}>{i18n.message.buyMessage}</Typography.Text>
        </View>
        <Button
          disabled={!serviceUrl || !selectedBuyAccount || !selectedBuyToken}
          style={{ ...MarginBottomForSubmitButton, marginHorizontal: theme.padding }}
          onPress={() => onBuyToken()}
          icon={iconColor => <Icon phosphorIcon={ShoppingCartSimple} weight={'fill'} iconColor={iconColor} />}>
          {i18n.buttonTitles.buyNow}
        </Button>
      </>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    contentWrapper: { paddingHorizontal: theme.padding, flex: 1 },
    pageIconWrapper: {
      width: '100%',
      alignItems: 'center',
      paddingTop: theme.paddingXXL,
      paddingBottom: theme.paddingLG,
    },
    tokenAndServiceWrapper: { width: '100%', flexDirection: 'row', gap: 12, paddingTop: 4 },
    buyTokenText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight5,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    symbol: {
      ...FontSemiBold,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight1,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      gap: theme.sizeSM,
      marginBottom: theme.marginSM,
    },
  });
}
