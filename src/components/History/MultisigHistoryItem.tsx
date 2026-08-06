import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ArrowsLeftRightIcon,
  ArrowUpRightIcon,
  ClockCounterClockwiseIcon,
  DatabaseIcon,
  IconProps,
  NewspaperClippingIcon,
  PencilIcon,
  QuestionIcon,
  TreeStructureIcon,
} from 'phosphor-react-native';
import { MultisigTxType, PendingMultisigTx } from '@subwallet/extension-base/services/multisig-service';
import { Icon, Logo, Typography } from 'components/design-system-ui';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { MULTISIG_TX_TYPE_NAME_MAP } from 'constants/multisig';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { customFormatDate } from 'utils/customFormatDate';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';

interface Props {
  item: PendingMultisigTx;
  onPress?: () => void;
}

const stakeTypes = [
  MultisigTxType.STAKING,
  MultisigTxType.REDEEM,
  MultisigTxType.UNSTAKE,
  MultisigTxType.WITHDRAW,
  MultisigTxType.CANCEL_UNSTAKE,
];

const govTypes = [MultisigTxType.GOV_VOTE, MultisigTxType.GOV_REMOVE_VOTE, MultisigTxType.GOV_UNLOCK_VOTE];

const substrateProxyTypes = [MultisigTxType.ADD_PROXY, MultisigTxType.REMOVE_PROXY];

export const MultisigHistoryItem = ({ item, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const txIcon = useMemo((): React.ElementType<IconProps> => {
    const method = item.decodedCallData?.method || '';

    if (item.multisigTxType === MultisigTxType.TRANSFER || method.includes('transfer')) {
      return ArrowUpRightIcon;
    }

    if (item.multisigTxType === MultisigTxType.CLAIM_REWARD) {
      return ClockCounterClockwiseIcon;
    }

    if (item.multisigTxType === MultisigTxType.NOMINATE) {
      return PencilIcon;
    }

    if (stakeTypes.includes(item.multisigTxType)) {
      return DatabaseIcon;
    }

    if (item.multisigTxType === MultisigTxType.SWAP) {
      return ArrowsLeftRightIcon;
    }

    if (govTypes.includes(item.multisigTxType) || item.multisigTxType === MultisigTxType.LENDING) {
      return NewspaperClippingIcon;
    }

    if (substrateProxyTypes.includes(item.multisigTxType)) {
      return TreeStructureIcon;
    }

    if (item.multisigTxType === MultisigTxType.SET_TOKEN_PAY_FEE) {
      return NewspaperClippingIcon;
    }

    return QuestionIcon;
  }, [item.decodedCallData?.method, item.multisigTxType]);

  const currentApprovals = item.approvals.length;
  const threshold = item.threshold;
  const percent = threshold > 0 ? Math.min((currentApprovals / threshold) * 100, 100) : 0;
  const isApproved = currentApprovals === threshold;

  const currentSignerInWallet = useGetAccountByAddress(item.currentSigner);
  const multisigAccInWallet = useGetAccountByAddress(item.multisigAddress);

  const typeName = MULTISIG_TX_TYPE_NAME_MAP()[item.multisigTxType || MultisigTxType.UNKNOWN];
  const timeLabel = item.timestamp ? customFormatDate(item.timestamp, '#hhhh#:#mm#') : i18n.multisig.processing;

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Icon phosphorIcon={txIcon} size={'md'} iconColor={theme.colorTextLight1} />
          <View style={styles.chainLogo}>
            <Logo network={item.chain} size={16} shape={'circle'} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Typography.Text ellipsis style={styles.accountName}>
              {currentSignerInWallet?.name || toShort(item.currentSigner)}
            </Typography.Text>
            <Typography.Text style={[styles.statusText, isApproved ? styles.statusApproved : styles.statusWaiting]}>
              {isApproved ? i18n.multisig.approved : i18n.multisig.waitingForApproval}
            </Typography.Text>
          </View>
          <Typography.Text size={'sm'} style={styles.meta}>
            {`${typeName} - ${timeLabel}`}
          </Typography.Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.labelRow}>
          <Typography.Text size={'sm'} style={styles.meta}>
            {i18n.multisig.approvalStatus}
          </Typography.Text>
          <Typography.Text size={'sm'} style={styles.count}>
            {i18n.formatString(i18n.multisig.approvalCount, currentApprovals, threshold)}
          </Typography.Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <Typography.Text size={'sm'} style={styles.meta}>
          {i18n.multisig.multisigAccount}
        </Typography.Text>
        <View style={styles.multisigAccount}>
          <AccountProxyAvatar size={24} value={multisigAccInWallet?.proxyId || item.multisigAddress} />
          <Typography.Text ellipsis style={styles.multisigAccountName}>
            {multisigAccInWallet?.name || toShort(item.multisigAddress || '', 8, 9)}
          </Typography.Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
      paddingBottom: theme.padding,
      marginBottom: theme.marginSM,
      gap: theme.sizeXS,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colorBgInput,
    },
    chainLogo: {
      position: 'absolute',
      right: -2,
      bottom: -2,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeXS,
    },
    accountName: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      flexShrink: 1,
    },
    statusText: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
    },
    statusApproved: {
      color: theme.colorSuccess,
    },
    statusWaiting: {
      color: theme.colorWarning,
    },
    meta: {
      ...FontMedium,
      color: theme.colorTextTertiary,
    },
    progressSection: {
      gap: theme.sizeXXS,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    count: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    barTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colorBgInput,
      overflow: 'hidden',
    },
    barFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colorSuccess,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colorBgInput,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeXS,
    },
    multisigAccount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
      flexShrink: 1,
    },
    multisigAccountName: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      flexShrink: 1,
    },
  });
}

export default MultisigHistoryItem;
