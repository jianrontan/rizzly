import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryTooltip, VictoryScatter, VictoryAxis } from 'victory-native';
import { doc, getDoc, toDate } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

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

  const fetchData = async () => {
    const userUid = auth.currentUser.uid;
    const docRef = doc(db, 'profiles', userUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const bloodSugarLevels = userData?.bloodSugarLevels || [];
      const timestamps = userData?.times || [];

      if (selectedFilter === "day") { // Check if the selected filter is "Today"
        // Filter timestamps to include only today's timestamps
        const today = new Date();
        const todayTimestamps = timestamps.filter(timestamp => {
          const date = timestamp.toDate();
          return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        });

        // Extract blood sugar levels corresponding to today's timestamps
        const todayBloodSugarLevels = todayTimestamps.map((timestamp, index) => bloodSugarLevels[index]);

        // Process data points for today
        const dataPoints = todayTimestamps.map((timestamp, index) => {
          const date = timestamp.toDate();
          const hour = date.getHours();
          const bloodGlucoseLevel = todayBloodSugarLevels[index];

          console.log('Timestamp:', timestamp, 'Blood Glucose Level:', bloodGlucoseLevel);

          return { x: hour, y: bloodGlucoseLevel };
        });

        setGroupedData(dataPoints);
      } else if (selectedFilter === "week") { // Fetch data for "This Week"
        // Filter timestamps to include only timestamps from this week
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1); // Start of the current week (Monday)
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7); // End of the current week (Sunday)

        const thisWeekTimestamps = timestamps.filter(timestamp => {
          const date = timestamp.toDate();
          return date >= startOfWeek && date <= endOfWeek;
        });

        // Extract blood sugar levels corresponding to this week's timestamps
        const thisWeekBloodSugarLevels = thisWeekTimestamps.map((timestamp, index) => bloodSugarLevels[index]);

        // Process data points for this week
        const dataPoints = thisWeekTimestamps.map((timestamp, index) => {
          const date = timestamp.toDate();
          const dayOfWeek = date.getDay(); // Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
          const bloodGlucoseLevel = thisWeekBloodSugarLevels[index];

          console.log('Timestamp:', timestamp, 'Blood Glucose Level:', bloodGlucoseLevel);

          return { x: dayOfWeek === 0 ? 7 : dayOfWeek, y: bloodGlucoseLevel }; // Convert Sunday (0) to 7 for plotting purposes
        });

        setGroupedData(dataPoints);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedFilter])
  );

  const renderGraph = () => {
    if (selectedFilter === "day") {
      // Render data for "Today"
      return (
        <VictoryChart
          containerComponent={<VictoryZoomContainer />}
          domain={{ y: [0, 25], x: [0, 24] }}
          style={styles.graph}
        >
          {groupedData.length > 0 && <VictoryLine data={groupedData} x="x" y="y" />}
          <VictoryAxis
            label="Hours"
            style={{
              axisLabel: { padding: 30 }
            }}
            tickFormat={(x) => {
              const hours = ((x % 24) + 24) % 24;
              const period = hours >= 12 ? 'pm' : 'am';
              const formattedHours = hours % 12 || 12;
              return `${formattedHours} ${period}`;
            }}
          />
          <VictoryAxis
            dependentAxis
            label="Blood Glucose Levels"
            style={{
              axisLabel: { padding: 30 }
            }}
          />
        </VictoryChart>
      );
    } else if (selectedFilter === "week") {
      // Render data for "This Week"
      return (
        <VictoryChart
          containerComponent={<VictoryZoomContainer />}
          domain={{ y: [0, 25], x: [1, 7] }} // Set x-axis domain for days of the week (1 to 7)
          style={styles.graph}
        >
          {groupedData.length > 0 && <VictoryLine data={groupedData} x="x" y="y" />}
          <VictoryAxis
            label="Day"
            tickFormat={(x) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][x - 1]}
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
        </VictoryChart>
      );
    } else if (selectedFilter === "month") {
      // Render data for "This Month"
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); // Get number of days in current month
      return (
        <VictoryChart
          containerComponent={<VictoryZoomContainer />}
          domain={{ y: [0, 25], x: [1, daysInMonth] }} // Set x-axis domain for days of the month (1 to number of days in month)
          style={styles.graph}
        >
          {groupedData.length > 0 && <VictoryLine data={groupedData} x="x" y="y" />}
          <VictoryAxis
            label="Days in a Month"
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
        </VictoryChart>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedFilter}
        onValueChange={(itemValue) => {
          setSelectedFilter(itemValue);
        }}
      >
        <Picker.Item label="Today" value="day" />
        <Picker.Item label="This Week" value="week" />
        <Picker.Item label="This Month" value="month" />
      </Picker>
      {renderGraph()}
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