import React from 'react';
import { View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ResultAccountProxyItem, {
  ResultAccountProxyItemType,
} from 'screens/MigrateAccount/SummaryView/ResultAccountProxyItem';
import { Button, SwModal } from 'components/design-system-ui';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  accountProxies: ResultAccountProxyItemType[];
}

const ResultAccountProxyListModal: React.FC<Props> = ({ accountProxies, setModalVisible, modalVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      isUseModalV2
      modalTitle={'Migrated account list'}
      footer={
        <View style={{ paddingTop: theme.padding }}>
          <Button onPress={() => setModalVisible(false)}>{'Close'}</Button>
        </View>
      }>
      <View style={{ gap: theme.sizeXS }}>
        {accountProxies.map(ap => (
          <ResultAccountProxyItem
            key={ap.accountProxyId}
            accountProxyId={ap.accountProxyId}
            accountName={ap.accountName}
          />
        ))}
      </View>
    </SwModal>
  );
};

export default ResultAccountProxyListModal;
