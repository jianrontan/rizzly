import React, { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { TouchableOpacity, Image } from 'react-native'

import { setHasUnsavedChangesExport, setViewProfileChanges, setAboutMeChanges } from '../../redux/actions'
import styles from './screenheader.style'

const DrawerBackBtn = ({ iconUrl, dimension, onPress }) => {
	const navigation = useNavigation();
	const dispatch = useDispatch();

	const aboutMeChangesVal = useSelector(state => state.editProfileReducer.aboutMeChangesVal);
	const aboutMeChangesRef = useRef(false);

	const viewProfileChangesVal = useSelector(state => state.editProfileReducer.viewProfileChangesVal);
	const viewProfileChangesRef = useRef(false);

	useEffect(() => {
		aboutMeChangesRef.current = aboutMeChangesVal;
	}, [aboutMeChangesVal]);

	useEffect(() => {
		viewProfileChangesRef.current = viewProfileChangesVal;
	}, [viewProfileChangesVal]);

	const handlePress = () => {
		if (viewProfileChangesRef.current || aboutMeChangesRef.current) {
			Alert.alert("Discard changes?", "You have unsaved changes. Are you sure you want to discard them?", [
				{ text: "Don't leave", style: 'cancel', onPress: () => { } },
				{
					text: 'Discard',
					style: 'destructive',
					onPress: () => {
						dispatch(setHasUnsavedChangesExport(false));
						dispatch(setViewProfileChanges(false));
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
			navigation.navigate('Edit Profile');
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