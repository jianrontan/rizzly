import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryTooltip, VictoryScatter, VictoryAxis } from 'victory-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const auth = getAuth();

const GraphScreen = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("day");
  const [timestamps, setTimestamps] = useState([]);
  const [bloodSugarLevels, setBloodSugarLevels] = useState([]);

  const getWeekNumber = (d) => {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
  }

  let date = new Date();
  console.log(getWeekNumber(date));

  const filterData = (filterType) => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(currentDate);
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const filteredTimestamps = timestamps.filter(timestamp => {
      const date = new Date(timestamp);
      return date >= startOfWeek && date <= endOfWeek;
    });
    const filteredBloodGlucoseLevels = filteredTimestamps.map(timestamp => {
      const index = bloodSugarLevels.indexOf(timestamp);
      return bloodSugarLevels[index];
    });

    const filteredData = filteredTimestamps.map((timestamp, index) => ({
      timestamp,
      bloodGlucoseLevel: filteredBloodGlucoseLevels[index],
    }));

    return filteredData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const userUid = auth.currentUser.uid;
      const docRef = doc(db, 'profiles', userUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('User Data:', userData);
        const bloodSugarLevels = userData?.bloodSugarLevels || [];
        const timestamps = userData?.times || [];
        console.log('Blood Sugar Levels:', bloodSugarLevels);
        console.log('Timestamps:', timestamps);

        setTimestamps(timestamps);
        setBloodSugarLevels(bloodSugarLevels);

        const groupedData = timestamps.reduce((acc, timestamp, index) => {
          const timestampInSeconds = timestamp.seconds; // Extract seconds from timestamp
          const timestampInMillis = timestampInSeconds * 1000; // Convert seconds to milliseconds
          const date = new Date(timestampInMillis); // Create Date object using milliseconds
          const hour = date.getHours().toString(); // Convert hour to string
          const bloodGlucoseLevel = bloodSugarLevels[index];
          console.log('Hour:', hour);
          console.log('Blood Glucose Level:', bloodGlucoseLevel);
          if (!acc[hour]) {
            acc[hour] = {
              bloodGlucoseLevels: [],
              count: 0,
            };
          }
          acc[hour].bloodGlucoseLevels.push(bloodGlucoseLevel);
          acc[hour].count += 1;
          return acc;
        }, {});

        setGroupedData(Object.values(groupedData));
        console.log('Grouped Data:', Object.values(groupedData));
      }
      console.log('Grouped Data:', groupedData);
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedFilter}
        onValueChange={(itemValue) => {
          setSelectedFilter(itemValue);
          setGroupedData(filterData(itemValue));
        }}
      >
        <Picker.Item label="Today" value="day" />
        <Picker.Item label="This Week" value="week" />
        <Picker.Item label="This Month" value="month" />
      </Picker>
      <VictoryChart
        containerComponent={<VictoryZoomContainer />}
        domain={{ y: [0, 25] }}
        style={styles.graph}
      >
        <VictoryAxis
          label="Time"
          tickFormat={(x) => `${x}:00`} // Format the tick labels
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Blood Glucose Levels"
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryLine
          data={groupedData.flatMap((hourData, hour) =>
            hourData.bloodGlucoseLevels.map((bloodGlucoseLevel) => ({
              x: hour, // Use hourIndex as x-value
              y: bloodGlucoseLevel,
            }))
          )}
        />
        <VictoryScatter
          data={groupedData.flatMap((hourData, hour) =>
            hourData.bloodGlucoseLevels.map((bloodGlucoseLevel) => ({
              x: hour,
              y: bloodGlucoseLevel,
              label: `${bloodGlucoseLevel} mg/dl` // Add this line
            }))
          )}
          labels={({ datum }) => `Blood Glucose Level: ${datum.y} mg/dl`} // Add this line
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  graph: {
    width: width,
    height: height,
  },
});

export default GraphScreen;
