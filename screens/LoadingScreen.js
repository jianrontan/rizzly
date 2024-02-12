import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const LoadingScreen = ({ navigation }) => {
    const animationRef = useRef(null);

    useEffect(() => {
        animationRef.current?.play();

        // Stop the animation when the component unmounts
        return () => {
            animationRef.current?.reset();
        };
    }, []);

    return (
        <View style={styles.container}>
            <LottieView
                ref={animationRef}
                source={require('../constants/walking bear.json')}
                loop
                autoPlay
                style={styles.lottie}
            />
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
    lottie: {
        width: width,
        height: height,
    },
});

export default LoadingScreen;
