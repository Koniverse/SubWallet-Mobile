[
  {
    id: 3,
    priority: 1,
    position: 'token',
    repeat: 'once',
    content: 'SHOW POPUP TO CHECK INSTRUCTION',
    media: null,
    position_params: [],
    info: {
      id: 5,
      name: 'Popup with instruction',
      description: 'Test',
      start_time: '2024-03-19T17:00:00.000Z',
      stop_time: '2024-04-05T17:00:00.000Z',
      platforms: ['mobile'],
    },
    buttons: [
      {
        id: 5,
        label: 'Continue',
        color: 'primary',
        instruction: {
          id: 1,
          confirm_label: 'Continue',
          cancel_label: 'Cancel',
          instruction_id: 7,
          group: 'earning',
          slug: 'DAPP_STAKING',
        },
        action: { id: 6, url: 'subwallet://home/main/earning', screen: null, params: null, is_cancel: null },
      },
    ],
    conditions: {},
  },
];
