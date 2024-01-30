import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, Button, TouchableOpacity, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const LabReportScreen = () => {
  const [labReports, setLabReports] = useState([
    { id: '1', name: 'HbA1c', value: '', range: [4, 6] },
    { id: '2', name: 'Creatinine', value: '', range: [54, 101] },
    { id: '3', name: 'CKD', value: '', range: [90, 150] },
    { id: '4', name: 'Thyroid', value: '', range: [0.65, 3.7] },
    { id: '5', name: 'Thyroxine', value: '', range: [8.8, 14.4] },
    { id: '6', name: 'Alanine', value: '', range: [6, 66] },
    { id: '7', name: 'Triglycerides', value: '', range: [0, 1.7] },
    { id: '8', name: 'Cholesterol HDL', value: '', range: [1, 3] },
    // Add more lab reports as needed
  ]);

  //Modal 
  const [modalVisible, setModalVisible] = useState(false);
  const [contmodalVisible, setcontModalVisible] = useState(false);
  const openModal = () => {
    setModalVisible(true);
  };
  const opencontModal = () => {
    setcontModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const closecontModal = () => {
    setcontModalVisible(false);
  };

  const checkRange = (value, lowerLimit, upperLimit) => {
    if (value >= lowerLimit && value <= upperLimit) return 'green';
    else return '#CCCC00';
  }

  const Item = ({ item }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{item.name}:</Text>
      <TextInput
        style={[styles.input, { color: checkRange(item.value, ...item.range) }]}
        value={item.value}
        onChangeText={text => setLabReports(labReports.map(report => report.id === item.id ? { ...report, value: text } : report))}
        keyboardType="decimal-pad"
      />
      <Text style={styles.description}>Enter your {item.name} level</Text>
    </View>
  );

  return (
    <View style={styles.container}>
       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={styles.title}>Lab Report Levels</Text>
         <TouchableOpacity onPress={openModal}>
           <Text style={styles.infoIcon}>ℹ️</Text>
         </TouchableOpacity>
       </View>
       <Modal
         animationType="slide"
         transparent={true}
         visible={modalVisible}
         onRequestClose={closeModal}
       >
         <View style={styles.centeredView}>
           <View style={styles.modalView}>
             <Text style={styles.modalText}> These lab reports are not definitive and high levels do not mean a trip to the AnE. However, its good to keep the ranges in green for your health.</Text>
             <Text style={styles.modalText}>
               <Text style={{ color: 'green' }}>Green</Text>
               <Text> means good, </Text>
               <Text style={{ color: 'yellow' }}>yellow</Text>
               <Text> means bad, and </Text>
               <Text style={{ color: 'red' }}>red</Text>
               <Text> means critical. DO ask your doctor for clarification.</Text>
             </Text>
             <Button title="Close" onPress={closeModal} />
           </View>
         </View>
       </Modal>
       <FlatList
         data={labReports}
         keyExtractor={item => item.id}
         renderItem={({ item }) => <Item item={item} />}
         showsVerticalScrollIndicator={false}
       />
       <Button title="Info on Lab Reports" onPress={opencontModal} />
       <Modal
         animationType='slide'
         transparent={true}
         visible={contmodalVisible}
         onRequestClose={closecontModal}
       >
         <View style={styles.centeredView}>
           <View style={styles.modalView}>
             <Text style={styles.modalText}>
               HBA1c measures the average blood glucosde levels over the past 2-3 months, reflecting how well your diabetes is being managed.
             </Text>
             <Text style={styles.modalText}>
               Renal Panel with CKD-EPI eGFR assesses kidney functions to help detect kidney diseases and current health condition of the patient.
             </Text>
             <Text style={styles.modalText}>
               Thyroid panel evaluates thyroid function which can help diagnose thyroid disorders which can affect metabolism and other bodily functions.
             </Text>
             <Text style={styles.modalText}>
               Creatinine ratio also assesses kidney functions through waste product (creatinine) in urine. It can be used to measure early signs of kidney damage.
             </Text>
             <Text style={styles.modalText}>
               Lipid panel evaluates lipid levels, hence checking for risk of cardiovascular (heart) diseases and conditions
             </Text>
             <Text style={styles.modalText}>
               Alanine trasnsaminase is an enzyme found in the liver. This is to measure liver damage or inflammation.
             </Text>
             <Text style={styles.modalText}>
               All the tests here are used to weigh the possible consequences of uncontrolled diabetes as well as early sign detection.
             </Text>
             <Button title="Close" onPress={closecontModal} />
           </View>
         </View>
       </Modal>
    </View>
   );   
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  infoIcon: {
    fontSize: 20,
    marginLeft: 10, // Adjust the icon's position as needed
    marginTop: 0,
  },
  input: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
    fontSize: 20,
   },   
  description: {
    fontSize: 14,
    color: 'gray',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default LabReportScreen;
