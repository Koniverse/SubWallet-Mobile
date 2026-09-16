import { Button, Icon, SwModal } from 'components/design-system-ui';
import { SWModalProps } from 'components/design-system-ui/modal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ArrowCircleUpRightIcon, XCircleIcon } from 'phosphor-react-native';
import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles/base';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  title: SWModalProps['modalTitle'];
}

// Lets another control (the call data info icon on a multisig signature request) open the
// same detail sheet as the "View Detail" button, like the extension's useOpenDetailModal.
export interface BaseDetailModalRef {
  open: () => void;
}

const BaseDetailModal = React.forwardRef<BaseDetailModalRef, Props>((props: Props, ref) => {
  const { children, title } = props;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [open, setOpen] = useState(false);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({ open: onOpen }), [onOpen]);

  return (
    <View>
      <Button
        type="ghost"
        onPress={onOpen}
        icon={<Icon phosphorIcon={ArrowCircleUpRightIcon} iconColor={theme['gray-4']} />}>
        {i18n.common.viewDetail}
      </Button>
      <SwModal
        setVisible={setOpen}
        modalVisible={open}
        modalTitle={title}
        titleTextAlign={'center'}
        onChangeModalVisible={onClose}
        modalStyle={{ maxHeight: 600 }}
        isUseForceHidden={false}
        onBackButtonPress={onClose}>
        <View style={{ maxHeight: 400, width: '100%' }}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={1}>{children}</TouchableOpacity>
          </ScrollView>
          <Button style={{ marginTop: 16 }} onPress={onClose} icon={<Icon phosphorIcon={XCircleIcon} weight="fill" />}>
            {i18n.common.close}
          </Button>
        </View>
      </SwModal>
    </View>
  );
});

export default BaseDetailModal;
