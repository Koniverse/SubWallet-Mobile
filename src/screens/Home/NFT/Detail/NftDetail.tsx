import { useNavigation } from '@react-navigation/native';
import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import ImagePreview from 'components/ImagePreview';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import useIsAccountAll from 'hooks/screen/useIsAllAccount';
import React, { useCallback } from 'react';
import { StyleProp, View, Text, TouchableOpacity, ViewStyle, ScrollView, TextStyle, Platform } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { ButtonStyle, FontMedium, FontSemiBold, sharedStyles, TextButtonStyle } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { SUPPORTED_TRANSFER_SUBSTRATE_CHAIN } from 'types/nft';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import { NftScreenState } from 'reducers/nftScreen';

interface Props {
  nftState: NftScreenState;
}

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
};

if (Platform.OS === 'ios') {
  PropContainerStyle.paddingBottom = 30;
}

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

const SendContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 20,
};

const SendButtonStyle: StyleProp<ViewStyle> = {
  ...ButtonStyle,
  backgroundColor: ColorMap.secondary,
};

const SendButtonTextStyle: StyleProp<TextStyle> = {
  ...TextButtonStyle,
  color: ColorMap.light,
};

const propDetail = (title: string, valueDict: Record<string, any>, key: number): JSX.Element => {
  if (valueDict.type && valueDict.type === 'string') {
    return (
      <View style={PropWrapperStyle} key={key}>
        <View style={PropDetailStyle}>
          <Text style={PropTitleStyle}>{title}</Text>
          <Text style={PropValueStyle}>{valueDict.value}</Text>
        </View>
      </View>
    );
  }

  if (!valueDict.type) {
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

    navigation.navigate('TransferNft', { nftItem: data, collectionImage: collectionImage, collectionId: collectionId });
  }, [currentAccount, isAccountAll, data, networkJson.isEthereum, collectionImage, collectionId, navigation, show]);

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
      {!isAccountAll && (
        <View style={SendContainerStyle}>
          <TouchableOpacity style={SendButtonStyle} onPress={handleClickTransfer}>
            <Text style={SendButtonTextStyle}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
      {data.description && (
        <View>
          <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.description}</Text>
          <Text style={AttValueStyle}>{data?.description}</Text>
        </View>
      )}
      <View>
        <Text style={AttTitleStyle}>{i18n.nftScreen.nftDetail.rarity}</Text>
        <Text style={AttValueStyle}>{data?.rarity}</Text>
      </View>
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
