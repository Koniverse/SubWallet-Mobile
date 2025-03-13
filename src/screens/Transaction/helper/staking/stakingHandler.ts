import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { getBondingOptions, getNominationPoolOptions } from 'messaging/index';
import { store } from 'stores/index';
import { ALL_KEY } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import humanizeDuration from 'humanize-duration';

export function getUnstakingPeriod(unstakingPeriod?: number) {
  if (unstakingPeriod) {
    const days = unstakingPeriod / 24;

    if (days < 1) {
      if (unstakingPeriod < 1) {
        const minutes = unstakingPeriod * 60;

        return `${minutes} minutes`;
      }

      return `${unstakingPeriod} ${i18n.common.hours}`;
    } else {
      return `${days} ${i18n.common.days}`;
    }
  }

  return '';
}

export function getWaitingTime(currentTimestampMs: number, targetTimestampMs?: number, waitingTime?: number) {
  let remainingTimestampMs: number;

  if (targetTimestampMs !== undefined) {
    remainingTimestampMs = targetTimestampMs - currentTimestampMs;
  } else {
    if (waitingTime !== undefined) {
      remainingTimestampMs = waitingTime * 60 * 60 * 1000;
    } else {
      return i18n.earningScreen.withdrawInfo.automaticWithdrawal;
    }
  }

  if (remainingTimestampMs <= 0) {
    return i18n.earningScreen.withdrawInfo.availableForWithdrawal;
  } else {
    const remainingTimeHr = remainingTimestampMs / 1000 / 60 / 60;

    // Formatted waitting time without round up

    const _formattedWaitingTime = humanizeDuration(remainingTimestampMs, {
      units: remainingTimeHr >= 24 ? ['d', 'h'] : ['h', 'm'],
      round: false,
      delimiter: ' ',
      language: 'shortEn',
      // @ts-ignore
      languages: {
        shortEn: {
          y: () => 'y',
          mo: () => 'mo',
          w: () => 'w',
          d: () => 'd',
          h: () => 'hr',
          m: () => 'm',
          s: () => 's',
          ms: () => 'ms',
        },
      }, // TODO: should not be shorten
    }) as string;

    // Formatted waitting time with round up
    const formattedWaitingTime = _formattedWaitingTime
      .split(' ')
      .map((segment, index) => {
        if (index % 2 === 0) {
          return Math.ceil(parseFloat(segment)).toString();
        }

        return segment;
      })
      .join(' ');

    return i18n.earningScreen.withdrawInfo.withdrawableIn.replace('{{time}}', formattedWaitingTime);
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
