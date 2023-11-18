import React, {useCallback, useState} from 'react';
import {View, Text, TouchableHighlight} from 'react-native';

const OptionButton = ({ id, text, onPress }) => {
 const [selected, setSelected] = useState(false);
 const buttonBackgroundColor = selected ? '#1DA1F2' : '#FFFFFF00';
 const buttonTextColor = selected ? '#FFFFFF' : '#1DA1F2';

 const onSelect = useCallback(() => {
   setSelected(prevState => !prevState);
   onPress?.(id, !selected);
 }, [id, onPress, selected]);

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
