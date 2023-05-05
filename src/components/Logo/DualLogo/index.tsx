// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SVGImages } from 'assets/index';
import Icon from '../../design-system-ui/icon';
import CreateStyle from './styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import LogoWithSquircleBorder from '../LogoWithSquircleBorder';
import { ArrowsLeftRight } from 'phosphor-react-native';
import React, { Suspense, useMemo } from 'react';
import { View } from 'react-native';

interface Props {
  leftLogo?: React.ReactNode;
  rightLogo?: React.ReactNode;
  linkIcon?: React.ReactNode;
  linkIconBg?: string;
}

const defaultLinkIcon = <Icon customSize={24} phosphorIcon={ArrowsLeftRight} />;
const defaultLogo = (
  <Suspense>
    <SVGImages.Logo width={56} height={56} />
  </Suspense>
);

const DualLogo = ({
  leftLogo = defaultLogo,
  linkIcon = defaultLinkIcon,
  rightLogo = defaultLogo,
  linkIconBg,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => CreateStyle(theme, linkIconBg), [linkIconBg, theme]);

  return (
    <View style={styles.container}>
      <LogoWithSquircleBorder>{leftLogo}</LogoWithSquircleBorder>
      <View style={styles.linkIcon}>{linkIcon}</View>
      <LogoWithSquircleBorder>{rightLogo}</LogoWithSquircleBorder>
    </View>
  );
};

export default DualLogo;
