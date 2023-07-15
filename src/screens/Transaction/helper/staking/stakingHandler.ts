import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getBondingOptions, getNominationPoolOptions } from 'messaging/index';
import { store } from 'stores/index';
import { ALL_KEY } from 'constants/index';
import i18n from 'utils/i18n/i18n';

export function getUnstakingPeriod(unstakingPeriod?: number) {
  if (unstakingPeriod) {
    const days = unstakingPeriod / 24;

    if (days < 1) {
      return `${unstakingPeriod} ${i18n.common.hours}`;
    } else {
      return `${days} ${i18n.common.days}`;
    }
  }

  return '';
}

export function getWaitingTime(waitingTime?: number) {
  const days = waitingTime ? Number((waitingTime / 24).toFixed(0)) : 0;

  if (days < 1) {
    if (days) {
      return i18n.inputLabel.withdrawInADay;
    } else {
      return i18n.inputLabel.availableForWithdraw;
    }
  } else {
    return i18n.inputLabel.withdrawInXDays(days);
  }
}

const fetchChainValidator = (chain: string, unmount: boolean, setValidatorLoading: (value: boolean) => void) => {
  if (!unmount) {
    setValidatorLoading(true);
    getBondingOptions(chain, StakingType.NOMINATED)
      .then(result => {
        store.dispatch({ type: 'bonding/updateChainValidators', payload: { chain, validators: result } });
      })
      .catch((e: Error) => console.error(e.message))
      .finally(() => {
        if (!unmount) {
          setValidatorLoading(false);
        }
      });
  }
};

const fetchChainPool = (chain: string, unmount: boolean, setPoolLoading: (value: boolean) => void) => {
  if (!unmount) {
    setPoolLoading(true);
    getNominationPoolOptions(chain)
      .then(result => {
        store.dispatch({ type: 'bonding/updateNominationPools', payload: { chain, pools: result } });
      })
      .catch(console.error)
      .finally(() => {
        if (!unmount) {
          setPoolLoading(false);
        }
      });
  }
};

export function fetchChainValidators(
  chain: string,
  stakingType: string,
  unmount: boolean,
  setPoolLoading: (value: boolean) => void,
  setValidatorLoading: (value: boolean) => void,
) {
  if (stakingType === ALL_KEY) {
    fetchChainValidator(chain, unmount, setValidatorLoading);
    fetchChainPool(chain, unmount, setPoolLoading);
  } else if (stakingType === StakingType.NOMINATED) {
    fetchChainValidator(chain, unmount, setValidatorLoading);
  } else if (stakingType === StakingType.POOLED) {
    fetchChainPool(chain, unmount, setPoolLoading);
  }
}
