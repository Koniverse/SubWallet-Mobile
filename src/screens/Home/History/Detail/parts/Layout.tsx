import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { CopyIcon } from 'phosphor-react-native';

import HistoryDetailAmount from './Amount';
import HistoryDetailCallData from './CallDataLayout';
import HistoryDetailFee from './Fee';
import HistoryDetailHeader from './Header';
import MetaInfo from 'components/MetaInfo';
import { Icon, Typography } from 'components/design-system-ui';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { HistoryStatusMap, TxTypeNameMap } from '../../shared';
import { TransactionHistoryDisplayItem } from 'types/history';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';
import { formatHistoryDate } from 'utils/customFormatDate';
import { IconProps } from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ExtrinsicType, LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { isAbleToShowFee } from 'components/common/HistoryItem';
import { SwapLayout } from 'screens/Home/History/parts/SwapLayout';
import { hexAddPrefix, isHex } from '@polkadot/util';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailLayout: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const txtTypeNameMap = TxTypeNameMap();
  const historyStatusMap = HistoryStatusMap();
  const language = useSelector((state: RootState) => state.settings.language) as LanguageType;
  const networkPrefix = useGetChainPrefixBySlug(data.chain);
  const toast = useToast();

  const signerAddress = useMemo(() => {
    if (data.type === ExtrinsicType.SUBSTRATE_PROXY_INIT_TX) {
      return undefined;
    }

    return (data.additionalInfo as { signer?: string } | undefined)?.signer;
  }, [data.additionalInfo, data.type]);

  const signerAccount = useGetAccountByAddress(signerAddress);

  const extrinsicHash = useMemo(() => {
    const hash = data.extrinsicHash || '';

    return isHex(hexAddPrefix(hash)) ? toShort(data.extrinsicHash, 8, 9) : '...';
  }, [data.extrinsicHash]);

  const onCopyExtrinsicHash = useCallback(() => {
    Clipboard.setString(data.extrinsicHash || '');
    toast.show(i18n.common.copiedToClipboard, { type: 'success' });
  }, [data.extrinsicHash, toast]);

  if (data.type === ExtrinsicType.SWAP) {
    return <SwapLayout data={data} />;
  }

  return (
    <MetaInfo>
      <MetaInfo.DisplayType label={i18n.historyScreen.label.transactionType} typeName={txtTypeNameMap[data.type]} />
      <HistoryDetailHeader data={data} />
      <MetaInfo.Status
        label={i18n.historyScreen.label.transactionStatus}
        statusIcon={historyStatusMap[data.status].icon as React.ElementType<IconProps>}
        statusName={historyStatusMap[data.status].name}
        valueColorSchema={historyStatusMap[data.status].schema}
      />

      {!!signerAddress && (
        <MetaInfo.Account
          address={signerAddress}
          label={i18n.multisig.signWith}
          name={signerAccount?.name}
          networkPrefix={networkPrefix}
        />
      )}

      <MetaInfo.Default label={i18n.historyScreen.label.extrinsicHash}>
        {extrinsicHash === '...' ? (
          extrinsicHash
        ) : (
          <TouchableOpacity activeOpacity={1} style={styles.inlineValue} onPress={onCopyExtrinsicHash}>
            <Typography.Text style={styles.valueText}>{extrinsicHash}</Typography.Text>
            <Icon phosphorIcon={CopyIcon} customSize={18} iconColor={theme.colorTextLight4} />
          </TouchableOpacity>
        )}
      </MetaInfo.Default>

      <HistoryDetailCallData data={data} />

      {!!data.time && (
        <MetaInfo.Default label={i18n.historyScreen.label.submittedTime}>
          {formatHistoryDate(data.time, language, 'detail')}
        </MetaInfo.Default>
      )}
      {!!data.blockTime && (
        <MetaInfo.Default label={'Block time'}>
          {formatHistoryDate(data.blockTime, language, 'detail')}
        </MetaInfo.Default>
      )}
      <HistoryDetailAmount data={data} />
      {isAbleToShowFee(data) && <HistoryDetailFee data={data} />}
    </MetaInfo>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    inlineValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    valueText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
  });
}

export default HistoryDetailLayout;
