import React, { useMemo } from 'react';
import {
  ListRenderItem,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
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
} from 'react-native-reanimated';
import { TokenBalanceItemType } from 'types/balance';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import LinearGradient from 'react-native-linear-gradient';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';

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
  const theme = useSubWalletTheme().swThemes;
  const yOffset = useSharedValue(0);
  const isAnimating = useSharedValue(0);

  const headerStyles = useAnimatedStyle(() => {
    const translateY = interpolate(yOffset.value, [0, 200], [0, -10], Extrapolate.CLAMP);
    const opacity = interpolate(yOffset.value, [0, 200], [1, 0], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  }, []);
  const stickyHeaderStyles = useAnimatedStyle(() => {
    const opacity = interpolate(yOffset.value, [210, 218], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(yOffset.value, [210, 218], [0, -40], Extrapolate.CLAMP);
    return {
      opacity,
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
              <EmptyList icon={Coins} title={'No tokens found'} message={'Add tokens to get started'} />
              {layoutFooter}
            </>
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      {!!listActions && (
        <Animated.View
          style={[
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
          ]}>
          {!!stickyBackground && (
            <LinearGradient
              locations={[0, 0.5]}
              colors={stickyBackground}
              style={{
                flex: 1,
                marginTop: -(STATUS_BAR_HEIGHT * 2 + 40),
                height: 600,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            />
          )}
          {listActions}
        </Animated.View>
      )}

      <AnimatedFlatlist
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        ListHeaderComponent={renderHeaderComponent}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={listActions ? [{ slug: null }, ...tokenBalanceItems] : tokenBalanceItems}
        renderItem={customRenderItem}
        ListFooterComponent={layoutFooter}
        refreshControl={refreshControlNode}
      />
    </View>
  );
};
