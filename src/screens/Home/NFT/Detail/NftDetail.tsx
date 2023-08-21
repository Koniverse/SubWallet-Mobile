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
import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { accountCanSign, findAccountByAddress, getAccountSignMode } from 'utils/account';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import reformatAddress from 'utils/index';
import { NFTDetailProps } from 'screens/Home/NFT/NFTStackScreen';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button } from 'components/design-system-ui';
import useFetchChainInfo from 'hooks/common/useFetchChainInfo';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
  position: 'relative',
};

const ContainerDetailStyle: StyleProp<any> = {
  marginTop: 20,
  paddingHorizontal: 16,
};

const PropContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 24,
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  marginHorizontal: -8,
  marginBottom: -16,
};

const PropDetailStyle: StyleProp<ViewStyle> = {
  paddingTop: 4,
  paddingBottom: 10,
  paddingHorizontal: 16,
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
};

const PropWrapperStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 8,
  marginBottom: 16,
};

const PropTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.smallText,
  ...FontMedium,
  color: ColorMap.disabled,
  fontSize: 12,
};

const PropValueStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  ...FontMedium,
  fontSize: 15,
  color: ColorMap.light,
};

const AttTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  marginTop: 12,
  color: ColorMap.light,
};

const AttValueStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  marginTop: 8,
  fontSize: 15,
  color: ColorMap.disabled,
};

const ImageContainerStyle: StyleProp<any> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<ViewStyle> = {
  width: '100%',
  aspectRatio: 1,
};

const ResourceContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 16,
};

const ResourceIconContainerStyle: StyleProp<ViewStyle> = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ResourceTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  marginLeft: 4,
  color: ColorMap.light,
};

const propDetail = (title: string, valueDict: Record<string, any>, key: number): JSX.Element => {
  if (!valueDict.type || valueDict.type === 'string') {
    return (
      <View style={PropWrapperStyle} key={key}>
        <View style={PropDetailStyle}>
          <Text style={PropTitleStyle}>{title}</Text>
          <Text style={PropValueStyle}>{valueDict.value}</Text>
        </View>
      </View>
    );
  }

  return <View key={key} />;
};

const NftDetail = ({
  route: {
    params: { collectionId, nftId },
  },
}: NFTDetailProps) => {
  const navigation = useNavigation<RootNavigationProps>();

  const toast = useToast();

  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const collection = useMemo(() => {
    return nftCollections.find(i => collectionId === `${i.collectionName}-${i.collectionId}`) || {};
  }, [collectionId, nftCollections]);

  const data = useMemo(() => {
    return nftItems.find(item => nftId === `${item.collectionId}-${item.id}`) || ({} as NftItem);
  }, [nftId, nftItems]);

  const { image: collectionImage, collectionId: collectionRawId, collectionName, chain } = collection as NftCollection;

  const goHome = useGoHome({ screen: 'NFTs', params: { screen: 'CollectionList' } });
  useHandleGoHome({ goHome: goHome, networkKey: data.chain || chain || '', networkFocusRedirect: false });

  const originChainInfo = useFetchChainInfo(data.chain as string);
  const ownerUrl = useScanExplorerAddressUrl(originChainInfo?.slug || '', data.owner || '');

  const ownerAccount = useMemo(() => {
    if (data.owner) {
      return findAccountByAddress(accounts, data.owner);
    }

    return undefined;
  }, [accounts, data.owner]);

  const canSend = useMemo((): boolean => {
    if (ownerAccount) {
      const signMode = getAccountSignMode(ownerAccount);
      return accountCanSign(signMode);
    } else {
      return false;
    }
  }, [ownerAccount]);

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

  const handleClickTransfer = useCallback(() => {
    if (!originChainInfo || !canSend || !data.chain) {
      show(i18n.common.anErrorHasOccurred, 'danger');

      return;
    }

    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'SendNFT',
        params: {
          itemId: data.id,
          chain: data.chain,
          collectionId: collectionRawId,
          owner: reformatAddress(
            data.owner || currentAccount?.address || '',
            _getChainSubstrateAddressPrefix(originChainInfo),
            false,
          ),
        },
      },
    });
  }, [canSend, data, originChainInfo, navigation, collectionRawId, currentAccount?.address, show]);

  const handleClickInfoIcon = useCallback((url?: string) => {
    if (!url) {
      return noop;
    }
    return () => {
      Linking.openURL(url);
    };
  }, []);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      titleTextAlign={'left'}
      isShowMainHeader={true}
      title={data.name || i18n.title.nftDetail}
      style={ContainerHeaderStyle}
      onPressBack={() => navigation.goBack()}>
      <>
        <ScrollView style={ContainerDetailStyle}>
          <View style={ImageContainerStyle}>
            <ImagePreview
              style={ImageStyle}
              mainUrl={data.image}
              backupUrl={collectionImage}
              borderRadius={14.32}
              borderPlace={'full'}
            />
          </View>
          {!!data.description && (
            <View>
              <Text style={AttTitleStyle}>{i18n.inputLabel.nftDetails}</Text>
              <Text style={AttValueStyle}>{data?.description}</Text>
            </View>
          )}
          <TouchableOpacity style={ResourceContainerStyle} activeOpacity={0.5} onPress={handleClickComingSoon}>
            <View style={ResourceIconContainerStyle}>
              <SlidersHorizontal size={20} color={ColorMap.primary} />
            </View>
            <Text style={ResourceTitleStyle}>{i18n.nftScreen.nftDetail.resourcesOrInventory}</Text>
          </TouchableOpacity>
          <TextField
            text={collectionName || ''}
            label={i18n.inputLabel.nftCollectionName}
            showRightIcon={!!data.externalUrl}
            onPressRightIcon={handleClickInfoIcon(data.externalUrl)}
          />
          {!!data.owner && (
            <AddressField
              name={ownerAccount?.name}
              address={data.owner}
              networkPrefix={_getChainSubstrateAddressPrefix(originChainInfo)}
              label={i18n.inputLabel.ownedBy}
              onPressRightIcon={handleClickInfoIcon(ownerUrl)}
            />
          )}
          {/*<AddressField address={currentAccount?.address || ''} label={i18n.nftScreen.nftDetail.createdBy} />*/}
          <NetworkField networkKey={data.chain || chain || ''} label={i18n.inputLabel.network} />
          {!!data.rarity && (
            <View>
              <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.rarity}</Text>
              <Text style={AttValueStyle}>{data?.rarity}</Text>
            </View>
          )}
          {!!data.properties && (
            <View>
              <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.properties}</Text>
              <View style={PropContainerStyle}>
                {Object.keys(data?.properties).map((key, index) => {
                  // @ts-ignore
                  return propDetail(key, data?.properties[key], index);
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {canSend && (
          <View style={{ ...ContainerHorizontalPadding, marginTop: 16, marginBottom: 16 }}>
            <Button onPress={handleClickTransfer}>{i18n.buttonTitles.send}</Button>
          </View>
        )}
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(NftDetail);
