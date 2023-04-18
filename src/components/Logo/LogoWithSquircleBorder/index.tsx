// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { ImageBackground, View } from 'react-native';
import CreateStyle from './styles';

interface Props {
  size?: number;
  innerSize?: number;
  children: React.ReactNode;
}

const LogoWithSquircleBorder: React.FC<Props> = (props: Props) => {
  const { innerSize = 56, size = 120, children } = props;
  const style = useMemo(() => CreateStyle(size, innerSize), [innerSize, size]);

  return (
    <ImageBackground
      source={{
        uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgo8bWFzayBpZD0ibWFzazBfODY0XzczMDgyIiBzdHlsZT0ibWFzay10eXBlOmFscGhhIiBtYXNrVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSIzMyIgeT0iMzMiIHdpZHRoPSI1NCIgaGVpZ2h0PSI1NCI+CjxwYXRoIGQ9Ik02MCAzMy4zOTk5QzgwLjE3MDUgMzMuMzk5OSA4Ni42IDM5LjgyOTQgODYuNiA1OS45OTk5Qzg2LjYgODAuMTcwNCA4MC4xNzA1IDg2LjU5OTkgNjAgODYuNTk5OUMzOS44Mjk1IDg2LjU5OTkgMzMuNCA4MC4xNzA0IDMzLjQgNTkuOTk5OUMzMy40IDM5LjgyOTQgMzkuODI5NSAzMy4zOTk5IDYwIDMzLjM5OTlaIiBmaWxsPSIjMDA0QkZGIi8+CjwvbWFzaz4KPHBhdGggZD0iTTYwIDE2LjVDNzYuNjU5OCAxNi41IDg3LjQ3OSAxOS4xNjI1IDk0LjE1ODIgMjUuODQxOEMxMDAuODM3IDMyLjUyMSAxMDMuNSA0My4zNDAyIDEwMy41IDYwQzEwMy41IDc2LjY1OTggMTAwLjgzNyA4Ny40NzkgOTQuMTU4MiA5NC4xNTgyQzg3LjQ3OSAxMDAuODM3IDc2LjY1OTggMTAzLjUgNjAgMTAzLjVDNDMuMzQwMiAxMDMuNSAzMi41MjEgMTAwLjgzNyAyNS44NDE4IDk0LjE1ODJDMTkuMTYyNSA4Ny40NzkgMTYuNSA3Ni42NTk4IDE2LjUgNjBDMTYuNSA0My4zNDAyIDE5LjE2MjUgMzIuNTIxIDI1Ljg0MTggMjUuODQxOEMzMi41MjEgMTkuMTYyNSA0My4zNDAyIDE2LjUgNjAgMTYuNVoiIHN0cm9rZT0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNNjAgMC41QzgyLjcyNjEgMC41IDk3LjU0NTMgNC4xMjkzOCAxMDYuNzA4IDEzLjI5MkMxMTUuODcxIDIyLjQ1NDcgMTE5LjUgMzcuMjczOSAxMTkuNSA2MEMxMTkuNSA4Mi43MjYxIDExNS44NzEgOTcuNTQ1MyAxMDYuNzA4IDEwNi43MDhDOTcuNTQ1MyAxMTUuODcxIDgyLjcyNjEgMTE5LjUgNjAgMTE5LjVDMzcuMjczOSAxMTkuNSAyMi40NTQ3IDExNS44NzEgMTMuMjkyIDEwNi43MDhDNC4xMjkzOCA5Ny41NDUzIDAuNSA4Mi43MjYxIDAuNSA2MEMwLjUgMzcuMjczOSA0LjEyOTM4IDIyLjQ1NDcgMTMuMjkyIDEzLjI5MkMyMi40NTQ3IDQuMTI5MzggMzcuMjczOSAwLjUgNjAgMC41WiIgc3Ryb2tlPSIjMjEyMTIxIi8+Cjwvc3ZnPgo=',
      }}
      resizeMode={'cover'}
      style={style.container}>
      <View style={style.inner}>{children}</View>
    </ImageBackground>
  );
};

export default LogoWithSquircleBorder;
