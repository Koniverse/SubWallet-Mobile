import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import { FieldBase } from 'components/Field/Base';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, Globe, ShareNetwork, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { completeConfirmation } from 'messaging/index';
import i18n from 'utils/i18n/i18n';

import createStyle from './styles';

interface Props {
  request: ConfirmationDefinitions['addNetworkRequest'][0];
}

const handleConfirm = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: true } as ConfirmationResult<null>);
};

const handleCancel = async ({ id }: ConfirmationDefinitions['addNetworkRequest'][0]) => {
  return await completeConfirmation('addNetworkRequest', { id, isApproved: false } as ConfirmationResult<null>);
};
const AddNetworkConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const {
    payload: { chainEditInfo, chainSpec, mode },
  } = request;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [loading, setLoading] = useState(false);

  // Handle buttons actions
  const onCancel = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleCancel(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const onApprove = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  return (
    <React.Fragment>
      <ConfirmationContent gap={theme.size}>
        <ConfirmationGeneralInfo request={request} gap={theme.size} />
        <Text style={styles.title}>{i18n.confirmation.addNetworkRequest}</Text>
        <View>
          <FieldBase>
            <View style={styles.textField}>
              <Icon iconColor={theme['gray-3']} size="md" phosphorIcon={ShareNetwork} />
              <Text style={styles.text}>
                {chainEditInfo.providers[chainEditInfo.currentProvider] || i18n.confirmation.providerUrl}
              </Text>
            </View>
          </FieldBase>
          <View style={styles.row}>
            <View style={styles.row1column1}>
              <FieldBase>
                <View style={styles.textField}>
                  <Icon iconColor={theme['gray-3']} size="md" phosphorIcon={Globe} />
                  <Text style={styles.text}>{chainEditInfo.name || i18n.common.network}</Text>
                </View>
              </FieldBase>
            </View>
            <View style={styles.row1column2}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text style={styles.text}>{chainEditInfo.symbol || i18n.common.symbol}</Text>
                </View>
              </FieldBase>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.row2column}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text style={styles.text}>{chainSpec?.decimals || i18n.common.decimals}</Text>
                </View>
              </FieldBase>
            </View>
            <View style={styles.row2column}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text style={styles.text}>{chainSpec?.evmChainId || i18n.confirmation.chainId}</Text>
                </View>
              </FieldBase>
            </View>
          </View>
          <FieldBase>
            <View style={styles.textField}>
              <Text style={styles.text}>{chainEditInfo.chainType || i18n.confirmation.chainType}</Text>
            </View>
          </FieldBase>
          <FieldBase>
            <View style={styles.textField}>
              <Text style={styles.text}>{chainEditInfo.blockExplorer || i18n.confirmation.blockExplorer}</Text>
            </View>
          </FieldBase>
          <FieldBase>
            <View style={styles.textField}>
              <Text style={styles.text}>{chainEditInfo.crowdloanUrl || i18n.confirmation.crowdloanURL}</Text>
            </View>
          </FieldBase>
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        <Button block={true} type="secondary" onPress={onCancel} icon={<Icon phosphorIcon={XCircle} weight="fill" />}>
          {i18n.common.cancel}
        </Button>
        <Button
          block={true}
          icon={<Icon phosphorIcon={CheckCircle} weight="fill" />}
          disabled={mode === 'update'}
          onPress={onApprove}
          loading={loading}>
          {i18n.buttonTitles.approve}
        </Button>
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default AddNetworkConfirmation;
