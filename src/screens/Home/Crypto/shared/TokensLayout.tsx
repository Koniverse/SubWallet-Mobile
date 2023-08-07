import React, { useEffect, useMemo, useState } from 'react';
import {
  ListRenderItem,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
  SectionListData,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { ColorMap } from 'styles/color';
import { Coins } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { ActivityIndicator, AnimatedFlatlist } from 'components/design-system-ui';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  AnimatedStyleProp,
  AnimateStyle,
} from 'react-native-reanimated';
import { TokenBalanceItemType } from 'types/balance';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import LinearGradient from 'react-native-linear-gradient';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { tokenItem, tokenItemMarginBottom } from 'constants/itemHeight';

interface Props {
  layoutHeader: React.ReactElement;
  stickyBackground?: [string, string];
  listActions?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  layoutFooter?: React.ReactElement;
  items: TokenBalanceItemType[];
  renderItem: ListRenderItem<TokenBalanceItemType>;
  isRefreshing?: boolean;
  refresh?: () => void;
  loading?: boolean;
}

const flatListContentContainerStyle: StyleProp<any> = {
  flexGrow: 1,
  justifyContent: 'center',
  position: 'relative',
};
type GetItemLayoutType =
  | readonly TokenBalanceItemType[]
  | SectionListData<TokenBalanceItemType, SectionListData<TokenBalanceItemType>>[]
  | null
  | undefined;

const PAGE_SIZE = 15;
const ITEM_HEIGHT = tokenItem;
const ITEM_SEPARATOR = tokenItemMarginBottom;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_SEPARATOR;
export const TokensLayout = ({
  layoutHeader,
  stickyBackground,
  layoutFooter,
  listActions,
  items: tokenBalanceItems,
  loading,
  renderItem,
  isRefreshing,
  refresh,
  style,
}: Props) => {
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccount?.address);
  const theme = useSubWalletTheme().swThemes;
  const yOffset = useSharedValue(0);
  const isAnimating = useSharedValue(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    setPageNumber(1);
  }, [currentAccountAddress]);

  const tokenListData = useMemo(() => {
    return tokenBalanceItems.slice(0, pageNumber * PAGE_SIZE);
  }, [tokenBalanceItems, pageNumber]);

  const headerStyles = useAnimatedStyle((): AnimatedStyleProp<ViewStyle> => {
    const translateY = interpolate(yOffset.value, [0, 200], [0, -10], Extrapolate.CLAMP);
    const opacity = interpolate(yOffset.value, [0, 200], [1, 0], Extrapolate.CLAMP);
    return {
      opacity,
      // @ts-ignore
      transform: [{ translateY }],
    };
  }, []);
  const stickyHeaderStyles = useAnimatedStyle((): AnimatedStyleProp<ViewStyle> => {
    const opacity = interpolate(yOffset.value, [210, 218], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(yOffset.value, [210, 218], [0, -40], Extrapolate.CLAMP);
    return {
      opacity,
      // @ts-ignore
      transform: [{ translateY }],
    };
  }, []);
  const stickyHeaderInvisibleStyles = useAnimatedStyle(() => {
    const opacity = interpolate(yOffset.value, [218, 220], [0, 1], Extrapolate.CLAMP);
    const zIndex = interpolate(yOffset.value, [218, 220], [0, 100], Extrapolate.CLAMP);
    return {
      opacity,
      zIndex,
    };
  }, []);

  const onScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: e => {
        const y = e.contentOffset.y;
        if (yOffset.value < y && y < 40 && isAnimating.value === 0) {
          isAnimating.value = 1;
          yOffset.value = withTiming(40, undefined, () => (isAnimating.value = 0));
        } else if (yOffset.value > y && y < 40 && isAnimating.value === 0) {
          isAnimating.value = 1;
          yOffset.value = withTiming(0, undefined, () => (isAnimating.value = 0));
        } else if (y >= 40 && isAnimating.value === 0) {
          yOffset.value = y;
        }
      },
    },
    [],
  );

  const refreshControlNode = useMemo(() => {
    if (!refresh) {
      return undefined;
    }

    return <RefreshControl tintColor={ColorMap.light} refreshing={!!isRefreshing} onRefresh={refresh} />;
  }, [isRefreshing, refresh]);

  const renderHeaderComponent = () => {
    return (
      <Animated.View style={headerStyles}>
        <>{layoutHeader}</>
      </Animated.View>
    );
  };

  const customRenderItem = (data: ListRenderItemInfo<TokenBalanceItemType>) => {
    if (listActions && data.item?.slug === null) {
      return <Animated.View style={stickyHeaderStyles}>{listActions}</Animated.View>;
    }

    return renderItem(data);
  };

  if (!tokenBalanceItems.length) {
    return (
      <View style={[style, { flex: 1, marginTop: 0 }]}>
        <View style={{ paddingHorizontal: 16 }}>
          {layoutHeader}
          {listActions}
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={40} indicatorColor={theme.colorWhite} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={flatListContentContainerStyle}
            refreshControl={refreshControlNode}>
            <>
              <EmptyList
                icon={Coins}
                title={i18n.emptyScreen.tokenEmptyTitle}
                message={i18n.emptyScreen.tokenEmptyMessage}
              />
              {layoutFooter}
            </>
          </ScrollView>
        )}
      </View>
    );
  }

  const onEndReached = () => {
    const maxPage = Math.ceil(tokenBalanceItems.length / PAGE_SIZE);
    if (pageNumber > maxPage) {
      return;
    }
    setPageNumber(prev => prev + 1);
  };
  const handledTokenListData = listActions ? [{ slug: null }, ...tokenListData] : tokenListData;

  // TODO: Move these codes to style folder in next refactor
  const flex1 = { flex: 1 };
  const listContainerStyle = { paddingHorizontal: 16 };
  const stickyActionHeaderStyle = [
    {
      paddingHorizontal: 16,
      backgroundColor: theme.colorBgDefault,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
    },
    stickyHeaderInvisibleStyles,
  ] as StyleProp<AnimateStyle<StyleProp<ViewStyle>>>;
  const stickyHeaderFakingGradientStyle = {
    flex: 1,
    marginTop: -(STATUS_BAR_HEIGHT * 2 + 40),
    height: 600,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  } as StyleProp<ViewStyle>;

  const getItemLayout = (data: GetItemLayoutType, index: number) => ({
    index,
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
  });

  return (
    <View style={[flex1, style]}>
      {!!listActions && (
        <Animated.View style={stickyActionHeaderStyle}>
          {!!stickyBackground && (
            <LinearGradient locations={[0, 0.5]} colors={stickyBackground} style={stickyHeaderFakingGradientStyle} />
          )}
          {listActions}
        </Animated.View>
      )}

      <AnimatedFlatlist
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        ListHeaderComponent={renderHeaderComponent}
        contentContainerStyle={listContainerStyle}
        data={handledTokenListData}
        renderItem={customRenderItem}
        ListFooterComponent={layoutFooter}
        maxToRenderPerBatch={12}
        initialNumToRender={12}
        removeClippedSubviews
        windowSize={12}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.7}
        refreshControl={refreshControlNode}
      />
    </View>
  );
};
