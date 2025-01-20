import { YieldPoolType } from '@subwallet/extension-base/types';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';

export const EARNING_POOL_DETAIL_DATA: StaticDataProps[] = [
  {
    id: '1',
    group: 'earning',
    slug: YieldPoolType.NOMINATION_POOL,
    instructions: [
      {
        icon: 'ThumbsUp',
        title: 'Select active pool',
        description:
          'It is recommended that you select an active pool with the <strong>Earning</strong> status to earn staking rewards',
        icon_color: '#aada62',
      },
      {
        icon: 'Coins',
        title: 'Unstake and withdraw',
        description:
          'Once staked, your funds will be locked. Unstake your funds anytime and withdraw after a period of <strong>{periodNumb}</strong>. Keep in mind that these actions are not automated and will incur network fees',
        icon_color: '#e6dc25',
      },
      {
        icon: 'CheckCircle',
        title: 'Keep your transferable balance',
        description:
          'Ensure that your transferable balance includes <strong>a minimum of {maintainBalance} {maintainSymbol}</strong> to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals',
        icon_color: '#4cd9ac',
      },
      {
        icon: 'Wallet',
        title: 'Claim your rewards',
        description:
          'Your staking rewards will be paid out every {paidOut} hour. Make sure to claim them <strong>manually</strong>',
        icon_color: '#51BC5E',
      },
      {
        icon: 'Eye',
        title: 'Track your stake',
        description: 'Keep an eye on your stake periodically, as rewards and staking status can fluctuate over time',
        icon_color: '#008dff',
      },
    ],
  },
  {
    id: '2',
    group: 'earning',
    slug: YieldPoolType.NATIVE_STAKING,
    instructions: [
      {
        icon: 'ThumbsUp',
        title: 'Select {validatorNumber} {validatorType}',
        description:
          'It is recommended that you select {validatorNumber} {validatorType} to optimize your staking rewards',
        icon_color: '#aada62',
      },
      {
        icon: 'Coins',
        title: 'Unstake and withdraw',
        description:
          'Once staked, your funds will be locked. Unstake your funds anytime and withdraw after a period of <strong>{periodNumb}</strong>. Keep in mind that these actions are <strong>not automated</strong> and will incur network fees',
        icon_color: '#e6dc25',
      },
      {
        icon: 'CheckCircle',
        title: 'Keep your transferable balance',
        description:
          'Ensure that your transferable balance includes <strong>a minimum of {maintainBalance} {maintainSymbol}</strong> to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals',
        icon_color: '#4cd9ac',
      },
      {
        icon: 'Wallet',
        title: 'Check your rewards',
        description:
          'Your staking rewards will be paid out every {paidOut} hour and will be automatically compounded to your stake',
        icon_color: '#51BC5E',
      },
      {
        icon: 'Eye',
        title: 'Manage your stake',
        description:
          'You need to monitor your stake constantly and change {validatorType} when needed as staking status can fluctuate over time',
        icon_color: '#008dff',
      },
    ],
  },
  {
    id: '3',
    group: 'earning',
    slug: YieldPoolType.LIQUID_STAKING,
    instructions: [
      {
        icon: 'ThumbsUp',
        title: 'Receive {derivative}',
        description: 'You will receive {derivative} as a representation of your staked {inputToken}',
        icon_color: '#aada62',
      },
      {
        icon: 'Coins',
        title: 'Unstake and withdraw',
        description:
          'Once staked, your funds will be locked. Unstake your funds anytime and withdraw immediately with a higher fee or wait {periodNumb} before withdrawing with a lower fee',
        icon_color: '#e6dc25',
      },
      {
        icon: 'CheckCircle',
        title: 'Keep your transferable balance',
        description:
          'Ensure that your transferable balance includes <strong>a minimum of {maintainBalance} {maintainSymbol}</strong> to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals.',
        icon_color: '#4cd9ac',
      },
      {
        icon: 'Wallet',
        title: 'Check your {derivative}',
        description:
          'The amount of {derivative} doesn’t increase over time, only its value in {inputToken} does. This means that by the time you decide to withdraw {inputToken} from {derivative}, your {derivative} should be worth more than your originally staked {inputToken}',
        icon_color: '#51BC5E',
      },
      {
        icon: 'Eye',
        title: 'Track your APY',
        description:
          'Keep an eye on your stake as APY can fluctuate over time. APY fluctuation is determined by the protocol beyond SubWallet’s control',
        icon_color: '#008dff',
      },
    ],
  },
  {
    id: '4',
    group: 'earning',
    slug: YieldPoolType.LENDING,
    instructions: [
      {
        icon: 'ThumbsUp',
        title: 'Receive {derivative}',
        description: 'You will receive {derivative} as a representation of your supplied {inputToken}',
        icon_color: '#aada62',
      },
      {
        icon: 'Coins',
        title: 'Withdraw anytime',
        description: 'Once supplied, your funds will be locked. Withdraw your funds anytime with a fee',
        icon_color: '#e6dc25',
      },
      {
        icon: 'CheckCircle',
        title: 'Keep your transferable balance',
        description:
          'Ensure that your transferable balance includes <strong>a minimum of {maintainBalance} {maintainSymbol}</strong> to cover your existential deposit and network fees associated with staking, unstaking, and withdrawals',
        icon_color: '#4cd9ac',
      },
      {
        icon: 'Wallet',
        title: 'Check your {derivative}',
        description:
          'The amount of {derivative} doesn’t increase over time, only its value in {inputToken} does. This means that by the time you decide to withdraw {inputToken} from {derivative}, your {derivative} should be worth more than your originally supplied {inputToken}',
        icon_color: '#51BC5E',
      },
      {
        icon: 'Eye',
        title: 'Track your APY',
        description:
          'Keep an eye on your supply as APY can fluctuate over time. APY fluctuation is determined by the protocol beyond SubWallet’s control',
        icon_color: '#008dff',
      },
    ],
  },
  {
    id: '5',
    group: 'earning',
    slug: 'DAPP_STAKING',
    instructions: [
      {
        icon: 'ThumbsUp',
        title: 'Select {validatorNumber} dApps',
        description: 'It is recommended that you select {validatorNumber} dApp to optimize your staking rewards',
        icon_color: '#aada62',
      },
      {
        icon: 'Coins',
        title: 'Unstake and withdraw',
        description:
          'Once staked, your funds will be locked. Unstake your funds anytime and withdraw after a period of <strong>{periodNumb}</strong>. Keep in mind that these actions are <strong>not automated</strong> and will incur network fees',
        icon_color: '#e6dc25',
      },
      {
        icon: 'CheckCircle',
        title: 'Keep your transferable balance',
        description:
          'Ensure that your transferable balance includes <strong>a minimum of {maintainBalance} {maintainSymbol}</strong> to cover your existential deposit and network fees associated with staking, reward claiming, unstaking and withdrawals',
        icon_color: '#4cd9ac',
      },
      {
        icon: 'Wallet',
        title: 'Claim your rewards',
        description:
          'Your staking rewards will be paid out every {paidOut} hour. Make sure to claim them <strong>manually</strong>',
        icon_color: '#51BC5E',
      },
      {
        icon: 'Eye',
        title: 'Track your stake',
        description: 'Keep an eye on your stake periodically, as rewards and staking status can fluctuate over time.',
        icon_color: '#008dff',
      },
    ],
  },
];

