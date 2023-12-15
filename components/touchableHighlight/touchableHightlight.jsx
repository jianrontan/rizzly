import React, { useCallback, useState, useEffect } from 'react';
import {View, Text, TouchableHighlight} from 'react-native';

// Make it so that the Options light up accordingly to what the user set in ProfileScreen.js
const OptionButton = ({ id, text, onPress, selected }) => {
  const [isSelected, setIsSelected] = useState(selected);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  const buttonBackgroundColor = isSelected ? '#1DA1F2' : '#FFFFFF00';
  const buttonTextColor = isSelected ? '#FFFFFF' : '#1DA1F2';
 
  const onSelect = useCallback(() => {
    setIsSelected(prevState => !prevState);
    onPress?.(id, !isSelected);
  }, [id, onPress, isSelected]);
 
  return (
     <View>
         <TouchableHighlight
         style={{backgroundColor: buttonBackgroundColor}}
         onPress={onSelect}
         underlayColor='#65898D33'
         >
             <Text style={{ color: buttonTextColor }}>{text}</Text>
         </TouchableHighlight>
     </View>
  );
 };

export default React.memo(OptionButton);