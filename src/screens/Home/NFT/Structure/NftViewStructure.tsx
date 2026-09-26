import { useNavigation } from '@react-navigation/native';
import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Icon, Typography } from 'components/design-system-ui';
import ImagePreview from 'components/ImagePreview';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CaretRight, CheckCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { NFTNavigationProps, NFTViewStructureProps } from 'screens/Home/NFT/NFTStackScreen';
import { RootState } from 'stores/index';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { countNftNodes, findNftDeep } from 'utils/nft';

type Styles = ReturnType<typeof createStyle>;

interface TreeNodeProps {
  item: NftItem;
  parent?: NftItem;
  selectedId: string;
  depth?: number;
  styles: Styles;
  onPress: (item: NftItem) => void;
}

const TreeNode = ({ depth = 0, item, onPress, parent, selectedId, styles }: TreeNodeProps) => {
  const theme = useSubWalletTheme().swThemes;
  const [isExpanded, setIsExpanded] = useState(true);

  const childrenCount = item.nestingTokens?.length || 0;
  const hasChildren = childrenCount > 0;
  const isSelected = item.id === selectedId;

  const toggleExpand = useCallback(() => setIsExpanded(current => !current), []);
  const handleItemPress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <View>
      <View style={styles.nodeRow}>
        {depth > 0 && (
          <TouchableOpacity
            style={styles.expandIconWrapper}
            activeOpacity={hasChildren ? 0.5 : 1}
            onPress={hasChildren ? toggleExpand : undefined}
          >
            {hasChildren ? (
              <Icon
                phosphorIcon={isExpanded ? CaretDown : CaretRight}
                customSize={16}
                iconColor={theme.colorTextLight3}
              />
            ) : (
              <View style={styles.dotPlaceholder} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nodeCard, isSelected && styles.nodeCardSelected]}
          activeOpacity={0.8}
          onPress={handleItemPress}
        >
          <ImagePreview style={styles.nodeThumb} mainUrl={item.image} borderRadius={8} borderPlace={'full'} />
          <View style={styles.nodeInfo}>
            <Typography.Text ellipsis style={styles.nodeTitle}>
              {item.name || item.id}
            </Typography.Text>
            <Typography.Text ellipsis style={styles.nodeSubtitle}>
              {depth === 0
                ? i18n.nftScreen.nestedNft.parent
                : i18n.nftScreen.nestedNft.nestedInParent.replace('{{parentId}}', parent?.name || parent?.id || '')}
            </Typography.Text>
          </View>

          {isSelected ? (
            <Icon phosphorIcon={CheckCircle} size={'sm'} weight={'fill'} iconColor={theme.colorSuccess} />
          ) : (
            hasChildren && (
              <View style={styles.badgeCount}>
                <Typography.Text style={styles.badgeCountText}>
                  {childrenCount.toString().padStart(2, '0')}
                </Typography.Text>
              </View>
            )
          )}
        </TouchableOpacity>
      </View>

      {hasChildren && isExpanded && (
        <View style={styles.childrenContainer}>
          <View style={styles.verticalLineGuide} />
          {item.nestingTokens?.map(child => (
            <TreeNode
              depth={depth + 1}
              item={child}
              key={`${child.collectionId}-${child.id}`}
              onPress={onPress}
              parent={item}
              selectedId={selectedId}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const NftViewStructure = ({
  route: {
    params: { chain, collectionId, rootTokenId, selectedNftId },
  },
}: NFTViewStructureProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const navigation = useNavigation<NFTNavigationProps>();
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);

  const rootNft = useMemo(() => {
    return findNftDeep(nftItems, rootTokenId, chain, collectionId);
  }, [chain, collectionId, nftItems, rootTokenId]);

  const totalCount = useMemo(() => (rootNft ? countNftNodes(rootNft) : 0), [rootNft]);

  const onPressNft = useCallback(
    (item: NftItem) => {
      navigation.push('NftBundleDetail', { chain, collectionId, nftId: item.id, rootTokenId });
    },
    [chain, collectionId, navigation, rootTokenId],
  );

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      isShowMainHeader={true}
      isHideBottomSafeArea={true}
      title={i18n.nftScreen.nestedNft.nftStructureWithCount.replace('{{count}}', String(totalCount))}
      onPressBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {rootNft ? (
          <TreeNode depth={0} item={rootNft} onPress={onPressNft} selectedId={selectedNftId} styles={styles} />
        ) : (
          <Typography.Text style={styles.emptyState}>{i18n.nftScreen.nestedNft.noStructureDataFound}</Typography.Text>
        )}
      </ScrollView>
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.padding,
    },
    nodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.marginXS + 4,
    },
    expandIconWrapper: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.marginXS,
      zIndex: 5,
    },
    dotPlaceholder: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colorTextLight4,
    },
    nodeCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      paddingVertical: theme.paddingXS,
      paddingHorizontal: theme.paddingXS + 2,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    nodeCardSelected: {
      borderColor: theme.colorSuccess,
    },
    nodeThumb: {
      width: 40,
      height: 40,
    },
    nodeInfo: {
      flex: 1,
    },
    nodeTitle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextLight1,
      ...FontSemiBold,
    },
    nodeSubtitle: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight4,
      ...FontMedium,
    },
    badgeCount: {
      paddingHorizontal: theme.paddingXS,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: theme.colorBgInput,
    },
    badgeCountText: {
      fontSize: theme.fontSizeXS,
      lineHeight: theme.fontSizeXS * theme.lineHeightSM,
      color: theme.colorTextLight3,
      ...FontSemiBold,
    },
    childrenContainer: {
      paddingLeft: theme.paddingLG,
      position: 'relative',
    },
    verticalLineGuide: {
      position: 'absolute',
      left: 7,
      top: 0,
      bottom: 2,
      width: 1,
      backgroundColor: theme.colorTextLight4,
      opacity: 0.3,
    },
    emptyState: {
      textAlign: 'center',
      marginTop: theme.marginXL,
      color: theme.colorTextLight4,
      ...FontMedium,
    },
  });
}

export default React.memo(NftViewStructure);
