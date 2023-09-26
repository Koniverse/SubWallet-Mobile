module.exports = {
  project: {
    android: {
      unstable_reactLegacyComponentNames: [
        'RNCAsyncStorage',
        'RNVectorIcons',
        'BVLinearGradient',
        'RNCMaskedView',
        'RNSVG',
        'RNSVGImage',
        'RNReanimated',
        'RNCamera',
        'FastImageView', // This library isn't work on ios with Fabric
      ],
    },
    ios: {
      unstable_reactLegacyComponentNames: [
        'RNCAsyncStorage',
        'RNVectorIcons',
        'BVLinearGradient',
        'RNCMaskedView',
        'RNSVG',
        'RNSVGImage',
        'RNReanimated',
        'RNCamera',
      ],
    },
  },
};
