import React, { useEffect, useState, useRef } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, storage } from '../firebase/firebase';
import { Camera } from 'expo-camera';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Composer, Send } from 'react-native-gifted-chat';
import { StatusBar } from 'expo-status-bar'

const ChatRoom = ({ route }) => {
 const { chatRoomID, userId, userName } = route.params;
 const [messages, setMessages] = useState([]);
 const [hasPermission, setHasPermission] = useState(null);
 const [type, setType] = useState(Camera.Constants.Type.back);
 const cameraRef = useRef(null);
 const [showCamera, setShowCamera] = useState(false);
 const [isCapturing, setIsCapturing] = useState(false);
 const openCamera = () => {
  setShowCamera(true);
};

const closeCamera = () => {
  setShowCamera(false);
};

const uploadPhoto = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageId = Math.random().toString(36).substring(7); // Generate a random ID for the image
  const storageRef = ref(storage, `chat_image/${imageId}`); // Use ref function to create storage reference
  const uploadTask = uploadBytesResumable(storageRef, blob);
 
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
 };
 

const CustomInputToolbar = (props) => {
   return (
     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
       <Composer {...props} />
       <Send {...props} />
       <TouchableOpacity onPress={openCamera}>
         <Icon name="camera" size={30} color="#000" />
       </TouchableOpacity>
     </View>
   );
 };
 
 useEffect(() => {
  const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');
  const messagesQuery = query(messagesCollection, orderBy('createdAt'));
 
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const newMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data.content,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        user: {
          _id: data.senderId,
          name: data.user.name,
        },
        image: data.image, // Include the image field
      };
    });
 
    setMessages(newMessages);
  });
 
  return () => {
    unsubscribe();
  };
 }, [chatRoomID]); 

 useEffect(() => {
   (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
     setHasPermission(status === 'granted');
   })();
 }, []);

 const onSend = async (newMessages = []) => {
   const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

   newMessages.forEach(async (message) => {
     await addDoc(messagesCollection, {
       content: message.text,
       createdAt: serverTimestamp(),
       senderId: auth.currentUser.uid,
       user: {
         name: auth.currentUser.displayName,
       },
       // Add the current timestamp when the message is sent
       timestamp: new Date(),
     });
   });
 };

 const capturePhoto = async () => {
  if (cameraRef.current && !isCapturing) {
    setIsCapturing(true);
    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    setIsCapturing(false);
    return photo.uri;
  }
 }; 

 const sendPhoto = async () => {
  const photoUri = await capturePhoto();
  const imageUrl = await uploadPhoto(photoUri); // Get the image URL from the upload function
  
  const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');
  
  await addDoc(messagesCollection, {
    image: imageUrl, // Save the image URL in Firestore
    createdAt: serverTimestamp(),
    senderId: auth.currentUser.uid,
    user: {
      name: auth.currentUser.displayName,
    },
    timestamp: new Date(),
  });
 };
 
 
 return (
  <>
    {showCamera ? (
 <View style={{ flex: 1, backgroundColor: 'black' }}>
  <Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
     <TouchableOpacity
       style={{
         flex: 0.1,
         alignSelf: 'flex-end',
         alignItems: 'center',
       }}
       onPress={closeCamera}>
       <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> {'Close Camera'} </Text>
     </TouchableOpacity>
              <TouchableOpacity
          style={{
            width: 130,
            borderRadius: 4,
            backgroundColor: '#14274e',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 40,
            position: 'absolute',
            bottom: 50,
            alignSelf: 'center',
          }}
          onPress={!isCapturing ? sendPhoto : undefined}
          >
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Take picture
          </Text>
          </TouchableOpacity>
        </Camera>
   </View>
) : null}
    <StatusBar style="auto"></StatusBar>
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: auth.currentUser.uid,
      }}
      inverted={false}
      renderBubble={(props) => {
        if (props.currentMessage.image) {
          return <BubbleImage {...props} />;
        } else if (props.currentMessage.user._id === auth.currentUser.uid) {
          return <BubbleRight {...props} />;
        }
        return <BubbleLeft {...props} />;
       }}       
      renderInputToolbar={(props) => <CustomInputToolbar {...props} />}
      />
  </>
);
    }
    const BubbleImage = (props) => {
      const alignment = props.currentMessage.user._id === auth.currentUser.uid ? 'right' : 'left';
      
      return (
       <Bubble
         {...props}
         wrapperStyle={{
           [alignment]: {
             backgroundColor: alignment === 'right' ? 'blue' : 'green',
           },
         }}
       >
         <Image
           style={{ width: 100, height: 100 }}
           source={{ uri: props.currentMessage.image }}
         />
         <Text>{props.currentMessage.text}</Text>
       </Bubble>
      );
     };
     
const BubbleRight = (props) => {
 return (
   <Bubble
     {...props}
     wrapperStyle={{
       right: {
         backgroundColor: 'blue',
       },
     }}
   />
 );
};

const BubbleLeft = (props) => {
 return (
   <Bubble
     {...props}
     wrapperStyle={{
       left: {
         backgroundColor: 'green',
       },
     }}
   />
 );
};

export default ChatRoom;
