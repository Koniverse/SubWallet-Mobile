import { Button, Icon, SwModal } from 'components/design-system-ui';
import { SWModalProps } from 'components/design-system-ui/modal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ArrowCircleUpRight, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles/base';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  title: SWModalProps['modalTitle'];
}

const BaseDetailModal: React.FC<Props> = (props: Props) => {
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

  return (
    <View>
      <Button
        type="ghost"
        onPress={onOpen}
        icon={<Icon phosphorIcon={ArrowCircleUpRight} iconColor={theme['gray-4']} />}>
        {i18n.common.viewDetail}
      </Button>
      <SwModal
        setVisible={setOpen}
        modalVisible={open}
        modalTitle={title}
        onChangeModalVisible={onClose}
        modalStyle={{ maxHeight: 600 }}
        isUseForceHidden={false}
        onBackButtonPress={onClose}>
        <View style={{ maxHeight: 400, width: '100%' }}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={1}>{children}</TouchableOpacity>
          </ScrollView>
          <Button style={{ marginTop: 16 }} onPress={onClose} icon={<Icon phosphorIcon={XCircle} weight="fill" />}>
            {i18n.common.close}
          </Button>
        </View>
      </SwModal>
    </View>
  );
};

export default BaseDetailModal;
