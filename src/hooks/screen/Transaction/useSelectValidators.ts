import React from 'react';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

export function useSelectValidators(
  maxCount: number,
  onChange?: (value: string) => void,
  isSingleSelect?: boolean,
  closeModal?: () => void,
  toastRef?: React.RefObject<Toast>,
) {
  // Current nominated at init
  const [defaultSelected, setDefaultSelected] = useState<string[]>([]);
  // Current selected validators
  const [selected, setSelected] = useState<string[]>([]);
  // Current chosen in modal
  const [changeValidators, setChangeValidators] = useState<string[]>([]);

  const onChangeSelectedValidator = useCallback(
    (changeVal: string) => {
      setChangeValidators(currentChangeValidators => {
        let result: string[];

        if (!currentChangeValidators.includes(changeVal)) {
          if (isSingleSelect) {
            if (defaultSelected.length >= maxCount) {
              if (!defaultSelected.includes(changeVal)) {
                if (toastRef && toastRef.current) {
                  toastRef.current.hideAll();
                  toastRef.current.show(i18n.stakingScreen.maximumSelectableValidators(maxCount), { type: 'normal' });
                }

                return currentChangeValidators;
              }
            }

            result = [changeVal];
          } else {
            if (currentChangeValidators.length >= maxCount) {
              if (toastRef && toastRef.current) {
                toastRef.current.hideAll();
                toastRef.current.show(i18n.stakingScreen.maximumSelectableValidators(maxCount), { type: 'normal' });
              }

              return currentChangeValidators;
            }

            result = [...currentChangeValidators, changeVal];
          }
        } else {
          if (isSingleSelect) {
            result = [];
          } else {
            result = currentChangeValidators.filter(item => item !== changeVal);
          }
        }

        return result;
      });
    },
    [defaultSelected, isSingleSelect, maxCount, toastRef],
  );

  const onApplyChangeValidators = useCallback(() => {
    onChange && onChange(changeValidators.join(','));

    setSelected(changeValidators);
    closeModal && closeModal();
  }, [changeValidators, closeModal, onChange]);

  const onCancelSelectValidator = useCallback(() => {
    setChangeValidators(selected);
    closeModal && closeModal();
  }, [selected, closeModal]);

  const onInitValidators = useCallback((defaultValue: string, _defaultSelected: string) => {
    const _selected = !_defaultSelected ? [] : _defaultSelected.split(',');
    const _default = !defaultValue ? [] : defaultValue.split(',');

    setChangeValidators(_selected);
    setDefaultSelected(_default);
    setSelected(_selected);
  }, []);

  return {
    onChangeSelectedValidator,
    changeValidators,
    onApplyChangeValidators,
    onCancelSelectValidator,
    onInitValidators,
  };
}
