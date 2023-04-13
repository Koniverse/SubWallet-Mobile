import { useCallback, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';

export function useSelectValidators(
  maxCount: number,
  onChange?: (value: string) => void,
  isSingleSelect?: boolean,
  closeModal?: () => void,
) {
  const { show } = useToast();

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
                show(`You can only choose ${maxCount} validators`);

                return currentChangeValidators;
              }
            }

            result = [changeVal];
          } else {
            if (currentChangeValidators.length >= maxCount) {
              show(`You can only choose ${maxCount} validators`);

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
    [defaultSelected, isSingleSelect, maxCount, show],
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
