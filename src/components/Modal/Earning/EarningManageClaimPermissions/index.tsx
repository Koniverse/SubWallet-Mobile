import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { TouchableOpacity, View } from 'react-native';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SET_CLAIM_PERMISSIONS } from 'constants/earning/EarningDataRaw';
import { getBannerButtonIcon } from 'utils/campaign';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { PalletNominationPoolsClaimPermission } from '@subwallet/extension-base/types';
import CustomAlertBox from 'components/design-system-ui/alert-box/custom';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onSubmit: (state: PalletNominationPoolsClaimPermission) => Promise<any>;
  onCancel?: () => void;
  currentMode: PalletNominationPoolsClaimPermission;
}

const SET_CLAIM_PERMISSIONS_LIST = Object.entries(SET_CLAIM_PERMISSIONS);

export const EarningManageClaimPermissions = ({
  modalVisible,
  setModalVisible,
  onSubmit,
  currentMode,
  onCancel,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [modeAutoClaim, setModeAutoClaim] = useState<PalletNominationPoolsClaimPermission>(currentMode);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setModeAutoClaim(currentMode);
  }, [currentMode]);

  const titleModeItem = useCallback(
    (mode: PalletNominationPoolsClaimPermission) => {
      if (mode === PalletNominationPoolsClaimPermission.PERMISSIONED) {
        return <></>;
      }

      return (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS, justifyContent: 'space-between' }}>
          <Typography.Text style={{ color: theme.colorWhite }}>{SET_CLAIM_PERMISSIONS[mode].title}</Typography.Text>
          {modeAutoClaim === mode && (
            <Icon iconColor={theme.colorSuccess} phosphorIcon={CheckCircle} size="sm" weight="fill" />
          )}
        </View>
      );
    },
    [modeAutoClaim, theme.colorSuccess, theme.colorWhite, theme.sizeXXS],
  );

  const onSelectAutoClaimMode = useCallback((key: string) => {
    setModeAutoClaim(key as PalletNominationPoolsClaimPermission);
  }, []);

  const _onCancel = useCallback(() => {
    onCancel && onCancel();
    setModalVisible(false);
  }, [onCancel, setModalVisible]);

  const onSubmitAutoClaimMode = useCallback(() => {
    setIsLoading(true);

    onSubmit(modeAutoClaim)
      .then(() => {
        setIsLoading(false);
      })
      .catch(error => console.log(error))
      .finally(() => setModalVisible(false));
  }, [modeAutoClaim, onSubmit, setModalVisible]);

  const footerNode = useMemo(
    () => (
      <View style={{ flexDirection: 'row', gap: theme.sizeSM, paddingTop: theme.padding }}>
        <Button
          block
          disabled={isLoading}
          onPress={_onCancel}
          icon={
            <Icon
              phosphorIcon={XCircle}
              weight={'fill'}
              iconColor={isLoading ? theme.colorTextLight4 : theme.colorWhite}
            />
          }
          type={'secondary'}>
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          loading={isLoading}
          block
          onPress={onSubmitAutoClaimMode}
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}>
          Submit
        </Button>
      </View>
    ),
    [_onCancel, isLoading, onSubmitAutoClaimMode, theme.colorTextLight4, theme.colorWhite, theme.padding, theme.sizeSM],
  );

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      footer={footerNode}
      onChangeModalVisible={onCancel}
      onBackButtonPress={onCancel}
      modalTitle={'Manage auto claim permission'}>
      <>
        <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4, paddingBottom: theme.padding }}>
          {
            'Select auto compound or auto withdraw to set auto claim permission for your nomination pool staking rewards'
          }
        </Typography.Text>
        <View style={{ gap: theme.sizeXS }}>
          {!!SET_CLAIM_PERMISSIONS_LIST.length &&
            SET_CLAIM_PERMISSIONS_LIST.map(([key, _props], index) => {
              return (
                <TouchableOpacity
                  key={`${_props.icon}-${index}`}
                  activeOpacity={BUTTON_ACTIVE_OPACITY}
                  onPress={() => onSelectAutoClaimMode(key)}>
                  <CustomAlertBox
                    icon={getBannerButtonIcon(_props.icon)}
                    bgIconColor={_props.iconColor}
                    iconColor={theme.colorWhite}
                    title={titleModeItem(key as PalletNominationPoolsClaimPermission)}
                    description={_props.description}
                  />
                </TouchableOpacity>
              );
            })}
        </View>
      </>
    </SwModal>
  );
};
