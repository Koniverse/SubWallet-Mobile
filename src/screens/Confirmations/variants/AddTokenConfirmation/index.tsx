import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent, ConfirmationGeneralInfo } from 'components/common/Confirmation';
import ConfirmationFooter from 'components/common/Confirmation/ConfirmationFooter';
import { Button, Icon } from 'components/design-system-ui';
import { FieldBase } from 'components/Field/Base';
import { TextField } from 'components/Field/Text';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, CopySimple, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { completeConfirmation } from 'messaging/index';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import Logo from '../../../../components/design-system-ui/logo';

import createStyle from './styles';
import { useSelector } from 'react-redux';
import { toShort } from 'utils/index';

interface Props {
  request: ConfirmationDefinitions['addTokenRequest'][0];
}

const handleConfirm = async ({ id }: ConfirmationDefinitions['addTokenRequest'][0]) => {
  return await completeConfirmation('addTokenRequest', { id, isApproved: true } as ConfirmationResult<boolean>);
};

const handleCancel = async ({ id }: ConfirmationDefinitions['addTokenRequest'][0]) => {
  return await completeConfirmation('addTokenRequest', { id, isApproved: false } as ConfirmationResult<boolean>);
};
const AddTokenConfirmation: React.FC<Props> = (props: Props) => {
  const { request } = props;
  const {
    payload: { contractAddress, decimals, originChain, slug, symbol, type },
  } = request;

  const theme = useSubWalletTheme().swThemes;
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

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
        <Text style={styles.title}>{i18n.confirmation.addTokenRequest}</Text>
        <View>
          <FieldBase>
            <View style={styles.textField}>
              <Logo size={theme.fontSizeXL} network={originChain} shape={'circle'} />
              <Text style={styles.text}>{chainInfoMap[originChain].name || i18n.common.network}</Text>
            </View>
          </FieldBase>
          <FieldBase>
            <View style={styles.textField}>
              <Text style={styles.text}>{type || i18n.confirmation.tokenType}</Text>
            </View>
          </FieldBase>
          <TextField icon={CopySimple} text={toShort(contractAddress) || i18n.confirmation.contractAddress} />
          <View style={styles.row}>
            <View style={styles.rowColumn}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text style={styles.text}>{symbol || i18n.common.symbol}</Text>
                </View>
              </FieldBase>
            </View>
            <View style={styles.rowColumn}>
              <FieldBase>
                <View style={styles.textField}>
                  <Text style={styles.text}>{decimals || i18n.common.decimals}</Text>
                </View>
              </FieldBase>
            </View>
          </View>
          {slug && <Text style={styles.warning}>{i18n.warningMessage.tokenExists}</Text>}
        </View>
      </ConfirmationContent>
      <ConfirmationFooter>
        <Button block={true} type="secondary" onPress={onCancel} icon={<Icon phosphorIcon={XCircle} weight="fill" />}>
          {i18n.common.cancel}
        </Button>
        <Button
          block={true}
          icon={<Icon phosphorIcon={CheckCircle} weight="fill" />}
          disabled={!!slug}
          onPress={onApprove}
          loading={loading}>
          {i18n.buttonTitles.approve}
        </Button>
      </ConfirmationFooter>
    </React.Fragment>
  );
};

export default AddTokenConfirmation;
