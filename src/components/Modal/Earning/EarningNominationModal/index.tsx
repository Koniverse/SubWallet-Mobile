import { _ChainAsset } from '@subwallet/chain-list/types';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { YieldPositionInfo } from '@subwallet/extension-base/types';
import { Avatar, Number, SwModal, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { toShort } from 'utils/index';
import createStyles from './style';
import { deviceHeight } from 'constants/index';

interface Props {
  item: YieldPositionInfo;
  setVisible: (value: boolean) => void;
  modalVisible: boolean;
  inputAsset: _ChainAsset;
}

const EarningNominationModal: React.FC<Props> = (props: Props) => {
  const { item, setVisible, modalVisible, inputAsset } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyles(theme), [theme]);
  const isRelayChain = useMemo(() => _STAKING_CHAIN_GROUP.relay.includes(item.chain), [item.chain]);

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setVisible}
      isAllowSwipeDown={Platform.OS === 'ios'}
      modalTitle={'Nomination info'}
      titleTextAlign="center">
      <MetaInfo style={styles.infoContainer} hasBackgroundWrapper={true}>
        <ScrollView style={{ maxHeight: deviceHeight * 0.7 }} showsVerticalScrollIndicator={false}>
          {item.nominations.map(nomination => {
            return (
              <View style={styles.infoRow} key={nomination.validatorAddress}>
                <View style={styles.accountRow}>
                  <Avatar value={nomination.validatorAddress} size={theme.sizeLG} />
                  <Typography.Text style={styles.accountText} ellipsis={true} numberOfLines={1}>
                    {nomination.validatorIdentity || toShort(nomination.validatorAddress)}
                  </Typography.Text>
                </View>
                {!isRelayChain && (
                  <Number
                    size={theme.fontSizeHeading6}
                    textStyle={styles.infoText}
                    value={nomination.activeStake}
                    decimal={inputAsset?.decimals || 0}
                    suffix={inputAsset?.symbol}
                    decimalOpacity={0.45}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      </MetaInfo>
    </SwModal>
  );
};

export default EarningNominationModal;
