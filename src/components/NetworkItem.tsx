import React, {useState} from "react";
import {NetworkAndTokenItemContent} from "components/NetworkAndTokenItemContent";
import {TouchableOpacity} from "react-native";

export const NetworkItem = () => {
  const [isSelected, setSelected] = useState<boolean>(false);
  return (
    <TouchableOpacity>
      <NetworkAndTokenItemContent isSelected={isSelected} itemName={''} />
    </TouchableOpacity>
  );
};
