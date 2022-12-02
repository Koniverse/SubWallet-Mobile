import { AccountInfoField } from 'components/Field/AccountInfo';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { SubmitButton } from 'components/SubmitButton';
import { deviceHeight, statusBarHeight } from 'constants/index';
import useGetAccountAndNetworkScanned from 'hooks/screen/Signing/useGetAccountAndNetworkScanned';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useMemo } from 'react';
import { Platform, ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import MessageDetail from 'screens/Signing/Detail/Message';
import EvmTransactionDetail from 'screens/Signing/Detail/Transaction/Evm';
import SubstrateTransactionDetail from 'screens/Signing/Detail/Transaction/Substrate';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import reformatAddress from 'utils/index';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  width: '100%',
  maxHeight: deviceHeight - statusBarHeight - (Platform.OS === 'android' ? 20 : 80),
};

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
  textAlign: 'center',
  marginBottom: 24,
};

const ContentWrapperStyle: StyleProp<ViewStyle> = {
  marginTop: 16,
};

const CloseButtonStyle: StyleProp<ViewStyle> = {
  marginTop: 16,
};

const ResultDetail = ({ onClose, isVisible }: Props) => {
  const {
    state: { senderAddress, isEthereumStructure, type },
  } = useContext(ScannerContext);

  const { account, network } = useGetAccountAndNetworkScanned();

  const formattedAddress = useMemo(
    () => reformatAddress(account?.address || senderAddress || '', network?.ss58Format || 0, network?.isEthereum),
    [account?.address, senderAddress, network],
  );

  const renderContent = useCallback((): JSX.Element => {
    switch (type) {
      case 'message':
        return <MessageDetail />;
      case 'transaction':
        if (isEthereumStructure) {
          return <EvmTransactionDetail />;
        } else {
          return <SubstrateTransactionDetail />;
        }
      default:
        return <></>;
    }
  }, [isEthereumStructure, type]);

  return (
    <SubWalletModal modalVisible={isVisible}>
      <View style={ContainerStyle}>
        <Text style={TitleTextStyle}>
          {type === 'message' ? i18n.title.authorizeMessage : i18n.title.authorizeTransaction}
        </Text>
        <AccountInfoField address={formattedAddress} name={account?.name || ''} networkKey={network?.key} />
        <ScrollView style={ContentWrapperStyle} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
        <SubmitButton title={i18n.common.close} onPress={onClose} style={CloseButtonStyle} />
      </View>
    </SubWalletModal>
  );
};

export default React.memo(ResultDetail);
