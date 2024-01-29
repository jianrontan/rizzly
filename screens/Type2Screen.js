import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Type2Screen = () => {
    const navigation = useNavigation();

    const navigateToPrevention2 = () => {
        navigation.navigate('Insulin');
    };
    return (
        <View style={styles.container}>
            <Text>Type 2 Diabetes Screen</Text>
            <Text> Welcome to the Type 2 diabetes screen, Type 2 diabetes is mainly due to either</Text>
            <Text>1. Cells in muscle,fat and liver becoming resistant to insulin, hence the cells do not take in enough sugar, leading to unprecedented rise in blood sugar levels</Text>
            <Text>2. The pancreas cannot make enough insulin to keep blood sugar levels within healthy range</Text>
            <TouchableOpacity onPress={navigatetoInsulin}>
                <Text>Click here to learn more about insulin </Text>
            </TouchableOpacity>
            {/* Add your content here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default Type2Screen;
