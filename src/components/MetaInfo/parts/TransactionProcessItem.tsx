import React, { useMemo, useState } from 'react';
import { InfoItemBase } from '../types';
import { ProcessType } from '@subwallet/extension-base/types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfoStyles from 'components/MetaInfo/style';
import { renderColContent } from 'components/MetaInfo/shared';
import useGeneralStyles from 'components/MetaInfo/hooks/useGeneralStyles';
import { Icon, Typography } from 'components/design-system-ui';
import { CaretRight } from 'phosphor-react-native';
import { ThemeTypes } from 'styles/themes';
import TransactionStepsModal from 'components/Modal/TransactionStepsModal';
import { TransactionProcessPreview } from 'components/TransactionProcess';
import { TransactionProcessStepItemType } from 'types/component';

export interface TransactionProcessItemType extends Omit<InfoItemBase, 'value'> {
  items: TransactionProcessStepItemType[];
  processChains?: string[];
  type: ProcessType;
}

const TransactionProcessItem = (props: TransactionProcessItemType) => {
  const { items, label, type, processChains } = props;
  const theme = useSubWalletTheme().swThemes;
  const _style = MetaInfoStyles(theme);
  const { labelGeneralStyle } = useGeneralStyles(theme);
  const styles = createStyle(theme);
  const [modalVisible, setModalVisible] = useState(false);

  const defaultLabel = useMemo(() => {
    return 'Process';
  }, []);

  const onOpenModal = () => {
    setModalVisible(true);
  };

  const stepText = useMemo(() => {
    const stepCount = items.length;

    return stepCount > 1 ? `${stepCount} steps` : `${stepCount} step`;
  }, [items.length]);

  return (
    <View style={_style.row}>
      <View style={[_style.col]}>
        {renderColContent(label || defaultLabel, { ..._style.label, ...labelGeneralStyle })}
      </View>
      <View style={[_style.col, _style['col.grow'], _style['col.to-right']]}>
        <TouchableOpacity onPress={onOpenModal} style={styles.stepModalTrigger}>
          {processChains ? (
            <TransactionProcessPreview chains={processChains} />
          ) : (
            <Typography.Text style={{ color: theme.colorWhite }}>{stepText}</Typography.Text>
          )}

          <Icon phosphorIcon={CaretRight} customSize={20} />
        </TouchableOpacity>

        {modalVisible && (
          <TransactionStepsModal
            modalVisible={modalVisible}
            items={items}
            type={type}
            setModalVisible={setModalVisible}
            onCancel={() => setModalVisible(false)}
          />
        )}
      </View>
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    stepModalTrigger: {
      backgroundColor: theme.colorTextLight8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
      paddingVertical: theme.paddingXS,
      paddingLeft: theme.padding,
      paddingRight: theme.paddingXS,
    },
  });
}

export default TransactionProcessItem;
