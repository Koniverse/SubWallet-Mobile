import { useMemo } from 'react';
import { useCallback, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { useToast } from 'react-native-toast-notifications';

export function useSelectValidators(
  chain: string,
  maxCount: number,
  onChange?: (value: string) => void,
  isSingleSelect?: boolean,
  closeModal?: () => void,
) {
  const toast = useToast();
  // Current nominated at init
  const [defaultSelected, setDefaultSelected] = useState<string[]>([]);
  // Current selected validators
  const [selected, setSelected] = useState<string[]>([]);
  // Current chosen in modal
  const [changeValidators, setChangeValidators] = useState<string[]>([]);

  const fewValidators = maxCount > 1;

  const notiMessage = useMemo(() => {
    const label = getValidatorLabel(chain);

    if (!fewValidators) {
      switch (label) {
        case 'dApp':
          return i18n.toast.canOnlyChooseOneDapp;
        case 'Collator':
          return i18n.toast.canOnlyChooseOneCollator;
        case 'Validator':
          return i18n.toast.canOnlyChooseOneValidator;
      }
    } else {
      switch (label) {
        case 'dApp':
          return i18n.toast.canOnlyChooseNumberDapps;
        case 'Collator':
          return i18n.toast.canOnlyChooseNumberCollators;
        case 'Validator':
          return i18n.toast.canOnlyChooseNumberValidators;
      }
    }
  }, [chain, fewValidators]);
  const onChangeSelectedValidator = useCallback(
    (changeVal: string) => {
      setChangeValidators(currentChangeValidators => {
        let result: string[];

        if (!currentChangeValidators.includes(changeVal)) {
          if (isSingleSelect) {
            if (defaultSelected.length >= maxCount) {
              if (!defaultSelected.includes(changeVal)) {
                toast.hideAll();
                toast.show(i18n.formatString(notiMessage, maxCount) as string, {
                  type: 'normal',
                });

                return currentChangeValidators;
              }
            }

            result = [changeVal];
          } else {
            if (currentChangeValidators.length >= maxCount) {
              toast.hideAll();
              toast.show(i18n.formatString(notiMessage, maxCount) as string, {
                type: 'normal',
              });

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
    [defaultSelected, isSingleSelect, maxCount, notiMessage, toast],
  );

  const _onApplyChangeValidators = useCallback(
    (_changeValidators: string[]) => {
      onChange && onChange(_changeValidators.join(','));

      setSelected(_changeValidators);
      closeModal && closeModal();
    },
    [closeModal, onChange],
  );

  const onApplyChangeValidators = useCallback(() => {
    _onApplyChangeValidators(changeValidators);
  }, [_onApplyChangeValidators, changeValidators]);

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

  const resetValidatorSelector = useCallback(() => {
    setSelected([]);
    setChangeValidators([]);
    onChange && onChange('');
  }, [onChange]);

  // const onAutoSelectValidator = useCallback(() => {
  //   const validators = autoSelectValidatorOptimally(validatorList, maxCount);
  //   const validatorKeyList = validators.map(v => getValidatorKey(v.address, v.identity));
  //
  //   setChangeValidators(validatorKeyList);
  //   _onApplyChangeValidators(validatorKeyList);
  // }, [_onApplyChangeValidators, maxCount, validatorList]);

  return {
    resetValidatorSelector,
    onChangeSelectedValidator,
    changeValidators,
    onApplyChangeValidators,
    onCancelSelectValidator,
    onInitValidators,
  };
}
