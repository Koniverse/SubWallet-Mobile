import { YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { deviceHeight } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretDown, CheckCircle, Coins, Eye, PlusCircle, ThumbsUp } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { PhosphorIcon } from 'utils/campaign';
import createStyles from './style';

interface Props {
  slug: string;
  setVisible: (value: boolean) => void;
  modalVisible: boolean;
  onStakeMore?: (value: string) => void;
}

interface BoxProps {
  title: string;
  description: React.ReactNode;
  iconColor: string;
  icon: PhosphorIcon;
}

const EarningPoolDetailModal: React.FC<Props> = (props: Props) => {
  const { slug, setVisible, modalVisible, onStakeMore } = props;

  const theme = useSubWalletTheme().swThemes;
  const inset = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);

  const maxScrollHeight = useMemo(() => {
    const haveButton = !!onStakeMore;
    return new BigN(deviceHeight) // screen height
      .minus(inset.top) // safe area top
      .minus(theme.sizeXXL) // modal padding top
      .minus(theme.sizeXL) // modal padding bottom
      .minus(44) // faq
      .minus(60) // header
      .minus(haveButton ? 52 : 0) // button
      .minus(theme.size * (haveButton ? 3 : 2)) // gap
      .toNumber();
  }, [inset.top, onStakeMore, theme.size, theme.sizeXL, theme.sizeXXL]);
  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);

  const boxesProps: BoxProps[] = useMemo(() => {
    const result: BoxProps[] = [];

    if ([YieldPoolType.NOMINATION_POOL, YieldPoolType.NATIVE_STAKING].includes(poolInfo?.type)) {
      result.push({
        title: 'Unstake and withdraw',
        description: (
          <Typography.Text>
            Once staked, your funds will be locked. Unstake your funds anytime and withdraw after &nbsp;
            <Typography.Text style={styles.lightText}>a 7-day period</Typography.Text>
            &nbsp;. Keep in mind that these actions are&nbsp;
            <Typography.Text style={styles.lightText}>not automated</Typography.Text>
            &nbsp;and will incur network fees.
          </Typography.Text>
        ),
        icon: Coins,
        iconColor: theme['yellow-7'],
      });
    }

    result.push({
      title: 'Keep your free balance',
      description: (
        <Typography.Text>
          Ensure that your free balance (transferrable balance) includes&nbsp;
          <Typography.Text style={styles.lightText}>a minimum of 12 VARA</Typography.Text>
          &nbsp;to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals.
        </Typography.Text>
      ),
      icon: CheckCircle,
      iconColor: theme['cyan-6'],
    });

    result.push({
      title: 'Track your stake',
      description: 'Keep an eye on your stake periodically, as rewards and staking status can fluctuate over time.',
      icon: Eye,
      iconColor: theme.blue,
    });

    if (poolInfo?.type === YieldPoolType.NOMINATION_POOL) {
      result.push({
        title: 'Select active pool',
        description: 'It is recommended that you select an active pool. Check out the list of active pools in our FAQ.',
        icon: ThumbsUp,
        iconColor: theme['lime-7'],
      });
    }

    return result;
  }, [poolInfo?.type, styles.lightText, theme]);

  const [showScrollEnd, setShowScrollEnd] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(true);

  const isCloseToBottom = useCallback(({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }, []);

  const calculateShowScroll = useCallback(
    (width: number, height: number) => {
      setShowScrollEnd(height > maxScrollHeight);
    },
    [maxScrollHeight],
  );

  const onScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(nativeEvent)) {
        setIsScrollEnd(false);
      } else {
        setIsScrollEnd(true);
      }
    },
    [isCloseToBottom],
  );

  const onPressFaq = useCallback(() => {
    // TODO
    Linking.openURL(
      'https://subwallet.notion.site/subwallet/Coinbase-VARA-Quests-FAQs-855c4425812046449125e1f7805e6a16',
    );
  }, []);

  const onPress = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onStakeMore?.(slug);
    }, 300);
  }, [onStakeMore, setVisible, slug]);

  const scrollBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd();
  }, []);

  useEffect(() => {
    if (!poolInfo) {
      setVisible(false);
    }
  }, [setVisible, poolInfo]);

  if (!poolInfo) {
    return null;
  }

  return (
    <SwModal isUseModalV2 modalVisible={modalVisible} setVisible={setVisible} isAllowSwipeDown={false}>
      <View style={styles.wrapper}>
        <Typography.Text style={styles.headerText}>
          Stake to earn up to 20% so easily with SubWallet Official
        </Typography.Text>
        <ScrollView
          ref={scrollRef}
          style={{ maxHeight: maxScrollHeight }}
          contentContainerStyle={styles.infoContainer}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          nestedScrollEnabled={true}
          scrollEventThrottle={400}
          onContentSizeChange={calculateShowScroll}
          onScroll={onScroll}>
          {boxesProps.map((_props, index) => {
            return (
              <AlertBoxBase
                key={index}
                title={_props.title}
                description={_props.description}
                iconColor={_props.iconColor}
                icon={_props.icon}
              />
            );
          })}
        </ScrollView>
        <View>
          <Typography.Text style={styles.faqText}>
            For more information and staking instructions, read&nbsp;
            <Text onPress={onPressFaq} style={styles.highlightText}>
              this FAQ.
            </Text>
          </Typography.Text>
          {showScrollEnd && (
            <Button
              size="xs"
              icon={<Icon phosphorIcon={CaretDown} />}
              style={styles.scrollButton}
              type="primary"
              shape="circle"
              disabled={!isScrollEnd}
              onPress={scrollBottom}
            />
          )}
        </View>
        {!!onStakeMore && (
          <Button icon={<Icon phosphorIcon={PlusCircle} weight="fill" />} size="sm" onPress={onPress}>
            Stake to earn
          </Button>
        )}
      </View>
    </SwModal>
  );
};

export default EarningPoolDetailModal;
