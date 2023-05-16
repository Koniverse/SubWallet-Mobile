import { getTransactionLink } from '@subwallet/extension-base/services/transaction-service/utils';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import HistoryDetailLayout from './parts/Layout';
import { SWIconProps } from 'components/design-system-ui/icon';
import { InfoItemBase } from 'components/MetaInfo/types';
import { TransactionHistoryDisplayItem } from 'types/history';
import { RootState } from 'stores/index';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { ArrowSquareUpRight } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { Linking, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type Props = {
  onChangeModalVisible: () => void;
  modalVisible: boolean;
  data: TransactionHistoryDisplayItem | null;
};

export type StatusType = {
  schema: InfoItemBase['valueColorSchema'];
  icon: SWIconProps['phosphorIcon'];
  name: string;
  color?: string;
};

export function HistoryDetailModal({ data, onChangeModalVisible, modalVisible }: Props): React.ReactElement<Props> {
  const theme = useSubWalletTheme().swThemes;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const openBlockExplorer = useCallback((link: string) => {
    return () => {
      Linking.openURL(link);
    };
  }, []);

  const modalFooter = useMemo<React.ReactNode>(() => {
    if (!data) {
      return null;
    }

    const chainInfo = chainInfoMap[data.chain];
    const link =
      chainInfo && data.extrinsicHash && data.extrinsicHash !== '' && getTransactionLink(chainInfo, data.extrinsicHash);

    if (link) {
      return (
        <View style={{ padding: theme.size, alignSelf: 'stretch' }}>
          <Button icon={<Icon phosphorIcon={ArrowSquareUpRight} weight={'fill'} />} onPress={openBlockExplorer(link)}>
            {i18n.common.viewOnExplorer}
          </Button>
        </View>
      );
    }

    return null;
  }, [chainInfoMap, data, openBlockExplorer, theme.size]);

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={data?.displayData?.title || ''}
      footer={modalFooter}
      onChangeModalVisible={onChangeModalVisible}>
      <View style={{ alignSelf: 'stretch' }}>{data && <HistoryDetailLayout data={data} />}</View>
    </SwModal>
  );
}
