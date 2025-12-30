import { useNavigation } from '@react-navigation/native';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import { TextField } from 'components/Field/Text';
import ImagePreview from 'components/ImagePreview';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import useScanExplorerAddressUrl from 'hooks/screen/useScanExplorerAddressUrl';
import { SlidersHorizontal } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { NFTDetailProps } from 'screens/Home/NFT/NFTStackScreen';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ActivityIndicator, Button, Typography } from 'components/design-system-ui';
import useFetchChainInfo from 'hooks/common/useFetchChainInfo';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import WebView from 'react-native-webview';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deviceWidth } from 'constants/index';
import { SHOW_3D_MODELS_CHAIN } from 'constants/nft';
import { reformatAddress } from '@subwallet/extension-base/utils';
import useGetAccountInfoByAddress from 'hooks/screen/useGetAccountInfoByAddress';
import { getTransactionFromAccountProxyValue } from 'hooks/screen/Transaction/useTransaction';
import { ThemeTypes } from 'styles/themes';

const NftDetail = ({
  route: {
    params: { collectionId: _collectionId, nftId },
  },
}: NFTDetailProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();
  const [isLoading3dNft, setIsLoading3dNft] = useState(true);
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const { accounts, currentAccountProxy } = useSelector((state: RootState) => state.accountState);

  const collectionInfo = useMemo((): NftCollection => {
    return nftCollections.find(i => _collectionId === `${i.collectionName}-${i.collectionId}`) || ({} as NftCollection);
  }, [_collectionId, nftCollections]);

  const nftItem = useMemo(() => {
    return nftItems.find(item => nftId === `${item.collectionId}-${item.id}`) || ({} as NftItem);
  }, [nftId, nftItems]);

  const goHome = useGoHome({ screen: 'NFTs', params: { screen: 'CollectionList' } });
  useHandleGoHome({
    goHome: goHome,
    networkKey: nftItem.chain || collectionInfo.chain || '',
    networkFocusRedirect: false,
  });

  const originChainInfo = useFetchChainInfo(nftItem.chain);
  const ownerAccountInfo = useGetAccountInfoByAddress(nftItem.owner || '');
  const ownerUrl = useScanExplorerAddressUrl(originChainInfo?.slug || '', nftItem.owner || '');
  const nftDetailImageUrl = useMemo(() => nftItem.image || collectionInfo.image, [nftItem.image, collectionInfo.image]);

  const show = useCallback(
    (message: string, type?: 'normal' | 'success' | 'danger' | 'warning' | '') => {
      toast.hideAll();
      toast.show(message, { type: type });
    },
    [toast],
  );

  const handleClickComingSoon = useCallback(() => {
    show(i18n.notificationMessage.comingSoon);
  }, [show]);

  const propDetail = useCallback(
    (title: string, valueDict: Record<string, any>, key: number): JSX.Element => {
      if (!valueDict.type || valueDict.type === 'string') {
        return (
          <View style={styles.propWrapper} key={key}>
            <View style={styles.propDetail}>
              <Typography.Text style={styles.propTitleStyle}>{title}</Typography.Text>
              <Typography.Text ellipsis style={styles.propValueStyle}>
                {valueDict.value}
              </Typography.Text>
            </View>
          </View>
        );
      }

      return <View key={key} />;
    },
    [styles.propDetail, styles.propTitleStyle, styles.propValueStyle, styles.propWrapper],
  );

  const onPressSend = useCallback(() => {
    if (nftItem && nftItem.owner) {
      const ownerAddress = reformatAddress(nftItem.owner, 42);
      const owner = accounts.find(a => a.address === ownerAddress);

      if (owner?.isReadOnly) {
        show('The NFT owner is a watch-only account, you cannot send the NFT with it');
      }
      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'SendNFT',
        params: {
          itemId: nftItem.id,
          chain: nftItem.chain,
          collectionId: nftItem.collectionId,
          owner: getTransactionFromAccountProxyValue(currentAccountProxy),
        },
      },
    });
  }, [nftItem, navigation, currentAccountProxy, accounts, show]);

  const handleClickInfoIcon = useCallback((url?: string) => {
    if (!url) {
      return noop;
    }
    return () => {
      Linking.openURL(url);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoading3dNft(false), 1000);
  }, []);

  const show3DModel = SHOW_3D_MODELS_CHAIN.includes(nftItem.chain);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      titleTextAlign={'left'}
      isShowMainHeader={true}
      title={nftItem.name || i18n.title.nftDetail}
      style={styles.containerHeader}
      isHideBottomSafeArea={true}
      onPressBack={() => navigation.goBack()}>
      <>
        <ScrollView style={styles.containerDetail} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {show3DModel ? (
            <View style={{ width: deviceWidth - 32, height: deviceWidth - 32, position: 'relative' }}>
              <WebView
                style={{ borderRadius: 14.32, flex: 1, backgroundColor: theme.colorBgSecondary }}
                webviewDebuggingEnabled
                scrollEnabled
                source={{
                  html:
                    `<html><head><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script><style>body, html { background-color: ${theme.colorBgSecondary} }</style>\n` +
                    `</head><body><model-viewer id="model-viewer" src="${nftItem.image}" alt="model-viewer" ar-status="not-presenting" auto-rotate="true" auto-rotate-delay="100" rotation-per-second="30deg" bounds="tight" disable-pan="true" disable-scroll="true" disable-tap="true" disable-zoom="true" environment-image="neutral" interaction-prompt="none" loading="eager" style="width: 100%; height: 100%" touch-action="none"></model-viewer></body></html>`,
                }}
              />
              {isLoading3dNft && (
                <View style={styles.loadingIconWrapperStyle}>
                  <ActivityIndicator size={32} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imageContainerStyle}>
              <ImagePreview
                style={styles.imageStyle}
                mainUrl={nftDetailImageUrl}
                backupUrl={collectionInfo.image}
                borderRadius={14.32}
                borderPlace={'full'}
              />
            </View>
          )}
          {!!nftItem.description && (
            <View>
              <Typography.Text style={styles.attTitle}>{i18n.inputLabel.nftDetails}</Typography.Text>
              <Typography.Text style={styles.attValue}>{nftItem?.description}</Typography.Text>
            </View>
          )}
          <TouchableOpacity style={styles.resourceContainerStyle} activeOpacity={0.5} onPress={handleClickComingSoon}>
            <View style={styles.resourceIconContainerStyle}>
              <SlidersHorizontal size={20} color={theme.colorSuccess} />
            </View>
            <Text style={styles.resourceTitleStyle}>{i18n.nftScreen.nftDetail.resourcesOrInventory}</Text>
          </TouchableOpacity>
          <TextField
            text={collectionInfo.collectionName || collectionInfo.collectionId}
            label={i18n.inputLabel.nftCollectionName}
            showRightIcon={!!nftItem.externalUrl}
            onPressRightIcon={handleClickInfoIcon(nftItem.externalUrl)}
          />
          {!!nftItem.owner && (
            <AddressField
              name={ownerAccountInfo?.name}
              address={nftItem?.owner}
              networkPrefix={_getChainSubstrateAddressPrefix(originChainInfo)}
              label={i18n.inputLabel.ownedBy}
              onPressRightIcon={handleClickInfoIcon(ownerUrl)}
            />
          )}
          <NetworkField networkKey={nftItem.chain || collectionInfo.chain || ''} label={i18n.inputLabel.network} />
          {!!nftItem.rarity && (
            <View>
              <Typography.Text style={styles.attTitle}>{i18n.nftScreen.nftDetail.rarity}</Typography.Text>
              <Typography.Text style={styles.attValue}>{nftItem?.rarity}</Typography.Text>
            </View>
          )}

          <View>
            <Typography.Text style={styles.attTitle}>{i18n.nftScreen.nftDetail.properties}</Typography.Text>
            <View style={styles.propContainer}>
              {propDetail(
                i18n.inputLabel.nftId,
                { value: nftItem.id },
                (nftItem?.properties ? Object.keys(nftItem?.properties).length : 0) + 1,
              )}
              {propDetail(
                i18n.inputLabel.collectionId,
                { value: nftItem.collectionId },
                (nftItem?.properties ? Object.keys(nftItem?.properties).length : 0) + 2,
              )}
              {!!nftItem.properties && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {Object.keys(nftItem?.properties).map((key, index) => {
                    // @ts-ignore
                    return propDetail(key, data?.properties[key], index);
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={{ ...ContainerHorizontalPadding, marginTop: theme.margin, marginBottom: theme.margin }}>
          <Button onPress={onPressSend}>{i18n.buttonTitles.send}</Button>
        </View>
      </>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    containerHeader: {
      width: '100%',
      position: 'relative',
    },
    containerDetail: {
      marginTop: theme.marginMD,
      paddingHorizontal: theme.padding,
    },
    propContainer: {
      marginTop: theme.marginLG,
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'row',
      marginHorizontal: -theme.marginXS,
      marginBottom: -theme.margin,
    },
    propDetail: {
      paddingTop: theme.paddingXXS,
      paddingBottom: theme.paddingXS + 2,
      paddingHorizontal: theme.padding,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadius,
    },
    propWrapper: {
      paddingHorizontal: theme.paddingXS,
      marginBottom: theme.margin,
    },
    propTitleStyle: {
      color: theme.colorTextPrimary,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      ...FontMedium,
    },
    propValueStyle: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight1,
    },
    attTitle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      marginTop: theme.marginSM,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    attValue: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      marginTop: theme.marginXS,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
    imageContainerStyle: {
      display: 'flex',
      alignItems: 'center',
    },
    imageStyle: {
      width: '100%',
      aspectRatio: 1,
    },
    resourceContainerStyle: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.marginXS,
      marginBottom: theme.margin,
    },
    resourceIconContainerStyle: {
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resourceTitleStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      marginLeft: 4,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    loadingIconWrapperStyle: {
      position: 'absolute',
      backgroundColor: theme.colorBgSecondary,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14.32,
    },
  });
}

export default React.memo(NftDetail);
