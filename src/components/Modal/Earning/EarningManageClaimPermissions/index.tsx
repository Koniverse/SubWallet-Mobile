import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { TouchableOpacity, View } from 'react-native';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { PalletNominationPoolsClaimPermission } from 'screens/Transaction/Earn';
import { SET_CLAIM_PERMISSIONS } from 'constants/earning/EarningDataRaw';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { getBannerButtonIcon } from 'utils/campaign';

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onSubmit: (state: PalletNominationPoolsClaimPermission) => Promise<any>;
  currentMode: PalletNominationPoolsClaimPermission;
}

const SET_CLAIM_PERMISSIONS_LIST = Object.entries(SET_CLAIM_PERMISSIONS);

export const EarningManageClaimPermissions = ({ modalVisible, setModalVisible, onSubmit, currentMode }: Props) => {
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
        <View>
          <View>{SET_CLAIM_PERMISSIONS[mode].title}</View>
          {modeAutoClaim === mode && (
            <Icon iconColor={theme.colorSuccess} phosphorIcon={CheckCircle} size="sm" weight="fill" />
          )}
        </View>
      );
    },
    [modeAutoClaim, theme.colorSuccess],
  );

  const onSelectAutoClaimMode = useCallback((key: string) => {
    setModeAutoClaim(key as PalletNominationPoolsClaimPermission);
  }, []);

  const onCancel = useCallback(() => setModalVisible(false), [setModalVisible]);

  const onSubmitAutoClaimMode = useCallback(() => {
    setIsLoading(true);

    if (modeAutoClaim !== currentMode) {
      onSubmit(modeAutoClaim)
        .then(() => {
          setIsLoading(false);
        })
        .catch(error => console.log(error))
        .finally(() => setModalVisible(false));
    } else {
      setIsLoading(false);
      setModalVisible(false);
    }
  }, [currentMode, modeAutoClaim, onSubmit, setModalVisible]);

  const footerNode = useMemo(
    () => (
      <View style={{ flexDirection: 'row', gap: theme.sizeSM, paddingTop: theme.padding }}>
        <Button
          block
          loading={isLoading}
          onPress={onCancel}
          icon={<Icon phosphorIcon={XCircle} weight={'fill'} />}
          type={'secondary'}>
          Cancel
        </Button>
        <Button
          loading={isLoading}
          block
          onPress={onSubmitAutoClaimMode}
          icon={<Icon phosphorIcon={CheckCircle} weight={'fill'} />}>
          Apply
        </Button>
      </View>
    ),
    [isLoading, onCancel, onSubmitAutoClaimMode, theme.padding, theme.sizeSM],
  );

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      footer={footerNode}
      modalTitle={'Manage auto claim permission'}>
      <>
        {!!SET_CLAIM_PERMISSIONS_LIST.length &&
          SET_CLAIM_PERMISSIONS_LIST.map(([key, _props], index) => {
            return (
              <TouchableOpacity onPress={() => onSelectAutoClaimMode(key)}>
                <AlertBoxBase
                  key={`${_props.icon}-${index}`}
                  icon={getBannerButtonIcon(_props.icon)}
                  iconColor={_props.iconColor}
                  title={titleModeItem(key as PalletNominationPoolsClaimPermission)}
                  description={_props.description}
                />
              </TouchableOpacity>
            );
          })}
      </>
    </SwModal>
  );
};
