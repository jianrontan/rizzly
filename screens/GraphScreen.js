import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const userId = auth.currentUser.uid;

const GraphScreen = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'profiles', userId); 
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Extract blood glucose levels and timestamps from userData
          const bloodGlucoseLevels = userData.bloodSugarLevels || [];
          const timestamps = userData.times || [];
          console.log("Blood Glucose Levels:", bloodGlucoseLevels);
          console.log("Timestamps:", timestamps);
          // Format data for chart library
          const chartData = {
            labels: timestamps.map(timestamp => timestamp.toDate().toLocaleTimeString()), // Format timestamp as desired
            datasets: [
              {
                data: bloodGlucoseLevels,
              },
            ],
          };
          console.log("Chart Data:", chartData);
          setData(chartData);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Glucose Levels Over Time</Text>
      <View style={styles.chartContainer}>
        {data.labels && data.datasets && (
          <LineChart
            data={data}
            width={350}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
          />
        )}
      </View>
    </View>
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
  chartContainer: {
    alignItems: 'center',
  },
});

export default GraphScreen;
