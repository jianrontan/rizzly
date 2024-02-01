import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine } from 'victory-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

const GraphScreen = () => {
 const [groupedData, setGroupedData] = useState([]);

 useEffect(() => {
    const fetchData = async () => {
      const userUid = auth.currentUser.uid;
      const docRef = doc(db, 'profiles', userUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const bloodSugarLevels = userData?.bloodSugarLevels || [];
        const timestamps = userData?.times || [];

        // Group the data
        const groupedData = timestamps.reduce((acc, timestamp, index) => {
          const hour = new Date(timestamp).getHours();
          const bloodGlucoseLevel = bloodSugarLevels[index];
          if (!acc[hour]) {
            acc[hour] = {
              bloodGlucoseLevels: [],
              count: 0
            };
          }
          acc[hour].bloodGlucoseLevels.push(bloodGlucoseLevel);
          acc[hour].count += 1;
          return acc;
        }, {});

        setGroupedData(Object.values(groupedData));
      }
    };

    fetchData();
 }, []);

 return (
    <VictoryChart>
      <VictoryLine
        data={groupedData.flatMap((hourData, hourIndex) => {
          return hourData.bloodGlucoseLevels.map((bloodGlucoseLevel, dataIndex) => ({
            x: hourIndex + dataIndex / hourData.bloodGlucoseLevels.length,
            y: bloodGlucoseLevel,
          }));
        })}
      />
    </VictoryChart>
 );
};

export default GraphScreen;
