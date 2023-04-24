// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmSignatureRequest } from '@subwallet/extension-base/background/KoniTypes';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo } from 'react';

import { isArray, isAscii, u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { Text, View } from 'react-native';
import createStyle from './styles/message';
import i18n from 'utils/i18n/i18n';

interface Props {
  payload: EvmSignatureRequest;
}

interface SignTypedDataObjectV1 {
  type: string;
  name: string;
  value: unknown;
}

const checkIsLeaf = (data: unknown): boolean => {
  if (isArray(data)) {
    return typeof data[0] === 'object';
  } else {
    return typeof data === 'object';
  }
};

const EvmMessageDetail: React.FC<Props> = (props: Props) => {
  const {
    payload: { payload, type },
  } = props;
  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const signMethod = useMemo(() => {
    if (type === 'eth_sign') {
      return 'ETH Sign';
    } else if (type === 'personal_sign') {
      return 'Personal Sign';
    } else if (type === 'eth_signTypedData') {
      return 'Sign Typed Data';
    } else if (type === 'eth_signTypedData_v1') {
      return 'Sign Typed Data V1';
    } else if (type === 'eth_signTypedData_v3') {
      return 'Sign Typed Data V3';
    } else if (type === 'eth_signTypedData_v4') {
      return 'Sign Typed Data V4';
    }

    return '';
  }, [type]);

  const rawData = useMemo(
    () => (typeof payload === 'string' ? payload : (JSON.parse(JSON.stringify(payload)) as object)),
    [payload],
  );

  const renderData = useCallback(
    (data: unknown, needFilter?: boolean): React.ReactNode => {
      if (isArray(data)) {
        if (typeof data[0] !== 'object') {
          return (
            <View style={styles.arrayValue}>
              {data.map((datum, index) => (
                <Text key={index}>{datum as string}</Text>
              ))}
            </View>
          );
        } else {
          return (
            <View style={styles.arrayValue}>
              <Text style={styles.label}>[</Text>
              {data.map((datum, index) => (
                <React.Fragment key={index}>{renderData(datum, needFilter)}</React.Fragment>
              ))}
              <Text style={styles.label}>]</Text>
            </View>
          );
        }
      }

      if (typeof data !== 'object') {
        const raw = data as string;

        return isAscii(raw) ? u8aToString(u8aUnwrapBytes(raw)) : raw;
      } else {
        return (
          <>
            {Object.entries(data as object).map(([key, datum], index) => {
              const isLeaf = checkIsLeaf(datum);

              if (needFilter && key.toLowerCase() !== 'message') {
                return null;
              }

              const RenderComponent = isLeaf ? MetaInfo.Data : MetaInfo.Default;
              const label = key.charAt(0).toUpperCase() + key.substring(1);

              return (
                <View style={styles.node}>
                  <RenderComponent {...{ labelAlign: 'top' }} key={index} label={label}>
                    {renderData(datum) as string}
                  </RenderComponent>
                </View>
              );
            })}
          </>
        );
      }
    },
    [styles],
  );

  const handlerRenderV1 = useCallback((data: SignTypedDataObjectV1[]) => {
    return (
      <>
        {data.map((value, index) => {
          return (
            <MetaInfo.Default key={index} label={value.name} labelAlign="top" valueAlign="right">
              {value.value as string}
            </MetaInfo.Default>
          );
        })}
      </>
    );
  }, []);

  const handlerRenderContent = useCallback(() => {
    if (!rawData) {
      return null;
    }

    switch (type) {
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return <MetaInfo.Data label={i18n.common.rawData}>{renderData(rawData, true) as string}</MetaInfo.Data>;
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData':
        return (
          <MetaInfo.Data label={i18n.common.rawData}>
            {handlerRenderV1(rawData as unknown as SignTypedDataObjectV1[])}
          </MetaInfo.Data>
        );
      default:
        return <MetaInfo.Data label={i18n.common.message}>{renderData(rawData) as string}</MetaInfo.Data>;
    }
  }, [renderData, rawData, type, handlerRenderV1]);

  return (
    <MetaInfo>
      {signMethod && <MetaInfo.DisplayType label={i18n.common.signMethod} typeName={signMethod} />}
      {handlerRenderContent()}
    </MetaInfo>
  );
};

export default EvmMessageDetail;
