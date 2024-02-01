import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const CorrectionScreen = () => {
  const [currentBloodSugar, setCurrentBloodSugar] = useState('');
  const [targetBloodSugar, setTargetBloodSugar] = useState('');
  const [isf, setISF] = useState('');
  const [correctionInsulinDose, setCorrectionInsulinDose] = useState('');
  const [fetchingISF, setFetchingISF] = useState(false);

  useEffect(() => {
    if (fetchingISF) {
      fetchPreviousISF();
    }
  }, [fetchingISF]);

  const fetchPreviousISF = async () => {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, 'profiles', userId);

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.ISF) {
          setISF(userData.ISF);
        } else {
          console.warn('No previous ISF value recorded. Try calculating it in Sensitivity calculator.');
        }
      } else {
        console.warn('No previous ISF value recorded. Try calculating it in Sensitivity calculator.');
      }
    } catch (error) {
      console.error('Error fetching ISF:', error);
    }

    setFetchingISF(false);
  };

  const calculateISF = () => {
    setFetchingISF(true);
  };

  const calculateCorrectionInsulinDose = () => {
    if (currentBloodSugar && targetBloodSugar && isf) {
      const correctionDose =
        (parseFloat(currentBloodSugar) - parseFloat(targetBloodSugar)) / parseFloat(isf);
      setCorrectionInsulinDose(correctionDose.toFixed(2));
    } else {
      setCorrectionInsulinDose('');
    }
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Correcting high blood glucose levels</Text>

        {/* Text input for ISF */}
        <TextInput
          style={styles.input}
          placeholder="Enter your Insulin Sensitivity Factor (ISF) (mg/dL per unit)"
          keyboardType="numeric"
          value={isf}
          onChangeText={(text) => setISF(text)}
        />

        {/* Button to fetch previous ISF */}
        <Button title="Fetch previous ISF" onPress={calculateISF} />

        {isf !== '' && <Text style={styles.result}>ISF: {isf} mg/dL per unit</Text>}

        <Text style={styles.subtitle}>Calculate Correction Insulin Dose</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Blood Sugar (mg/dL)"
          keyboardType="numeric"
          value={currentBloodSugar}
          onChangeText={(text) => setCurrentBloodSugar(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Blood Sugar (mg/dL)"
          keyboardType="numeric"
          value={targetBloodSugar}
          onChangeText={(text) => setTargetBloodSugar(text)}
        />
        <Button title="Calculate Correction Insulin Dose" onPress={calculateCorrectionInsulinDose} />
        {correctionInsulinDose !== '' && (
          <Text style={styles.result}>Correction Insulin Dose: {correctionInsulinDose} units</Text>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default CorrectionScreen;
