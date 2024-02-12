import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function Loading() {
    const animationRef = React.useRef(null);

    useEffect(() => {
        animationRef.current?.reset();
        setTimeout(() => {
            animationRef.current?.play();
        }, 100);
    }, []);

    return (
        <View style={styles.container}>
            <LottieView
                ref={animationRef}
                source={require('../assets/walkingBear.json')} // Update the path to your Lottie file
                loop
                style={styles.animation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animation: {
        width: 400, // Set explicit width
        height: 400, // Set explicit height
    },
});
