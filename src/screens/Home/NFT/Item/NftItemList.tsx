import { NftCollection, NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useFetchNftItem from 'hooks/useFetchNftItem';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import React, { useCallback } from 'react';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftCollectionImportText from 'screens/Home/NFT/Shared/NftCollectionImportText';
import NftItem from './NftItem';
import { NftScreenActionParams, NftScreenState } from '../../../../types';

interface Props {
  dispatchNftState: React.Dispatch<NftScreenActionParams>;
  nftState: NftScreenState;
}

const NftItemListStyle: StyleProp<any> = {
  height: '100%',
};

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
        dispatchNftState({ type: 'openNft', payload: { nft: item } });
      };

      return <NftItem key={key} nftItem={item} onPress={onPress} />;
    },
    [dispatchNftState],
  );

  const handleBack = () => {
    dispatchNftState({ type: 'openCollectionList', payload: {} });
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
        afterListItem={<NftCollectionImportText />}
        items={nftItems}
        onPressBack={handleBack}
      />
    </View>
  );
};

export default NftItemList;
