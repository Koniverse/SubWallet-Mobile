import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon } from 'components/design-system-ui';
import { PasswordField } from 'components/Field/Password';
import useFormControl from 'hooks/screen/useFormControl';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import i18n from 'utils/i18n/i18n';
import { keyringUnlock } from 'messaging/index';

type Props = {};

const Login: React.FC<Props> = (props: Props) => {
  const {} = props;
  const theme = useSubWalletTheme().swThemes;
  const [loading, setLoading] = useState<boolean>(false);
  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
      require: true,
    },
  };

  const onSubmit = () => {
    const password = formState.data.password;
    setLoading(true);
    setTimeout(() => {
      keyringUnlock({
        password,
      })
        .then(data => {
          if (!data.status) {
            onUpdateErrors('password')([i18n.errorMessage.invalidMasterPassword]);
          }
        })
        .catch((e: Error) => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const { formState, onChangeValue, onSubmitField, focus, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const isDisabled = useMemo(() => {
    return loading || !formState.data.password || formState.errors.password.length > 0;
  }, [formState.data.password, formState.errors.password.length, loading]);

  useEffect(() => {
    focus('password')();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContainerWithSubHeader showLeftBtn={false} title={i18n.title.login}>
      <PasswordField
        ref={formState.refs.password}
        label={formState.labels.password}
        defaultValue={formState.data.password}
        onChangeText={value => onChangeValue('password')(value)}
        errorMessages={formState.errors.password}
        onSubmitField={onSubmitField('password')}
      />
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
        <Button
          loading={loading}
          disabled={isDisabled}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'lg'}
              weight={'fill'}
              iconColor={loading || !formState.data.password ? theme.colorTextLight5 : theme.colorTextLight1}
            />
          }
          onPress={onSubmit}>
          {i18n.buttonTitles.apply}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default Login;
