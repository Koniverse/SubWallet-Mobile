import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { calculateReward } from '@subwallet/extension-base/services/earning-service/utils';
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
import { balanceFormatter, formatNumber } from 'utils/number';
import createStyles from './style';
import { EARNING_DATA_RAW } from '../../../../../EarningDataRaw';

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
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

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
  const title = useMemo(() => {
    if (!poolInfo) {
      return '';
    }

    const {
      type,
      metadata: { inputAsset },
    } = poolInfo;
    const totalApy = poolInfo.statistic?.totalApy;
    const totalApr = poolInfo.statistic?.totalApr;
    const minJoinPool = poolInfo.statistic?.minJoinPool || '0';

    const getOrigin = () => {
      switch (type) {
        case YieldPoolType.NOMINATION_POOL:
        case YieldPoolType.NATIVE_STAKING:
        case YieldPoolType.LIQUID_STAKING:
          return 'Stake to earn from {{minActiveStake}} up to {{apy}} easily with SubWallet';
        case YieldPoolType.LENDING:
          return 'Supply to earn from {{minActiveStake}} up to {{apy}} easily with SubWallet';
      }
    };

    const getApy = () => {
      if (totalApy) {
        return totalApy;
      }

      if (totalApr) {
        const rs = calculateReward(totalApr);

        return rs.apy;
      }

      return undefined;
    };

    let result = getOrigin();
    const apy = getApy();
    const asset = assetRegistry[inputAsset];

    if (asset) {
      const string = formatNumber(minJoinPool, asset.decimals || 0, balanceFormatter);
      result = result.replace('{{minActiveStake}}', `${string} ${asset.symbol}`);
    } else {
      result = result.replace('from ', '');
    }

    if (apy) {
      const string = formatNumber(apy, 0, balanceFormatter);
      result = result.replace('{{apy}}', `${string}%`);
    } else {
      result = result.replace('up to {{apy}} ', '');
    }

    return result;
  }, [assetRegistry, poolInfo]);

  const data: BoxProps[] = useMemo(() => {
    if (!poolInfo) {
      return [];
    }

    switch (poolInfo.type) {
      case YieldPoolType.NOMINATION_POOL: {
        const _label = getValidatorLabel(poolInfo.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo.statistic?.maxCandidatePerFarmer || 0;

        const unstakingPeriod = poolInfo.statistic?.unstakingPeriod || 0;
        const isDay = unstakingPeriod > 24;
        const time = isDay ? Math.floor(unstakingPeriod / 24) : unstakingPeriod;
        const unit = isDay ? 'day' : 'hour';
        const periodNumb = [time, unit].join('-');

        return EARNING_DATA_RAW[YieldPoolType.NOMINATION_POOL].map(item => {
          const _item = item;
          if (_item.description.includes('{validatorNumber}')) {
            _item.title = _item.title.replace('{validatorNumber}', maxCandidatePerFarmer.toString());
          }

          if (_item.description.includes('{validatorType}')) {
            _item.title = _item.title.replace('{validatorType}', label);
          }

          if (_item.description.includes('{periodNumb}')) {
            _item.description = _item.description.replace('{periodNumb}', periodNumb);
          }

          if (_item.description.includes('{paidOutNumb}')) {
            _item.description = _item.description.replace('{periodNumb}', '12');
          }

          if (_item.description.includes('{existentialDeposit}')) {
            _item.description = _item.description.replace('{existentialDeposit}', '12');
          }

          if (_item.description.includes('{symbol}')) {
            _item.description = _item.description.replace('{symbol}', 'VARA');
          }

          return _item;
        });
      }
      case YieldPoolType.NATIVE_STAKING: {
        const _label = getValidatorLabel(poolInfo.chain);
        const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
        const maxCandidatePerFarmer = poolInfo.statistic?.maxCandidatePerFarmer || 0;

        const unstakingPeriod = poolInfo.statistic?.unstakingPeriod || 0;
        const isDay = unstakingPeriod > 24;
        const time = isDay ? Math.floor(unstakingPeriod / 24) : unstakingPeriod;
        const unit = isDay ? 'day' : 'hour';
        const periodNumb = [time, unit].join('-');

        return EARNING_DATA_RAW[YieldPoolType.NATIVE_STAKING].map(item => {
          const _item = item;
          if (_item.title.includes('{validatorNumber}')) {
            _item.title = _item.title.replace('{validatorNumber}', maxCandidatePerFarmer.toString());
          }

          if (_item.title.includes('{validatorType}')) {
            _item.title = _item.title.replace('{validatorType}', label);
          }

          if (_item.description.includes('{validatorNumber}')) {
            _item.description = _item.description.replace('{validatorNumber}', maxCandidatePerFarmer.toString());
          }

          if (_item.description.includes('{validatorType}')) {
            _item.description = _item.description.replace('{validatorType}', label);
          }

          if (_item.description.includes('{periodNumb}')) {
            _item.description = _item.description.replace('{periodNumb}', periodNumb);
          }

          if (_item.description.includes('{existentialDeposit}')) {
            _item.description = _item.description.replace('{existentialDeposit}', '12');
          }

          if (_item.description.includes('{symbol}')) {
            _item.description = _item.description.replace('{symbol}', 'VARA');
          }

          return _item;
        });
      }
      case YieldPoolType.LIQUID_STAKING: {
        const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];

        if (derivative && inputAsset) {
          return EARNING_DATA_RAW[YieldPoolType.LIQUID_STAKING].map(item => {
            const _item = item;
            if (_item.title.includes('{derivative}')) {
              _item.title = _item.title.replace('{derivative}', derivative.symbol);
            }

            if (_item.description.includes('{derivative}')) {
              _item.description = _item.description.replace('{derivative}', derivative.symbol);
            }

            if (_item.description.includes('{inputToken}')) {
              _item.description = _item.description.replace('{inputToken}', inputAsset.symbol);
            }

            if (_item.description.includes('{existentialDeposit}')) {
              _item.description = _item.description.replace('{existentialDeposit}', '12');
            }

            if (_item.description.includes('{symbol}')) {
              _item.description = _item.description.replace('{symbol}', 'VARA');
            }

            return _item;
          });
        } else {
          return [];
        }
      }
      case YieldPoolType.LENDING: {
        const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
        const derivative = assetRegistry[derivativeSlug];
        const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];

        if (derivative && inputAsset) {
          return EARNING_DATA_RAW[YieldPoolType.LENDING].map(item => {
            const _item = item;
            if (_item.title.includes('{derivative}')) {
              _item.title = _item.title.replace('{derivative}', derivative.symbol);
            }

            if (_item.description.includes('{derivative}')) {
              _item.description = _item.description.replace('{derivative}', derivative.symbol);
            }

            if (_item.description.includes('{inputToken}')) {
              _item.description = _item.description.replace('{inputToken}', inputAsset.symbol);
            }

            if (_item.description.includes('{existentialDeposit}')) {
              _item.description = _item.description.replace('{existentialDeposit}', '12');
            }

            if (_item.description.includes('{symbol}')) {
              _item.description = _item.description.replace('{symbol}', 'VARA');
            }

            return _item;
          });
        } else {
          return [];
        }
      }
    }
  }, [assetRegistry, poolInfo]);

  const boxesProps: BoxProps[] = useMemo(() => {
    const result: BoxProps[] = [];
    if (!poolInfo) {
      return result;
    }

    /* First */
    {
      const icon = ThumbsUp;
      const iconColor = theme['lime-7'];

      switch (poolInfo.type) {
        case YieldPoolType.NOMINATION_POOL:
          result.push({
            title: 'Select active pool',
            description:
              'It is recommended that you select an active pool with the Earning status to earn staking rewards.',
            icon,
            iconColor,
          });
          break;
        case YieldPoolType.NATIVE_STAKING: {
          const _label = getValidatorLabel(poolInfo.chain);
          const label = _label.slice(0, 1).toLowerCase().concat(_label.slice(1)).concat('s');
          const maxCandidatePerFarmer = poolInfo.statistic?.maxCandidatePerFarmer || 0;
          result.push({
            title: 'Select {{number}} {{label}}'
              .replace('{{number}}', maxCandidatePerFarmer.toString())
              .replace('{{label}}', label),
            description: 'It is recommended that you select {{number}} {{label}} to optimize your staking rewards.'
              .replace('{{number}}', maxCandidatePerFarmer.toString())
              .replace('{{label}}', label),
            icon,
            iconColor,
          });
          break;
        }
        case YieldPoolType.LIQUID_STAKING: {
          const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
          const derivative = assetRegistry[derivativeSlug];
          const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];
          if (derivative && inputAsset) {
            result.push({
              title: 'Receive {{derivative}}'.replace('{{derivative}}', derivative.symbol),
              description:
                'Once staked, you will receive {{derivative}} as a representation of your staked {{inputToken}}.'
                  .replace('{{derivative}}', derivative.symbol)
                  .replace('{{inputToken}}', inputAsset.symbol),
              icon,
              iconColor,
            });
          }
          break;
        }
        case YieldPoolType.LENDING: {
          const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
          const derivative = assetRegistry[derivativeSlug];
          const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];
          if (derivative && inputAsset) {
            result.push({
              title: 'Receive {{derivative}}'.replace('{{derivative}}', derivative.symbol),
              description:
                'Once supplied, you will receive {{derivative}} as a representation of your staked {{inputToken}}.'
                  .replace('{{derivative}}', derivative.symbol)
                  .replace('{{inputToken}}', inputAsset.symbol),
              icon,
              iconColor,
            });
          }
          break;
        }
      }
    }

    /* Second */
    {
      const icon = Coins;
      const iconColor = theme['yellow-7'];

      switch (poolInfo.type) {
        case YieldPoolType.NOMINATION_POOL:
        case YieldPoolType.NATIVE_STAKING: {
          const unstakingPeriod = poolInfo.statistic?.unstakingPeriod || 0;
          const isDay = unstakingPeriod > 24;
          const time = isDay ? Math.floor(unstakingPeriod / 24) : unstakingPeriod;
          const unit = isDay ? 'day' : 'hour';
          const string = [time, unit].join('-');
          result.push({
            title: 'Unstake and withdraw',
            description: (
              <Typography.Text>
                Once staked, your funds will be locked. Unstake your funds anytime and withdraw after&nbsp;
                <Typography.Text style={styles.lightText}>a {string} period</Typography.Text>
                &nbsp;. Keep in mind that these actions are&nbsp;
                <Typography.Text style={styles.lightText}>not automated</Typography.Text>
                &nbsp;and will incur network fees.
              </Typography.Text>
            ),
            icon,
            iconColor,
          });
          break;
        }
        case YieldPoolType.LIQUID_STAKING: {
          const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
          const derivative = assetRegistry[derivativeSlug];
          const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];
          if (derivative && inputAsset) {
            result.push({
              title: 'Unstake and withdraw',
              description:
                'Once staked, you will receive {{derivative}} as a representation of your staked {{inputToken}}.'
                  .replace('{{derivative}}', derivative.symbol)
                  .replace('{{inputToken}}', inputAsset.symbol),
              icon,
              iconColor,
            });
          }
          break;
        }
        case YieldPoolType.LENDING: {
          const derivativeSlug = poolInfo.metadata.derivativeAssets?.[0] || '';
          const derivative = assetRegistry[derivativeSlug];
          const inputAsset = assetRegistry[poolInfo.metadata.inputAsset];
          if (derivative && inputAsset) {
            result.push({
              title: 'Withdraw anytime',
              description: 'Once supplied, your funds will be locked. Withdraw your funds anytime with a fee.',
              icon,
              iconColor,
            });
          }
          break;
        }
      }
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

    return result;
  }, [assetRegistry, poolInfo, styles.lightText, theme]);

  const [showScrollEnd, setShowScrollEnd] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);

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
        setIsScrollEnd(true);
      } else {
        setIsScrollEnd(false);
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
        <Typography.Text style={styles.headerText}>{title}</Typography.Text>
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
          {data.map((_props, index) => {
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
            Scroll down to continue. For more information and staking instructions, read&nbsp;
            <Text onPress={onPressFaq} style={styles.highlightText}>
              this FAQ.
            </Text>
          </Typography.Text>
          {showScrollEnd && !isScrollEnd && (
            <Button
              size="xs"
              icon={<Icon phosphorIcon={CaretDown} />}
              style={styles.scrollButton}
              type="primary"
              shape="circle"
              onPress={scrollBottom}
            />
          )}
        </View>
        {!!onStakeMore && (
          <Button
            icon={
              <Icon
                phosphorIcon={PlusCircle}
                weight="fill"
                iconColor={isScrollEnd || !showScrollEnd ? theme.colorWhite : theme.colorTextLight5}
              />
            }
            size="sm"
            onPress={onPress}
            disabled={!isScrollEnd && showScrollEnd}>
            Stake to earn
          </Button>
        )}
      </View>
    </SwModal>
  );
};

export default EarningPoolDetailModal;
