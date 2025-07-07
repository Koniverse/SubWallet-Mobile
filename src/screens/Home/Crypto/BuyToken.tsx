import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { ShoppingCartSimple } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { TokenSelector } from 'components/Modal/common/TokenSelector';
import useBuyToken from 'hooks/screen/Home/Crypto/useBuyToken';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';
import { ServiceModal } from 'screens/Home/Crypto/ServiceModal';
import { FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { BuyTokenProps } from 'routes/wrapper';
import { DisclaimerModal } from 'components/Buy/DisclaimerModal';
import { SupportService } from 'types/buy';
import { TokenItemType } from 'components/Modal/common/TokenSelector';

const submitButtonIcon = (iconColor: string) => (
  <Icon phosphorIcon={ShoppingCartSimple} weight={'fill'} iconColor={iconColor} />
);
export const BuyToken = ({
  route: {
    params: { symbol: groupSymbol },
  },
}: BuyTokenProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const { tokens } = useSelector((state: RootState) => state.buyService);
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
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
    serviceItems,
    disclaimerData,
  } = useBuyToken(currentAccountProxy, groupSymbol);
  const [disclaimerAgree, setDisclaimerAgree] = useState<Record<SupportService, boolean>>({
    transak: false,
    banxa: false,
    onramper: false,
    moonpay: false,
    coinbase: false,
    meld: false,
  });
  const [isVisible, setVisible] = useState(false);
  const { isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { contactUrl, name: serviceName, policyUrl, termUrl, url } = disclaimerData;

  useEffect(() => {
    const onBackPress = () => {
      navigation.navigate('Home');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectBuyToken = useCallback(
    (item: TokenItemType) => {
      openSelectBuyToken(item);
    },
    [openSelectBuyToken],
  );

  const selectedAccount = useGetAccountByAddress(selectedBuyAccount);
  const selectedBuyTokenInfo = useMemo(() => {
    return {
      symbol: selectedBuyToken ? tokens[selectedBuyToken].symbol : '',
      slug: selectedBuyToken ? tokens[selectedBuyToken].slug : '',
    };
  }, [selectedBuyToken, tokens]);

  const onSubmit = () => {
    if (selectedService && disclaimerAgree[selectedService as SupportService]) {
      onBuyToken();
      return;
    }
    setVisible(true);
  };
  const onConfirm = useCallback(
    (isConfirmed: boolean) => () => {
      if (isConfirmed && selectedService) {
        onBuyToken();
        setDisclaimerAgree(oldState => ({ ...oldState, [selectedService]: true }));
      }
      setVisible(false);
    },
    [onBuyToken, selectedService],
  );
  const openUrl = useCallback(() => Linking.openURL(url), [url]);
  const opentermUrl = useCallback(() => Linking.openURL(termUrl), [termUrl]);
  const openpolicyUrl = useCallback(() => Linking.openURL(policyUrl), [policyUrl]);
  const opencontactUrl = useCallback(() => Linking.openURL(contactUrl), [contactUrl]);
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

          <View style={styles.tokenAndServiceWrapper}>
            <View style={{ flex: 1 }}>
              <TokenSelector
                items={buyTokenSelectorItems}
                selectedValueMap={selectedBuyToken ? { [selectedBuyToken]: true } : {}}
                onSelectItem={onSelectBuyToken}
                tokenSelectorRef={tokenBuyRef}
                renderSelected={() => (
                  <TokenSelectField logoKey={selectedBuyTokenInfo.slug} value={selectedBuyTokenInfo.symbol} showIcon />
                )}
                selectedValue={selectedBuyTokenInfo.slug}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ServiceModal
                items={serviceItems}
                serviceRef={serviceBuyRef}
                onPressItem={onPressItem}
                selectedService={selectedService}
              />
            </View>
          </View>
          <View style={{ marginBottom: theme.marginSM }}>
            <AccountSelector
              items={buyAccountSelectorItems}
              selectedValueMap={selectedAccount ? { [selectedAccount.address]: true } : {}}
              onSelectItem={openSelectBuyAccount}
              accountSelectorRef={accountBuyRef}
              disabled={!isAllAccount}
              renderSelected={() => (
                <AccountSelectField
                  label={'To:'}
                  accountName={selectedAccount?.name || ''}
                  value={selectedBuyAccount || ''}
                  showIcon
                  horizontal
                  labelStyle={{ width: 48 }}
                />
              )}
            />
          </View>
          <Typography.Text style={styles.buyTokenText}>{i18n.message.buyMessage}</Typography.Text>
        </View>
        <Button
          disabled={!selectedBuyAccount || !selectedBuyToken || !selectedService}
          style={{ ...MarginBottomForSubmitButton, marginHorizontal: theme.padding }}
          onPress={onSubmit}
          icon={submitButtonIcon}>
          {i18n.buttonTitles.buyNow}
        </Button>
        <DisclaimerModal
          modalVisible={isVisible}
          setVisible={setVisible}
          onConfirm={onConfirm}
          content={
            <Typography.Text style={styles.textAlignBoth}>
              You are now leaving SubWallet for{' '}
              <Typography.Text style={styles.link} onPress={openUrl}>
                {serviceName}
              </Typography.Text>
              . Services related to card payments are provided by {serviceName}, a separate third-party platform. By
              proceeding and procuring services from {serviceName}, you acknowledge that you have read and agreed to{' '}
              {serviceName}'s{' '}
              <Typography.Text style={styles.link} onPress={opentermUrl}>
                Term of service
              </Typography.Text>{' '}
              and{' '}
              <Typography.Text style={styles.link} onPress={openpolicyUrl}>
                Privacy Pollicy
              </Typography.Text>{' '}
              . For any question related to {serviceName}'s services, please visit {serviceName}
              's{' '}
              <Typography.Text style={styles.link} onPress={opencontactUrl}>
                Support site
              </Typography.Text>{' '}
              .
            </Typography.Text>
          }
        />
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
    tokenAndServiceWrapper: {
      width: '100%',
      flexDirection: 'row',
      gap: 12,
      paddingTop: 4,
      paddingBottom: theme.paddingXXS,
    },
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
    link: { color: theme.colorLink },
    textAlignBoth: { textAlign: 'justify' },
  });
}
