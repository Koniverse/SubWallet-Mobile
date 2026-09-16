import { useNavigation } from '@react-navigation/native';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import { reformatAddress } from '@subwallet/extension-base/utils';
import ImagePreview from 'components/ImagePreview';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import MetaInfo from 'components/MetaInfo';
import { NftDescription } from 'components/common/NftDescription';
import useFetchChainInfo from 'hooks/common/useFetchChainInfo';
import { useGetUniqueNftDetail, useGetUniqueNftParent } from 'hooks/nft';
import useGetAccountInfoByAddress from 'hooks/screen/useGetAccountInfoByAddress';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import useScanExplorerAddressUrl from 'hooks/screen/useScanExplorerAddressUrl';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretRight, Info, PaperPlaneTilt, TreeStructure } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { NFTBundleDetailProps, NFTNavigationProps } from 'screens/Home/NFT/NFTStackScreen';
import { RootState } from 'stores/index';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { findNftDeep } from 'utils/nft';

// Unique's API wraps some attribute values as `{ value }`; everything else is shown as is.
const getPropertyValue = (value: unknown): string =>
  typeof value === 'object' && value !== null && 'value' in value
    ? String((value as { value: unknown }).value)
    : String(value);

const NftBundleDetail = ({
  route: {
    params: { chain, collectionId, nftId, rootTokenId },
  },
}: NFTBundleDetailProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const navigation = useNavigation<NFTNavigationProps>();
  const toast = useToast();

  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const { accounts } = useSelector((state: RootState) => state.accountState);

  const collectionInfo = useMemo((): NftCollection => {
    return nftCollections.find(i => i.chain === chain && i.collectionId === collectionId) || ({} as NftCollection);
  }, [chain, collectionId, nftCollections]);

  // Only the root token lives in the flat list; a nested one has to be dug out of the bundle tree.
  const storedNftItem = useMemo(() => {
    return findNftDeep(nftItems, nftId, chain, collectionId);
  }, [chain, collectionId, nftId, nftItems]);

  const parentNft = useGetUniqueNftParent(storedNftItem);
  const { data: fullNftItemFromApi } = useGetUniqueNftDetail(chain, collectionId, nftId);

  const nftItem = useMemo((): NftItem => {
    const base = storedNftItem || ({} as NftItem);

    if (!fullNftItemFromApi) {
      return { ...base, parent: parentNft };
    }

    return {
      ...base,
      parent: parentNft,
      name: fullNftItemFromApi.name || base.name,
      description: fullNftItemFromApi.description || base.description,
    };
  }, [fullNftItemFromApi, parentNft, storedNftItem]);

  const goHome = useGoHome({ screen: 'NFTs', params: { screen: 'CollectionList' } });
  useHandleGoHome({
    goHome: goHome,
    networkKey: nftItem.chain || collectionInfo.chain || '',
    networkFocusRedirect: false,
  });

  const originChainInfo = useFetchChainInfo(nftItem.chain || chain);
  const ownerAccountInfo = useGetAccountInfoByAddress(nftItem.owner || '');
  const ownerUrl = useScanExplorerAddressUrl(originChainInfo?.slug || '', nftItem.owner || '');
  const nftDetailImageUrl = useMemo(() => nftItem.image || collectionInfo.image, [nftItem.image, collectionInfo.image]);

  const nestingLevel = nftItem.nestingLevel ?? 0;
  const isNested = nestingLevel > 0;

  const show = useCallback(
    (message: string, type?: 'normal' | 'success' | 'danger' | 'warning' | '') => {
      toast.hideAll();
      toast.show(message, { type: type });
    },
    [toast],
  );

  const onPressSend = useCallback(() => {
    if (nftItem && nftItem.owner) {
      const ownerAddress = reformatAddress(nftItem.owner, 42);
      const owner = accounts.find(a => a.address === ownerAddress);

      if (owner?.isReadOnly) {
        show('The NFT owner is a watch-only account, you cannot send the NFT with it');
        return;
      }
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'SendNFT',
        params: {
          from: nftItem.owner,
          itemId: nftItem.id,
          chain: nftItem.chain,
          collectionId: nftItem.collectionId,
        },
      },
    });
  }, [nftItem, navigation, accounts, show]);

  const onShowNftStructure = useCallback(() => {
    navigation.navigate('NftViewStructure', { chain, collectionId, rootTokenId, selectedNftId: nftId });
  }, [chain, collectionId, navigation, nftId, rootTokenId]);

  const goToNft = useCallback(
    (targetNftId: string) => () => {
      // `push`, not `navigate`: the target route is the one we are already on, and the stack router
      // answers `navigate` for the focused route by swapping its params in place — that would flatten
      // the whole drill-down into a single entry and send Back out of the bundle.
      navigation.push('NftBundleDetail', { chain, collectionId, nftId: targetNftId, rootTokenId });
    },
    [chain, collectionId, navigation, rootTokenId],
  );

  const handleClickInfoIcon = useCallback((url?: string) => {
    if (!url) {
      return noop;
    }

    return () => {
      Linking.openURL(url);
    };
  }, []);

  const subtitle = useMemo(() => {
    if (!isNested) {
      return i18n.nftScreen.nestedNft.parent;
    }

    return i18n.nftScreen.nestedNft.nestedIn.replace('{{name}}', parentNft?.name || parentNft?.id || '');
  }, [isNested, parentNft]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      titleTextAlign={'left'}
      isShowMainHeader={true}
      title={nftItem.name || nftItem.id || i18n.title.nftDetail}
      style={styles.containerHeader}
      isHideBottomSafeArea={true}
      onPressBack={() => navigation.goBack()}
    >
      <>
        <ScrollView style={styles.containerDetail} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={styles.imageContainerStyle}>
            <ImagePreview
              style={styles.imageStyle}
              mainUrl={nftDetailImageUrl}
              backupUrl={collectionInfo.image}
              borderRadius={14.32}
              borderPlace={'top'}
            />
            <View style={styles.levelLabel}>
              <Typography.Text style={styles.levelLabelText}>
                {i18n.nftScreen.nestedNft.level.replace('{{level}}', String(nestingLevel))}
              </Typography.Text>
            </View>
          </View>

          <View style={styles.imageFooter}>
            <View style={styles.imageFooterLine1}>
              <View style={styles.imageFooterLeft}>
                <Typography.Text ellipsis style={styles.imageFooterTitle}>
                  {nftItem.name || nftItem.id}
                </Typography.Text>
                <Typography.Text ellipsis style={styles.imageFooterSubtitle}>
                  {subtitle}
                </Typography.Text>
              </View>
              <Button
                type={'ghost'}
                size={'xs'}
                onPress={onShowNftStructure}
                icon={
                  <Icon phosphorIcon={TreeStructure} size={'sm'} weight={'fill'} iconColor={theme.colorTextLight3} />
                }
              />
            </View>
            {isNested && !!nftItem.parent && (
              <View style={styles.imageFooterLine2}>
                <Button
                  block
                  type={'secondary'}
                  size={'sm'}
                  style={styles.goToParentButton}
                  onPress={goToNft(nftItem.parent.id)}>
                  {i18n.nftScreen.nestedNft.goToParent}
                </Button>
              </View>
            )}
          </View>

          {/* Same card as the extension's bundle detail: description, collection, owner, network,
              ids and the token's properties as rows of one MetaInfo block. */}
          <Typography.Text style={styles.attTitle}>{i18n.inputLabel.nftDetails}</Typography.Text>
          <MetaInfo hasBackgroundWrapper>
            {!!nftItem.description && (
              <MetaInfo.Default label={i18n.inputLabel.description} valueAlign={'left'}>
                <NftDescription layout={'inline'} title={nftItem.name || nftItem.id} description={nftItem.description} />
              </MetaInfo.Default>
            )}

            <MetaInfo.Default label={i18n.inputLabel.nftCollectionName}>
              {collectionInfo.collectionName || collectionInfo.collectionId}
            </MetaInfo.Default>

            {!!nftItem.owner && (
              <MetaInfo.Default label={i18n.inputLabel.ownedBy}>
                {valueStyle => (
                  <View style={styles.ownerValue}>
                    <AccountProxyAvatar size={24} value={ownerAccountInfo?.proxyId || nftItem.owner || ''} />
                    <View style={styles.ownerText}>
                      {!!ownerAccountInfo?.name && (
                        <Typography.Text ellipsis style={valueStyle}>
                          {ownerAccountInfo.name}
                        </Typography.Text>
                      )}
                      <Typography.Text ellipsis style={ownerAccountInfo?.name ? styles.ownerAddress : valueStyle}>
                        {toShort(reformatAddress(nftItem.owner || '', _getChainSubstrateAddressPrefix(originChainInfo)))}
                      </Typography.Text>
                    </View>
                    {!!ownerUrl && (
                      <TouchableOpacity activeOpacity={0.5} onPress={handleClickInfoIcon(ownerUrl)}>
                        <Icon phosphorIcon={Info} customSize={20} weight={'light'} iconColor={theme.colorTextLight4} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </MetaInfo.Default>
            )}

            <MetaInfo.Chain chain={nftItem.chain || collectionInfo.chain || ''} label={i18n.inputLabel.network} />
            <MetaInfo.Default label={i18n.inputLabel.nftId}>{nftItem.id}</MetaInfo.Default>
            <MetaInfo.Default label={i18n.inputLabel.collectionId}>{nftItem.collectionId}</MetaInfo.Default>

            {!!nftItem.properties &&
              Object.entries(nftItem.properties).map(([attName, attValueRaw]) => (
                <MetaInfo.Default key={attName} label={attName}>
                  {getPropertyValue(attValueRaw)}
                </MetaInfo.Default>
              ))}
          </MetaInfo>

          {!!nftItem.nestingTokens?.length && (
            <View>
              <Typography.Text style={styles.attTitle}>
                {i18n.nftScreen.nestedNft.childNfts.replace('{{count}}', String(nftItem.nestingTokens.length))}
              </Typography.Text>
              {nftItem.nestingTokens.map(child => {
                const childCount = child.nestingTokens?.length || 0;
                const childCountLabel = childCount > 1 ? i18n.nftScreen.nestedNft.items : i18n.nftScreen.nestedNft.item;

                return (
                  <TouchableOpacity
                    key={`${child.collectionId}-${child.id}`}
                    style={styles.childItem}
                    activeOpacity={0.8}
                    onPress={goToNft(child.id)}
                  >
                    <ImagePreview
                      style={styles.childItemImage}
                      mainUrl={child.image}
                      backupUrl={nftDetailImageUrl}
                      borderRadius={8}
                      borderPlace={'full'}
                    />
                    <View style={styles.childItemInfo}>
                      <Typography.Text ellipsis style={styles.childItemName}>
                        {child.name || child.id}
                      </Typography.Text>
                      <Typography.Text ellipsis style={styles.childItemSubtitle}>
                        {`${i18n.nftScreen.nestedNft.nestedIn.replace('{{name}}', nftItem.name || nftItem.id)} - `}
                        <Typography.Text style={styles.childItemCount}>
                          {`${childCount} ${childCountLabel}`}
                        </Typography.Text>
                      </Typography.Text>
                    </View>
                    <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {/* Two block buttons share the row; the outer padding is dropped so the longer label
              still fits on a ~360dp screen (the inner content padding stays). */}
          <Button
            block
            style={styles.footerButton}
            type={'secondary'}
            onPress={onShowNftStructure}
            icon={<Icon phosphorIcon={TreeStructure} size={'md'} weight={'fill'} iconColor={theme.colorWhite} />}
          >
            {i18n.nftScreen.nestedNft.nftStructure}
          </Button>
          {/* Only the root of a bundle is transferable: a nested token moves with its parent. */}
          <Button
            block
            style={styles.footerButton}
            disabled={isNested}
            onPress={onPressSend}
            icon={
              <Icon
                phosphorIcon={PaperPlaneTilt}
                size={'md'}
                weight={'fill'}
                iconColor={isNested ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
          >
            {i18n.buttonTitles.send}
          </Button>
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
    imageContainerStyle: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    },
    imageStyle: {
      width: '100%',
      aspectRatio: 1,
    },
    levelLabel: {
      position: 'absolute',
      top: theme.paddingXS,
      right: theme.paddingXS,
      zIndex: 10,
      paddingHorizontal: theme.paddingXS,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: theme.colorWarning,
    },
    levelLabelText: {
      fontSize: theme.fontSizeXS,
      lineHeight: theme.fontSizeXS * theme.lineHeightSM,
      color: theme.colorBgDefault,
      ...FontSemiBold,
    },
    imageFooter: {
      backgroundColor: theme.colorBgSecondary,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      paddingVertical: theme.paddingSM,
      marginBottom: theme.margin,
    },
    imageFooterLine1: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.padding,
      paddingRight: theme.paddingXS,
    },
    imageFooterLeft: {
      flex: 1,
      gap: 2,
    },
    imageFooterTitle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    imageFooterSubtitle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
    imageFooterLine2: {
      paddingTop: theme.paddingSM,
      paddingHorizontal: theme.padding,
      paddingBottom: theme.paddingXXS,
    },
    goToParentButton: {
      backgroundColor: theme.colorBgInput,
    },
    ownerValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      maxWidth: '100%',
    },
    ownerText: {
      flexShrink: 1,
      alignItems: 'flex-end',
    },
    ownerAddress: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight4,
      ...FontMedium,
    },
    attTitle: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      marginTop: theme.margin,
      marginBottom: theme.marginXS,
      color: theme.colorTextHeading,
      ...FontMedium,
    },
    childItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: 8,
      paddingVertical: theme.paddingXS,
      paddingLeft: theme.paddingXS + 2,
      paddingRight: theme.paddingXS,
      marginBottom: theme.marginXS,
    },
    childItemImage: {
      width: 40,
      height: 40,
    },
    childItemInfo: {
      flex: 1,
    },
    childItemName: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    childItemSubtitle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextTertiary,
      ...FontMedium,
    },
    childItemCount: {
      color: theme.colorSuccess,
    },
    footer: {
      ...ContainerHorizontalPadding,
      flexDirection: 'row',
      gap: theme.sizeXS,
      marginTop: theme.margin,
      marginBottom: theme.margin,
    },
    footerButton: {
      paddingHorizontal: 0,
    },
  });
}

export default React.memo(NftBundleDetail);
