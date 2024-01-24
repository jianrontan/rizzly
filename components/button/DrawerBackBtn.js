import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation, CommonActions, getFocusedRouteNameFromRoute, useRoute } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { TouchableOpacity, Image } from 'react-native'

import { setHasUnsavedChangesExport, setViewProfileChanges, setAboutMeChanges } from '../../redux/actions'
import styles from './screenheader.style'

const DrawerBackBtn = ({ iconUrl, dimension, onPress }) => {
	const navigation = useNavigation();
	const dispatch = useDispatch();
	const route = useRoute();

	const hasUnsavedChangesExportVal = useSelector(state => state.editProfileReducer.hasUnsavedChangesExportVal);
	const hasUnsavedChangesExportRef = useRef(false);

	const aboutMeChangesVal = useSelector(state => state.editProfileReducer.aboutMeChangesVal);
	const aboutMeChangesRef = useRef(false);

	const viewProfileChangesVal = useSelector(state => state.editProfileReducer.viewProfileChangesVal);
	const viewProfileChangesRef = useRef(false);

	useEffect(() => {
		hasUnsavedChangesExportRef.current = hasUnsavedChangesExportVal;
	}, [hasUnsavedChangesExportVal]);

	useEffect(() => {
		aboutMeChangesRef.current = aboutMeChangesVal;
	}, [aboutMeChangesVal]);

	useEffect(() => {
		viewProfileChangesRef.current = viewProfileChangesVal;
	}, [viewProfileChangesVal]);

	const handlePress = () => {
		if (viewProfileChangesRef.current || aboutMeChangesRef.current || hasUnsavedChangesExportRef.current) {
			Alert.alert("Discard changes?", "You have unsaved changes. Are you sure you want to discard them?", [
				{ text: "Don't leave", style: 'cancel', onPress: () => { } },
				{
					text: 'Discard',
					style: 'destructive',
					onPress: () => {
						dispatch(setHasUnsavedChangesExport(false));
						dispatch(setViewProfileChanges(false));
						dispatch(setAboutMeChanges(false));
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: 'Edit Profile' }],
							})
						);
					},
				},
			]);
		} else {
			if (route.name === 'Edit Profile') {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'App' }],
					})
				);
			} else {
				// For other screens, use the default behavior (go back)
				if (navigation.canGoBack()) {
					navigation.goBack();
				} else {
					navigation.navigate('App');
				}
			}
		}
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

export default DrawerBackBtn;