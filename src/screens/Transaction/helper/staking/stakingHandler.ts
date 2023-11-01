import { StakingType, UnstakingStatus } from '@subwallet/extension-base/background/KoniTypes';
import { getBondingOptions, getNominationPoolOptions } from 'messaging/index';
import { store } from 'stores/index';
import { ALL_KEY } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import moment from 'moment';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';

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

export function getWaitingTime(waitingTime: number, status: UnstakingStatus) {
  if (status === UnstakingStatus.CLAIMABLE) {
    return i18n.inputLabel.availableForWithdraw;
  } else {
    if (waitingTime > 24) {
      const days = moment.duration(waitingTime, 'hours').days();

      return i18n.formatString(i18n.inputLabel.withdrawInXDays, days);
    } else {
      return i18n.inputLabel.withdrawInADay;
    }
  }
}

const fetchChainValidator = (
  chain: string,
  unmount: boolean,
  setValidatorLoading: (value: boolean) => void,
  setForceFetchValidator: (value: boolean) => void,
) => {
  if (!unmount) {
    setValidatorLoading(true);
    getBondingOptions(chain, StakingType.NOMINATED)
      .then(result => {
        store.dispatch({ type: 'bonding/updateChainValidators', payload: { chain, validators: result } });
      })
      .catch(console.error)
      .finally(() => {
        if (!unmount) {
          setValidatorLoading(false);
          setForceFetchValidator(false);
        }
      });
  }
};

const fetchChainPool = (
  chain: string,
  unmount: boolean,
  setPoolLoading: (value: boolean) => void,
  setForceFetchValidator: (value: boolean) => void,
) => {
  if (!unmount && _STAKING_CHAIN_GROUP.nominationPool.includes(chain)) {
    setPoolLoading(true);
    getNominationPoolOptions(chain)
      .then(result => {
        store.dispatch({ type: 'bonding/updateNominationPools', payload: { chain, pools: result } });
      })
      .catch(console.error)
      .finally(() => {
        if (!unmount) {
          setPoolLoading(false);
          setForceFetchValidator(false);
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
  setForceFetchValidator: (value: boolean) => void,
) {
  if (stakingType === ALL_KEY) {
    fetchChainValidator(chain, unmount, setValidatorLoading, setForceFetchValidator);
    fetchChainPool(chain, unmount, setPoolLoading, setForceFetchValidator);
  } else if (stakingType === StakingType.NOMINATED) {
    fetchChainValidator(chain, unmount, setValidatorLoading, setForceFetchValidator);
  } else if (stakingType === StakingType.POOLED) {
    fetchChainPool(chain, unmount, setPoolLoading, setForceFetchValidator);
  }
}
