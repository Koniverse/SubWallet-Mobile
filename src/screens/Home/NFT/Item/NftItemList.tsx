import { NftCollection, NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useFetchNftItem from 'hooks/screen/Home/Nft/useFetchNftItem';
import React, { useCallback } from 'react';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import { NftScreenActionParams, NftScreenActionType, NftScreenState } from 'reducers/nftScreen';
import NftItem from './NftItem';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { Aperture } from 'phosphor-react-native';

interface Props {
  dispatchNftState: React.Dispatch<NftScreenActionParams>;
  nftState: NftScreenState;
}

const NftItemListStyle: StyleProp<any> = {
  flex: 1,
};

const renderEmpty = () => {
  return <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;
};

const filteredNftItem = (items: _NftItem[], searchString: string) => {
  return items.filter(item => {
    const name = item.name ? item.name : `#${item.id}`;
    return name.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftItemList = ({ dispatchNftState, nftState }: Props) => {
  const collection = nftState.collection as NftCollection;
  const nftItems = useFetchNftItem(collection).nftItems;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<_NftItem>) => {
      const key = `${item.collectionId}-${item.id}`;
      const onPress = () => {
        dispatchNftState({ type: NftScreenActionType.OPEN_NFT, payload: { nft: item } });
      };

      return <NftItem key={key} nftItem={item} onPress={onPress} />;
    },
    [dispatchNftState],
  );

  const handleBack = () => {
    dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
  };

  return (
    <View style={NftItemListStyle}>
      <FlatListScreen
        withSubHeader={false}
        autoFocus={false}
        showLeftBtn={false}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredNftItem}
        items={nftItems}
        onPressBack={handleBack}
        numberColumns={2}
        searchMarginBottom={16}
      />
    </View>
  );
};

export default NftItemList;
