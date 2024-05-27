import React from 'react';
import { TermModal } from 'components/Modal/TermModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onPressAcceptBtn: () => void;
}

export const SwapTermOfServiceModal = ({ modalVisible, setModalVisible, onPressAcceptBtn }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const content = `
  The SubWallet Interface provides a web or mobile-based means of access to decentralized protocols on various public blockchains. The SubWallet Interface is distinct from the protocols and is one, but not the exclusive, means of accessing the protocols.
  
  SubWallet does not control or operate any protocols on any blockchain network. By using the SubWallet Interface, you understand that you are not buying or selling digital assets from us and that we do not operate any liquidity pools on the protocols or control trade execution on the protocols.
  
  Blockchain transactions require the payment of transaction fees to the appropriate network called gas fees. Except as otherwise expressly set forth in the terms of another offer by SubWallet, you will be solely responsible for paying the gas fees for any transaction that you initiate. Double-check the gas fees before making any transaction as gas fees can fluctuate.
  `;
  return (
    <TermModal
      title={'Terms of service'}
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      checkboxLabel={'I understand the associated risk and will act under caution'}
      onPressAcceptBtn={onPressAcceptBtn}
      content={content}
      disabledOnPressBackDrop={true}
      showAcceptBtn={false}
      hideWhenCloseApp={false}
      beforeContent={
        'You’re using third-party swap providers, which may contain inherent risks. Please read the following carefully:'
      }
      externalContentStyle={{
        backgroundColor: theme.colorBgSecondary,
        marginHorizontal: 0,
        borderRadius: theme.borderRadiusLG,
      }}
    />
  );
};
