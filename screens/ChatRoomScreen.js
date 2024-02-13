import React, { useEffect, useState, useRef } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
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
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170;

const ChatRoom = ({ route }) => {
  const { chatRoomID, userId, userName, navigation } = route.params;
  const [messages, setMessages] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [firstMessageSent, setFirstMessageSent] = useState(false);
  const dispatch = useDispatch();

  const goToReport = () => {
    navigation.navigate('Report');
  };

  const openCamera = () => {
    setShowCamera(!showCamera);
    if (!showCamera) {
      setShowChat(false);
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setShowChat(true);
  };

  const flipCamera = () => {
    setType(type === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back);
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
        (snapshot) => { },
        (error) => {
          console.error('Error uploading photo', error)
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

  useFocusEffect(
    React.useCallback(() => {
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
            read: data.read, // Include the read field
          };
        });

        setMessages(newMessages);

        // If there are any messages in the chatroom, set firstMessageSent to true
        if (newMessages.length > 0) {
          setFirstMessageSent(true);
        }

        // Check for unread messages and dispatch the action
        const hasUnread = newMessages.some(
          (message) => message.user._id !== auth.currentUser.uid && !message.read
        );
      });

      return () => {
        unsubscribe();
      };
    }, [chatRoomID, dispatch])
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'denied') {
        // Handle the case where permission has been denied
        alert('Permission to access camera was denied.');
      } else {
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const sendTextMessage = async (text) => {
    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

    await addDoc(messagesCollection, {
      content: text,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser.uid,
      user: {
        name: auth.currentUser.displayName,
      },
      timestamp: new Date(),
      read: false,
    });

    setFirstMessageSent(true);
  };

  const sendImageMessage = async (imageUrl) => {
    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

    await addDoc(messagesCollection, {
      image: imageUrl,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser.uid,
      user: {
        name: auth.currentUser.displayName,
      },
      timestamp: new Date(),
      read: false,
    });

    setFirstMessageSent(true);
  };

  const onSend = async (newMessages = []) => {
    newMessages.forEach(async (message) => {
      if (message.text) {
        await sendTextMessage(message.text);
      } else if (message.image) {
        await sendImageMessage(message.image);
      }
    });

    // Clear the text input
    // Assuming you are using the default gifted-chat component, you can do:
    setMessages((previousMessages) => GiftedChat.append(previousMessages, []));
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
    const imageUrl = await uploadPhoto(photoUri);

    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

    await addDoc(messagesCollection, {
      image: imageUrl,
      createdAt: serverTimestamp(),
      senderId: auth.currentUser.uid,
      user: {
        name: auth.currentUser.displayName,
      },
      timestamp: new Date(),
    });

    // Close the camera after sending the photo
    closeCamera();
  };

  return (
    <>
      {!firstMessageSent && (
        < View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text>Start chatting...</Text>
        </View>
      )}
      {showCamera && (
        <View style={{ flex: 1 }}>
          <Camera style={{ width: cardWidth, height: cardHeight }} type={type} ref={cameraRef}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                right: 15,
                zIndex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 15,
                padding: 10,
              }}
              onPress={closeCamera}>
              <Icon name="times" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                left: 15,
                zIndex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 15,
                padding: 10,
              }}
              onPress={flipCamera}>
              <Icon name="exchange" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 50,
                left: '40%',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                backgroundColor: '#fff',
                borderRadius: 100,
              }}
              onPress={!isCapturing ? sendPhoto : undefined}>
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
      )}
      <StatusBar style="auto"></StatusBar>
      {showChat && (
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
      )}
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
          backgroundColor: alignment === 'right' ? 'black' : 'white',
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
          backgroundColor: 'black',
          alignItems: 'flex-end', // Align text to the right
          justifyContent: 'flex-start', // Align text to the top
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
          backgroundColor: 'white',
          left:-40,
          
        },
      }}
      textStyle={{
        left: {
          color: 'black',
        },
      }}
    />
  );
};

export default ChatRoom;
