import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { SelectItem } from 'components/SelectItem';
import { ColorMap } from 'styles/color';
import { Activity, Barricade, CirclesThreePlus, ListChecks, Trophy } from 'phosphor-react-native';
import { getLeftSelectItemIcon, getNetworkLogo } from 'utils/index';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl from 'hooks/screen/useFormControl';
import { FilterOptsType } from 'types/ui-types';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  filterOpts: FilterOptsType;
  onChangeFilterOpts: (data: FilterOptsType) => void;
}

interface FilterOptionType {
  label: string;
  icon: JSX.Element;
}

const crowdloanFilterLabelStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  ...FontMedium,
  paddingTop: 12,
  paddingBottom: 12,
};

const parachainFilterOptions: Record<string, FilterOptionType> = {
  all: {
    label: i18n.common.allParachains,
    icon: getLeftSelectItemIcon(CirclesThreePlus),
  },
  polkadot: {
    label: i18n.common.polkadotParachain,
    icon: getNetworkLogo('polkadot', 20),
  },
  kusama: {
    label: i18n.common.kusamaParachain,
    icon: getNetworkLogo('kusama', 20),
  },
};

const crowdloanStatusFilterOptions: Record<string, FilterOptionType> = {
  all: {
    label: i18n.common.allProjects,
    icon: getLeftSelectItemIcon(ListChecks),
  },
  completed: {
    label: i18n.common.win,
    icon: getLeftSelectItemIcon(Trophy),
  },
  fail: {
    label: i18n.common.fail,
    icon: getLeftSelectItemIcon(Barricade),
  },
  ongoing: {
    label: i18n.common.active,
    icon: getLeftSelectItemIcon(Activity),
  },
};

const crowdloanFilterConfig = {
  paraChain: {
    name: i18n.common.parachain,
    value: 'all',
  },
  crowdloanStatus: {
    name: i18n.common.crowdloanStatus,
    value: 'all',
  },
};

export const CrowdloanFilter = ({ modalVisible, onChangeModalVisible, filterOpts, onChangeFilterOpts }: Props) => {
  const { formState, onChangeValue } = useFormControl(crowdloanFilterConfig, {});

  const onPressBack = () => {
    onChangeValue('paraChain')(filterOpts.paraChain);
    onChangeValue('crowdloanStatus')(filterOpts.crowdloanStatus);
    onChangeModalVisible();
  };

  const onApplyChange = () => {
    onChangeFilterOpts({ ...formState.data });
    onChangeModalVisible();
  };

  return (
    <SubWalletFullSizeModal
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      modalStyle={{ paddingTop: 0 }}>
      <ContainerWithSubHeader title={i18n.title.filters} onPressBack={onPressBack} style={{ flex: 1, width: '100%' }}>
        <View style={{ ...sharedStyles.layoutContainer }}>
          <View style={{ flex: 1 }}>
            <Text style={crowdloanFilterLabelStyle}>{formState.labels.paraChain}</Text>
            {Object.keys(parachainFilterOptions).map(opt => (
              <SelectItem
                key={opt}
                label={parachainFilterOptions[opt].label}
                isSelected={opt === formState.data.paraChain}
                onPress={() => onChangeValue('paraChain')(opt)}
                showSeparator={false}
                leftIcon={parachainFilterOptions[opt].icon}
              />
            ))}

            <Text style={crowdloanFilterLabelStyle}>{formState.labels.crowdloanStatus}</Text>
            {Object.keys(crowdloanStatusFilterOptions).map(opt => (
              <SelectItem
                key={opt}
                label={crowdloanStatusFilterOptions[opt].label}
                isSelected={opt === formState.data.crowdloanStatus}
                onPress={() => onChangeValue('crowdloanStatus')(opt)}
                showSeparator={false}
                leftIcon={crowdloanStatusFilterOptions[opt].icon}
              />
            ))}
          </View>

          <SubmitButton
            title={i18n.buttonTitles.apply}
            style={{ ...MarginBottomForSubmitButton }}
            onPress={onApplyChange}
          />
        </View>
      </ContainerWithSubHeader>
    </SubWalletFullSizeModal>
  );
};
