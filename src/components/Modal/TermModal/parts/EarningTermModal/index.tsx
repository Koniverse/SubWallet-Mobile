import { fetchStaticData } from '@subwallet/extension-base/utils';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TermModal } from 'components/Modal/TermModal';
import { EarningTermAndCondition } from 'constants/termAndCondition';
import { RootState } from 'stores/index';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onPressAcceptBtn: () => void;
}

export const EarningTermModal = ({ modalVisible, setModalVisible, onPressAcceptBtn }: Props) => {
  const language = useSelector((state: RootState) => state.settings.language);
  const fallbackContent =
    EarningTermAndCondition[language as keyof typeof EarningTermAndCondition] || EarningTermAndCondition.en;
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    let mounted = true;

    fetchStaticData<string>('compliance-term-and-condition', `${language}.md`, false)
      .then(data => mounted && setContent(data || fallbackContent))
      .catch(() => mounted && setContent(fallbackContent));

    return () => {
      mounted = false;
    };
  }, [fallbackContent, language]);

  return (
    <TermModal
      title={'Compliance Confirmation'}
      beforeContent={
        'Before using staking, earning, or any third-party protocol services through SubWallet, please review and confirm the following:'
      }
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      checkboxLabel={'I have read, understood, and agree to the above, and confirm that all representations made by me are true, accurate, and complete to the best of my knowledge.'}
      acceptButtonTitle={'I Agree & Continue'}
      onPressAcceptBtn={onPressAcceptBtn}
      content={content}
      disabledOnPressBackDrop={true}
      disableBackButton={true}
      hideWhenCloseApp={false}
      warningMessage={'Make sure to tick the checkbox confirming that you agree to this Compliance Confirmation.'}
    />
  );
};