export const STAKE_ALERT_DATA = {
  title: 'Pay attention!',
  description:
    'Don’t stake all your funds. Keep in mind that you need at least {tokenAmount} in your free balance to pay gas fees for claiming rewards, unstaking and withdrawing',
};

export const UNSTAKE_ALERT_DATA: StaticDataProps[] = [
  {
    id: '1',
    group: 'earning',
    slug: 'UNSTAKE_INFO',
    title: '',
    media: '',
    instructions: [
      {
        title: 'Wait time',
        description: 'Once unstaked, your funds will become available for withdrawal after {unBondedTime}',
        icon: 'ClockClockwise',
        icon_color: '#2595e6',
      },
      {
        title: 'No rewards',
        description: 'During the unstaking period of {unBondedTime}, your tokens produce no rewards',
        icon: 'Coins',
        icon_color: '#e6dc25',
      },
      {
        title: 'Manual withdrawal',
        description: 'Keep in mind that you need to withdraw manually after the wait time is over',
        icon: 'DownloadSimple',
        icon_color: '#aada62',
      },
    ],
  },
];

export const UNSTAKE_BIFROST_ALERT_DATA: StaticDataProps[] = [
  {
    id: '1',
    group: 'earning',
    slug: 'UNSTAKE_INFO',
    title: '',
    media: '',
    instructions: UNSTAKE_ALERT_DATA[0].instructions.map((item, index) => ({
      ...item,
      title: index === 2 ? 'Automatic withdrawal' : item.title,
      description:
        index === 0
          ? 'Once unstaked, your funds will become available within {unBondedTime}'
          : index === 1
          ? 'During the unstaking period, your tokens produce no rewards'
          : index === 2
          ? 'The funds will be automatically withdrawn to your account once the wait time is over'
          : item.description,
    })),
  },
];

export const UNSTAKE_BITTENSOR_ALERT_DATA: StaticDataProps[] = [
  {
    id: '1',
    group: 'earning',
    slug: 'UNSTAKE_INFO',
    title: '',
    media: '',
    instructions: UNSTAKE_ALERT_DATA[0].instructions.map((item, index) => ({
      ...item,
      title: index === 2 ? 'Instant withdrawal' : item.title,
      description:
        index === 2 ? 'Once unstaked, the funds will be instantly withdrawn to your account' : item.description,
    })),
  },
];
