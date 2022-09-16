import { useNavigation } from '@react-navigation/native';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import ImagePreview from 'components/ImagePreview';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import React, { useCallback } from 'react';
import { StyleProp, View, Text, TouchableOpacity } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import i18n from 'utils/i18n/i18n';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import { NftScreenState } from '../../../../types';

interface Props {
  nftState: NftScreenState;
}

const ContainerDetailStyle: StyleProp<any> = {
  marginTop: 20,
  paddingHorizontal: 20,
};

const PropContainerStyle: StyleProp<any> = {
  marginTop: 5,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
};

const PropDetailStyle: StyleProp<any> = {
  paddingVertical: 5,
  paddingHorizontal: 10,
  backgroundColor: ColorMap.popupBackground,
  boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.15)',
  borderRadius: 5,
};

const PropTitleStyle: StyleProp<any> = {
  textTransform: 'uppercase',
  color: ColorMap.iconNeutralColor,
  fontSize: 13,
};

const PropValueStyle: StyleProp<any> = {
  fontSize: 14,
};

const AttTitleStyle: StyleProp<any> = {
  fontSize: 16,
  fontWeight: '500',
  marginTop: 20,
};

const AttValueStyle: StyleProp<any> = {
  fontSize: 15,
  color: ColorMap.iconNeutralColor,
};

const ImageContainerStyle: StyleProp<any> = {
  display: 'flex',
  alignItems: 'center',
};

const ImageStyle: StyleProp<any> = {
  width: 300,
  height: 300,
  borderRadius: 10,
};

const SendContainerStyle: StyleProp<any> = {
  marginTop: 20,
};

const SendButtonStyle: StyleProp<any> = {
  marginTop: 5,
  backgroundColor: ColorMap.secondary,
  borderRadius: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 10,
  color: ColorMap.light,
};

const propDetail = (title: string, valueDict: Record<string, any>, key: number): JSX.Element => {
  if (valueDict.type && valueDict.type === 'string') {
    return (
      <View style={PropDetailStyle} key={key}>
        <Text style={PropTitleStyle}>{title}</Text>
        <Text style={PropValueStyle}>{valueDict.value}</Text>
      </View>
    );
  }

  if (!valueDict.type) {
    return (
      <View style={PropDetailStyle} key={key}>
        <Text style={PropTitleStyle}>{title}</Text>
        <Text style={PropValueStyle}>{valueDict.value}</Text>
      </View>
    );
  }

  return <View />;
};

const NftDetail = ({ nftState }: Props) => {
  const data = nftState.nft as NftItem;
  const { image: collectionImage, collectionId } = nftState.collection as NftCollection;
  const { show } = useToast();
  const navigation = useNavigation<RootNavigationProps>();

  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);

  const networkJson = useGetNetworkJson(data.chain as string);
  const isAccountAll = useIsAccountAll();

  const handleClickTransfer = useCallback(() => {
    if (!currentAccount || isAccountAll || !data.chain) {
      show(i18n.common.anErrorHasOccurred);

      return;
    }

    if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(data.chain) <= -1 && !networkJson.isEthereum) {
      show(`Transferring is not supported for ${data.chain.toUpperCase()} network`);

      return;
    }

    navigation.navigate('SendNft', { nftItem: data, collectionImage: collectionImage, collectionId: collectionId });
  }, [currentAccount, isAccountAll, data, networkJson.isEthereum, collectionImage, collectionId, navigation, show]);

  return (
    <View style={ContainerDetailStyle}>
      <View style={ImageContainerStyle}>
        <ImagePreview style={ImageStyle} mainUrl={data.image} backupUrl={collectionImage} />
      </View>
      {!isAccountAll && (
        <View style={SendContainerStyle}>
          <TouchableOpacity style={SendButtonStyle} activeOpacity={0.8} onPress={handleClickTransfer}>
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      )}
      {data.description && (
        <View>
          <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.description}</Text>
          <Text style={AttValueStyle}>{data?.description}</Text>
        </View>
      )}
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
    </View>
  );
};

export default React.memo(NftDetail);
