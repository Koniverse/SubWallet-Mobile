import { useNavigation } from '@react-navigation/native';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import { TextField } from 'components/Field/Text';
import ImagePreview from 'components/ImagePreview';
import { SubmitButton } from 'components/SubmitButton';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import { SlidersHorizontal } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { Platform, ScrollView, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { NftScreenState } from 'reducers/nftScreen';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import i18n from 'utils/i18n/i18n';
import reformatAddress from 'utils/index';

interface Props {
  nftState: NftScreenState;
}

const ContainerDetailStyle: StyleProp<any> = {
  marginTop: 20,
  paddingHorizontal: 16,
};

if (Platform.OS === 'ios') {
  ContainerDetailStyle.marginBottom = 16;
}

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

const SendButtonStyle: StyleProp<ViewStyle> = {
  marginTop: 16,
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

  return <View />;
};

const NftDetail = ({ nftState }: Props) => {
  const data = nftState.nft as NftItem;
  const { image: collectionImage, collectionId, collectionName, chain } = nftState.collection as NftCollection;
  const { show, hideAll } = useToast();
  const navigation = useNavigation<RootNavigationProps>();

  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const networkJson = useGetNetworkJson(data.chain as string);
  const isAccountAll = useIsAccountAll();

  const canSend = useMemo((): boolean => {
    if (!currentAccount) {
      return false;
    } else {
      if (isAccountAll) {
        const accountList = accounts.map(acc => acc.address);
        return !!accountList.find(address => reformatAddress(data.owner || '', 42, false) === address);
      } else {
        return reformatAddress(data.owner || '', 42, false) === currentAccount.address;
      }
    }
  }, [currentAccount, isAccountAll, accounts, data.owner]);

  const handleClickComingSoon = useCallback(() => {
    hideAll();
    show(i18n.common.comingSoon);
  }, [hideAll, show]);

  const handleClickTransfer = useCallback(() => {
    if (!canSend || !data.chain) {
      hideAll();
      show(i18n.common.anErrorHasOccurred);

      return;
    }

    if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(data.chain) <= -1 && !networkJson.isEthereum) {
      hideAll();
      show(`Transferring is not supported for ${data.chain.toUpperCase()} network`);

      return;
    }

    navigation.navigate('TransferNft', {
      nftItem: data,
      collectionImage: collectionImage,
      collectionId: collectionId,
      senderAddress: reformatAddress(data.owner || currentAccount?.address || '', networkJson.ss58Format, false),
    });
  }, [
    canSend,
    data,
    networkJson.isEthereum,
    networkJson.ss58Format,
    navigation,
    collectionImage,
    collectionId,
    currentAccount?.address,
    hideAll,
    show,
  ]);

  return (
    <ScrollView style={ContainerDetailStyle}>
      <View style={ImageContainerStyle}>
        <ImagePreview
          style={ImageStyle}
          mainUrl={data.image}
          backupUrl={collectionImage}
          borderRadius={5}
          borderPlace={'full'}
        />
      </View>
      {canSend && <SubmitButton style={SendButtonStyle} onPress={handleClickTransfer} title={i18n.common.send} />}
      {data.description && (
        <View>
          <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.description}</Text>
          <Text style={AttValueStyle}>{data?.description}</Text>
        </View>
      )}
      <TouchableOpacity style={ResourceContainerStyle} activeOpacity={0.5} onPress={handleClickComingSoon}>
        <View style={ResourceIconContainerStyle}>
          <SlidersHorizontal size={20} color={ColorMap.primary} />
        </View>
        <Text style={ResourceTitleStyle}>Resources or Inventory</Text>
      </TouchableOpacity>
      <TextField text={collectionName || ''} label={i18n.nftScreen.nftDetail.collectionName} />
      {data.owner && (
        <AddressField
          address={data.owner}
          networkPrefix={networkJson.ss58Format}
          label={i18n.nftScreen.nftDetail.ownedBy}
        />
      )}
      {/*<AddressField address={currentAccount?.address || ''} label={i18n.nftScreen.nftDetail.createdBy} />*/}
      <NetworkField networkKey={data.chain || chain || ''} label={i18n.common.network} />
      {data.rarity && (
        <View>
          <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.rarity}</Text>
          <Text style={AttValueStyle}>{data?.rarity}</Text>
        </View>
      )}
      {data.properties && (
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
  );
};

export default React.memo(NftDetail);
