import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useMemo } from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import createStyle from './styles';
import { useCheckShowAddressFormatInfoBox } from 'hooks/transaction/confirmation/useCheckShowAddressFormatInfoBox';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import AlertBoxInstant from 'components/design-system-ui/alert-box/instant';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  gap?: number;
  isFullHeight?: boolean;
  containerStyle?: ViewStyle;
  isTransaction?: boolean;
  transaction?: SWTransactionResult;
};

const ConfirmationContent: React.FC<Props> = (props: Props) => {
  const { children, gap, containerStyle, isTransaction, transaction } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme, gap), [theme, gap]);
  const isShowAddressFormatInfoBox = useCheckShowAddressFormatInfoBox(transaction);

  return (
    <ScrollView style={[styles.container, containerStyle]} contentContainerStyle={styles.content}>
      {children}

      {isTransaction && isShowAddressFormatInfoBox && <AlertBoxInstant type={'new-address-format'} />}
    </ScrollView>
  );
};

export default ConfirmationContent;
