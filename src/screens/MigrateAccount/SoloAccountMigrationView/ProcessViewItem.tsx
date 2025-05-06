import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoloAccountToBeMigrated } from '@subwallet/extension-base/background/KoniTypes';
import { VoidFunction } from 'types/index';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';
import { validateAccountName } from 'messaging/accounts';
import { SoloAccountToBeMigratedItem } from 'screens/MigrateAccount/SoloAccountMigrationView/SoloAccountToBeMigratedItem';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountProxyType } from '@subwallet/extension-base/types';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

interface Props {
  currentProcessOrdinal: number;
  totalProcessSteps: number;
  currentSoloAccountToBeMigratedGroup: SoloAccountToBeMigrated[];
  onSkip: VoidFunction;
  onApprove: (soloAccounts: SoloAccountToBeMigrated[], accountName: string) => Promise<void>;
}

export const ProcessViewItem = ({
  currentProcessOrdinal,
  totalProcessSteps,
  currentSoloAccountToBeMigratedGroup,
  onSkip,
  onApprove,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyle(theme, insets), [insets, theme]);
  const timeOutRef = useRef<NodeJS.Timeout>();
  const [loading, setLoading] = useState(false);

  const validatorFunc = useCallback(async (value: string) => {
    let result: string[] = [];

    if (!value.trim()) {
      result = ['This field is required'];
    } else {
      try {
        const { isValid } = await validateAccountName({ name: value.trim() });
        if (!isValid) {
          result = ['Account name already in use'];
        }
      } catch {
        result = ['Account name invalid'];
      }
    }

    return result;
  }, []);

  const formConfig = useMemo(
    (): FormControlConfig => ({
      accountName: {
        name: i18n.common.accountName,
        value: '',
        require: true,
      },
    }),
    [],
  );

  const _onApprove = useCallback(
    (formState: FormState) => {
      const doApprove = () => {
        setLoading(true);

        onApprove(currentSoloAccountToBeMigratedGroup, formState.data.accountName.trim())
          .catch(console.error)
          .finally(() => {
            setLoading(false);
          });
      };

      validatorFunc(formState.data.accountName).then(() => {
        doApprove();
      });
    },
    [currentSoloAccountToBeMigratedGroup, onApprove, validatorFunc],
  );

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: _onApprove,
  });

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    if (amount) {
      if (formState.data.accountName) {
        setLoading(true);
        timeOutRef.current = setTimeout(() => {
          validatorFunc(formState.data.accountName)
            .then(res => {
              onUpdateErrors('accountName')(res);
            })
            .catch((error: Error) => console.log('error validate name', error.message))
            .finally(() => {
              if (amount) {
                setLoading(false);
              }
            });
        }, 500);
      } else {
        setLoading(false);
      }
    }

    return () => {
      amount = false;
    };
  }, [formState.data.accountName, onUpdateErrors, validatorFunc]);

  const headerContent = useMemo(() => {
    return `Accounts migrated: ${currentProcessOrdinal}/${totalProcessSteps}`;
  }, [currentProcessOrdinal, totalProcessSteps]);

  const onChangeAccountName = (value: string) => {
    onChangeValue('accountName')(value);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Typography.Text size={'lg'} style={styles.headerText}>
            {headerContent}
          </Typography.Text>
        </View>

        <View style={{ gap: theme.padding }}>
          <Typography.Text style={styles.subHeaderText}>
            {'Enter a name for this unified account to complete the migration'}
          </Typography.Text>

          <View>
            <Typography.Text style={styles.labelText}>{'Migrate from'}</Typography.Text>
            {currentSoloAccountToBeMigratedGroup.map(account => (
              <SoloAccountToBeMigratedItem key={account.address} {...account} />
            ))}
          </View>

          <View>
            <Typography.Text style={styles.labelText}>{'To'}</Typography.Text>

            <EditAccountInputText
              ref={formState.refs.accountName}
              label={formState.labels.accountName}
              editAccountInputStyle={{ marginBottom: theme.marginXS, paddingBottom: theme.paddingXS }}
              value={formState.data.accountName}
              onChangeText={onChangeAccountName}
              onSubmitField={
                formState.data.accountName && !formState.errors.accountName.length
                  ? onSubmitField('accountName')
                  : Keyboard.dismiss
              }
              accountType={AccountProxyType.UNIFIED}
              placeholder={'Enter the account name'}
              placeholderTextColor={theme.colorTextTertiary}
              errorMessages={formState.errors.accountName}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          block
          disabled={loading}
          onPress={onSkip}
          type={'secondary'}
          icon={
            <Icon
              phosphorIcon={XCircle}
              iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
              weight={'fill'}
            />
          }>
          {'Skip'}
        </Button>
        <Button
          block
          disabled={loading || !!formState.errors.accountName.length}
          onPress={() => _onApprove(formState)}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              iconColor={loading || !!formState.errors.accountName.length ? theme.colorTextLight5 : theme.colorWhite}
              weight={'fill'}
            />
          }>
          {i18n.buttonTitles.approve}
        </Button>
      </View>
    </View>
  );
};

function createStyle(theme: ThemeTypes, insets: EdgeInsets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingHorizontal: theme.padding,
      backgroundColor: theme.colorBgDefault,
    },
    header: { paddingVertical: theme.paddingXS - 2, marginBottom: theme.marginLG },
    headerText: { color: theme.colorWhite, textAlign: 'center', ...FontSemiBold },
    subHeaderText: { color: theme.colorTextTertiary, textAlign: 'center' },
    labelText: {
      color: theme.colorTextTertiary,
      paddingBottom: theme.paddingXS,
      ...FontSemiBold,
    },
    footer: { flexDirection: 'row', gap: theme.size, paddingBottom: theme.padding },
  });
}
