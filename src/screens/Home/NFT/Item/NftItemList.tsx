import { NftCollection, NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useFetchNftItem from 'hooks/useFetchNftItem';
import React, { useCallback } from 'react';
import { ListRenderItemInfo, Platform, StyleProp, View } from 'react-native';
import { NftScreenActionParams, NftScreenActionType, NftScreenState } from 'reducers/nftScreen';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftItem from './NftItem';

interface Props {
  dispatchNftState: React.Dispatch<NftScreenActionParams>;
  nftState: NftScreenState;
}

const NftItemListStyle: StyleProp<any> = {
  height: '100%',
};

if (Platform.OS === 'ios') {
  NftItemListStyle.paddingBottom = 50;
}

const renderEmpty = () => {
  return <EmptyList />;
};

const filteredNftItem = (items: _NftItem[], searchString: string) => {
  return items.filter(item => {
    return item.name && item.name.toLowerCase().includes(searchString.toLowerCase());
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
      />
    </View>
  );
};

export default NftItemList;
