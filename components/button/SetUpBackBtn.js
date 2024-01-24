import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation, CommonActions, getFocusedRouteNameFromRoute, useRoute } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { TouchableOpacity, Image } from 'react-native'

import { setHasUnsavedChangesExport } from '../../redux/actions'
import styles from './screenheader.style'

const SetUpBackBtn = ({ iconUrl, dimension, onPress }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const route = useRoute();

    const hasUnsavedChangesExportVal = useSelector(state => state.editProfileReducer.hasUnsavedChangesExportVal);
    const hasUnsavedChangesExportRef = useRef(false);

    useEffect(() => {
        hasUnsavedChangesExportRef.current = hasUnsavedChangesExportVal;
    }, [hasUnsavedChangesExportVal]);

    const handlePress = () => {
        if (hasUnsavedChangesExportRef.current) {
            Alert.alert("Discard changes?", "You have unsaved changes. Are you sure you want to discard them?", [
                { text: "Don't leave", style: 'cancel', onPress: () => { } },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(setHasUnsavedChangesExport(false));
                        navigation.dispatch(
                            navigation.goBack()
                        );
                    },
                },
            ]);
        } else {
            navigation.dispatch(
                navigation.goBack()
            );
        };
    };

    return (
        <TouchableOpacity style={styles.btnContainer} onPress={handlePress}>
            <Image
                source={iconUrl}
                resizeMode="cover"
                style={styles.btnImg(dimension)}
            />
        </TouchableOpacity>
    )
}

export default SetUpBackBtn;
