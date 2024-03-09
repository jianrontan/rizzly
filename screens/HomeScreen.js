import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, Image, Modal, Button, StyleSheet, SafeAreaView, TouchableOpacity, useWindowDimensions, FlatList, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove, query, where, startAfter, onSnapshot, orderBy, setDoc, limit } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';
import NoMoreUserScreen from './NoMoreUserScreen';
import { Feather } from '@expo/vector-icons';
import { haversineDistance } from '../screens/haversine';
import { useDispatch, useSelector } from 'react-redux';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { setLikes, setUnreadChatroomsCount } from '../redux/actions';
import Spinner from 'react-native-loading-spinner-overlay';

import { FONT, COLORS, SIZES, icons } from '../constants';

const width = Dimensions.get('window').width;
const cardWidth = width;
let cardHeight = 0;

const HomeScreen = () => {

    // DECLARE VARIABLES
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [swipedUpUsers, setSwipedUpUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [paused, setPaused] = useState(false);
    const [blockedIDs, setBlockedIDs] = useState([]);
    const [currentUserDislikes, setCurrentUserDislikes] = useState([]);
    const [currentUserLikes, setCurrentUserLikes] = useState([]);
    const [isMetric, setIsMetric] = useState(false);
    const [isMiles, setIsMiles] = useState(false);
    const [minHeight, setMinHeight] = useState(100);
    const [maxHeight, setMaxHeight] = useState(200);
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(80);
    const [minDistance, setMinDistance] = useState(1);
    const [maxDistance, setMaxDistance] = useState(10);
    const [contentHeight, setContentHeight] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [lastVisible, setLastVisible] = useState(null);

    const dispatch = useDispatch();
    // DECLARE VARIABLES

    // HEIGHT OF PAGE
    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        setContentHeight(height);
    }
    const availableSpace = contentHeight;
    cardHeight = availableSpace;
    // HEIGHT OF PAGE

    // SAVED FILTER DATA
    const fetchFilters = async () => {
        try {
            const filterDocRef = doc(db, 'filters', auth.currentUser.uid);
            const filterDocSnapshot = await getDoc(filterDocRef);

            if (filterDocSnapshot.exists()) {
                const filterData = filterDocSnapshot.data();
                setMinAge(filterData.minAge);
                setMaxAge(filterData.maxAge);
                setMinHeight(filterData.minHeight);
                setMaxHeight(filterData.maxHeight);
                setMinDistance(filterData.minDistance);
                setMaxDistance(filterData.maxDistance);
            } else {
                // If no filter settings document exists for the current user, use default values
                setMinAge(18);
                setMaxAge(80);
                setMinHeight(100);
                setMaxHeight(200);
                setMinDistance(1);
                setMaxDistance(10);
            }
        } catch (error) {
            console.error('Error fetching filter settings:', error);
        }
    };
    // SAVED FILTER DATA

    // USER UNIT PREFERENCES
    useFocusEffect(
        React.useCallback(() => {
            const fetchUnits = async () => {
                try {
                    const unitsDocRef = doc(db, 'units', auth.currentUser.uid);
                    const unitsDocSnapshot = await getDoc(unitsDocRef);

                    if (unitsDocSnapshot.exists()) {
                        const unitsData = unitsDocSnapshot.data();
                        setIsMetric(unitsData.isMetric);
                        setIsMiles(unitsData.isMiles);
                        console.log('Successfully retrieved units:', unitsData);
                    } else {
                        // If no units document exists for the current user, use default values
                        setIsMetric(false);
                        setIsMiles(false);
                    }
                } catch (error) {
                    console.error('Error fetching units:', error);
                }
            };

            fetchUnits();

            return () => {
            };
        }, [])
    );
    // USER UNIT PREFERENCES

    // FILTER CHECKS
    const isUserWithinRanges = (user) => {
        const userHeight = user.cmHeight;
        const userAge = user.age;

        // Check if the user's height falls within the height range
        if (userHeight < minHeight || userHeight > maxHeight) {
            return false;
        }

        if (userAge < minAge || userAge > maxAge) {
            return false;
        }

        // If the user passes all checks, they are within the ranges
        return true;
    };
    // FILTER CHECKS

    // OTHER FUNCTION
    // This is to update number of unread chats before users clicks matchesscreen
    useFocusEffect(
        React.useCallback(() => {
            const fetchUnreadChatsCount = async () => {
                const currentUser = auth.currentUser;
                const usersCollection = collection(db, 'profiles');

                // Query for documents where the 'likes' array contains the current user's ID
                const likesQuery = query(usersCollection, where('likes', 'array-contains', currentUser.uid));
                const likesSnapshot = await getDocs(likesQuery);
                const likesUsers = likesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                // Query for documents where the 'likedBy' array contains the current user's ID
                const likedByQuery = query(usersCollection, where('likedBy', 'array-contains', currentUser.uid));
                const likedBySnapshot = await getDocs(likedByQuery);
                const likedByUsers = likedBySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                // Combine the results locally
                const matchedUsers = likesUsers.filter((likeUser) =>
                    likedByUsers.some((likedByUser) => likedByUser.id === likeUser.id)
                );

                matchedUsers.forEach((match) => {
                    const chatRoomID = [currentUser.uid, match.id].sort().join('_');
                    const messagesCollection = collection(db, 'privatechatrooms', chatRoomID, 'messages');

                    let unreadCount = 0; // Add this line to initialize the counter

                    const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
                        const hasUnread = snapshot.docs.some((doc) => {
                            const messageData = doc.data();
                            // If the message is unread and was sent by another user, increment the counter
                            if (messageData.senderId !== currentUser.uid && !messageData.read) {
                                unreadCount++;
                            }
                            return messageData.senderId !== currentUser.uid && !messageData.read;
                        });

                        // Dispatch the count to your redux store
                        dispatch(setUnreadChatroomsCount(unreadCount));
                    });

                    // Clean up the listener when the component unmounts
                    return () => unsubscribe();
                });
            };

            fetchUnreadChatsCount();
        }, [dispatch])
    );
    // This is to update user like count before likesscreen is pressed
    useEffect(() => {
        const fetchInitialLikesCount = async () => {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDocSnapshot = await getDoc(currentUserDocRef);
            const currentUserData = currentUserDocSnapshot.data();
            const initialLikesCount = currentUserData?.likedBy?.length || 0;
            dispatch(setLikes(initialLikesCount));
        };

        fetchInitialLikesCount();
    }, [dispatch, auth.currentUser]);
    // OTHER FUNCTION

    // CURRENT USER DATA
    const fetchCurrentUser = async () => {
        setIsLoading(true);
        try {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDoc = await getDoc(currentUserDocRef);
            let blockedIDs = [];

            if (currentUserDoc.exists()) {
                const userData = currentUserDoc.data();
                blockedIDs = userData.blockedIDs || [];

                // Check if the pausedUser field is true
                const isUserPaused = userData.pausedUser === true;

                // Update the paused state based on the value of pausedUser field
                setPaused(isUserPaused);

                // Set other user data
                setCurrentUserData(userData);
            }
            setBlockedIDs(blockedIDs);
        } catch (error) {
            console.error('Error fetching current user data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCurrentUser();
    }, [auth.currentUser]);

    useFocusEffect(
        React.useCallback(() => {
            // Re-fetch current user data when the screen is focused
            fetchCurrentUser();
        }, [auth.currentUser])
    );

    // Use another useEffect to update the paused state when pausedUser changes
    useEffect(() => {
        // Check if the pausedUser field is true
        const isUserPaused = currentUserData?.pausedUser === true;

        // Update the paused state based on the value of pausedUser field
        setPaused(isUserPaused);
    }, [currentUserData]);

    const fetchCurrentUserDislikesLikes = async () => {
        try {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDoc = await getDoc(currentUserDocRef);

            if (currentUserDoc.exists()) {
                const userData = currentUserDoc.data();
                const dislikesArray = userData.dislikes || [];
                const likesArray = userData.likes || [];
                setCurrentUserDislikes(dislikesArray);
                setCurrentUserLikes(likesArray);
            }
        } catch (error) {
            console.error('Error fetching current user dislikes or dislikes:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUserDislikesLikes();
    }, [auth.currentUser]);
    // CURRENT USER DATA

    // FETCH PROFILE DATA
    const fetchData = async () => {

        console.log("FETCH DATA");

        setIsLoading(true);

        // Fetch filters
        await fetchFilters();

        // Clear users array and reset index if reset
        setUsers([]);
        setCurrentIndex(0);

        try {
            if (!currentUserData) {
                return;
            }
            // Grab a bunch of users limit to 50
            const usersCollection = collection(db, 'profiles');
            let q = query(usersCollection, orderBy('latitude'), limit(50));

            if (lastVisible) {
                q = query(usersCollection, orderBy('latitude'), startAfter(lastVisible), limit(50));
            }

            // Filter the users
            try {
                const snapshot = await getDocs(q);

                let usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                // Apply filter ranges
                let filteredUsers = usersData.filter(isUserWithinRanges);
                // Filter orientation
                filteredUsers = filteredUsers.filter((user) => {
                    const userGender = user.gender?.toLowerCase?.();
                    if (currentUserData.orientation) {
                        const { male, female, nonBinary } = currentUserData.orientation;
                        if (userGender === 'female' && female) {
                            return true;
                        } else if (userGender === 'male' && male) {
                            return true;
                        } else if (userGender === 'non-binary' && nonBinary) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return true;
                });
                // Filter distance
                filteredUsers = filteredUsers.filter((user) => {
                    const distance = haversineDistance(currentUserData.latitude, currentUserData.longitude, user.latitude, user.longitude);
                    return distance >= minDistance && distance <= maxDistance;
                });
                // Filter likes/ dislikes
                filteredUsers = filteredUsers.filter(
                    (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !blockedIDs.includes(user.id) && !currentUserLikes.includes(user.id) && !currentUserDislikes.includes(user.id)
                    // (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !blockedIDs.includes(user.id)
                    // (user) => user.id !== auth.currentUser.uid && !blockedIDs.includes(user.id)
                );
                // Filter blocked users
                filteredUsers = filteredUsers.filter(
                    (user) => !user.blockedIDs?.includes(auth.currentUser.uid)
                );

                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

                if (filteredUsers.length === 0) {
                    // If no one matches filter description
                    // console.log(`No users queried, retry number: ${retryCount}`)
                    // if (retryCount < 5) {
                    //     console.log(`Retry count: ${retryCount}, is less than 5`)
                    //     setRetryCount(currentRetryCount => currentRetryCount + 1);
                    //     console.log("Retry count + 1")
                    //     console.log(`retryCount updated to ${retryCount}`);
                    // } else {
                    //     setUsers([{ id: 'no-more-users' }]);
                    // }
                    setRetryCount(currentRetryCount => currentRetryCount + 1);
                } else {
                    // Set the users state
                    console.log(`set ${filteredUsers.length} queried users`)
                    setUsers([...filteredUsers]);
                    setUsers((prevUsers) => [...prevUsers, { id: 'last-user' }]);
                    setRetryCount(0);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            };
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (currentUserData) {
            debouncedFetchData();
        }
    }, [minAge, maxAge, minHeight, maxHeight, minDistance, maxDistance, currentUserData]);

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };

    const debouncedFetchData = debounce(fetchData, 500);
    // FETCH PROFILE DATA

    useEffect(() => {
        if (retryCount < 5 && retryCount > 0) {
            console.log(`Retrying fetch, retry count: ${retryCount}`);
            fetchData();
        } else if (retryCount >= 5) {
            setUsers([{ id: 'no-more-users' }]);
        }
    }, [retryCount])

    // LIKING AND DISLIKING
    const handleLikeClick = async (likedUserId) => {
        console.log(`handleLikeClick triggered with user ID: ${likedUserId}`);
        try {
            const likedUserDocRef = doc(db, 'profiles', likedUserId);

            await updateDoc(likedUserDocRef, {
                likedBy: arrayUnion(auth.currentUser.uid),
            });
            console.log(`Successfully updated liked user ${likedUserId}'s document.`);

            setSwipedUpUsers((prevSwipedUpUsers) => [...prevSwipedUpUsers, likedUserId]);

            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);

            await updateDoc(currentUserDocRef, {
                likes: arrayUnion(likedUserId),
            });
            console.log(`Successfully updated current user's document.`);

            setTimeout(async () => {
                await updateDoc(currentUserDocRef, {
                    dislikes: arrayRemove(likedUserId),
                });

                setSwipedUpUsers((prevSwipedUpUsers) => prevSwipedUpUsers.filter(userId => userId !== likedUserId));
            }, 100000000);
            setCurrentIndex((prevIndex) => prevIndex + 1);
        } catch (error) {
            console.error('Error adding like:', error);
        }
        if (currentIndex == users.length - 2) {
            console.log("re fetching more data")
            debouncedFetchData();
        }
    };

    const handleDislikeClick = async (dislikedUserId) => {
        console.log("called dislike");
        try {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);

            // Add the disliked user to the current user's document
            await updateDoc(currentUserDocRef, {
                dislikes: arrayUnion(dislikedUserId),
            });

            // Add the disliked user to the swipedUpUsers array
            setSwipedUpUsers((prevSwipedUpUsers) => [...prevSwipedUpUsers, dislikedUserId]);

            // After 10 seconds, remove the disliked user from the current user's document
            setTimeout(async () => {
                await updateDoc(currentUserDocRef, {
                    dislikes: arrayRemove(dislikedUserId),
                });

                // Also remove the disliked user from the swipedUpUsers array
                setSwipedUpUsers((prevSwipedUpUsers) => prevSwipedUpUsers.filter(userId => userId !== dislikedUserId));
            }, 100000000);
            setCurrentIndex((prevIndex) => prevIndex + 1);
        } catch (error) {
            console.error('Error adding dislike:', error);
        }
        if (currentIndex == users.length - 2) {
            console.log("re fetching more data")
            debouncedFetchData();
        }
    };
    // LIKING AND DISLIKING

    const pausedRender = (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', fontFamily: FONT.regular, padding: 5, fontSize: FONT.regular }}>
            <Text>Your profile is currently paused, that means that you cant see new matches and you will not be featured on other peoples screen</Text>
            <Text>To unpause, you can go back to pause account and turn the switch back to off </Text>
        </View>
    )

    // FILTERS


    const convertHeight = (cm) => {
        const inches = cm / 2.54;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);
        return `${feet}' ${remainingInches}"`;
    };

    const convertDistance = (km) => {
        const distanceInKm = Number(km);
        if (isNaN(distanceInKm)) {
            console.error('Invalid distance value:', km);
            return 'NaN'; // or handle the error in another appropriate way
        }
        const miles = distanceInKm * 0.621371;
        return miles.toFixed(2);
    };
    //FILTERS

    // USER CARD
    const renderItem = ({ item: user }) => {

        // When no users from the start
        if (user.id === 'no-more-users') {
            return (
                <View style={{ width: cardWidth, height: availableSpace }}>
                    <NoMoreUserScreen />
                </View>
            );
        }

        // When have users and run out
        if (user.id === 'last-user') {
            return;
        };

        const allImages = user.selfieURLs ? [user.selfieURLs, ...user.imageURLs] : user.imageURLs;

        return (
            <View>
                <View style={[styles.cardContainer, { width: cardWidth, height: availableSpace }]}>
                    <View style={{ flex: 1 }}>
                        <Swiper
                            dotStyle={{ width: 5, height: 5 }}
                            activeDotColor='white'
                            activeDotStyle={{ width: 5, height: 5 }}
                            scrollEnabled={true}
                            paginationStyle={{ bottom: availableSpace - (cardWidth * 4 / 3) + 5 }}
                            index={0}
                            loop={false}
                        >
                            {allImages.map((imageUrl, imageIndex) => (
                                <View key={imageIndex} style={{ height: availableSpace, width: cardWidth }}>
                                    <ImageZoom
                                        source={{ uri: imageUrl }}
                                        onLoad={() => { }}
                                        onError={(error) => console.log('Error loading image: ', error)}
                                        style={[styles.image, { bottom: (availableSpace - (cardWidth * 4 / 3)) / 2 + 1 }]}
                                    />
                                </View>
                            ))}
                        </Swiper>
                        <View style={[styles.userInfoContainer, { height: (availableSpace - (cardWidth * 4 / 3)) + 1 }]}>
                            <Text style={styles.userName}>{user.firstName + ' ' + user.lastName || 'No name'}</Text>
                            <Text style={styles.userDetails}>{`${user.gender || 'No gender'}, Age: ${user.age || 'No age'}, Height: ${isMetric ? convertHeight(user.cmHeight) + ' ft' : user.cmHeight + ' cm'}`}</Text>
                            <Text style={styles.userDetails}>Location: {user.location || 'No Location'} </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleLikeClick(user.id)} style={styles.likeButton}>
                    <Text style={styles.buttonTitle}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDislikeClick(user.id)} style={styles.dislikeButton}>
                    <Text style={styles.buttonTitle}>Dislike</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedUser(user);
                        setModalVisible(true);
                    }}
                    style={styles.arrowIcon}
                >
                    <Feather name="chevron-up" size={30} color="black" />
                </TouchableOpacity>
                <Modal animationType="slide" transparent={true} visible={modalVisible}>
                    <View style={[styles.modalContainer, { height: availableSpace }]}>
                        <View style={[styles.modalContent, { height: availableSpace }]}>
                            {selectedUser && (
                                <>
                                    <Text style={styles.modalinfo}>{selectedUser.firstName + ' ' + selectedUser.lastName || 'No name'}</Text>
                                    <Text style={styles.modalinfo}>{`${selectedUser.gender || 'No gender'}, Age: ${selectedUser.age || 'No age'}`}</Text>
                                    <Text style={styles.modalinfo}>Number of Selfie retakes: {selectedUser.retakes || 'No retakes'} </Text>
                                    <Text style={styles.modalinfo}>Bio: {selectedUser.bio || 'No bio'} </Text>
                                    <Text style={styles.modalinfo}>Location: {selectedUser.location || 'No location'}</Text>
                                    <Text style={styles.modalinfo}>Ethnicity: {selectedUser.ethnicity || 'No specified ethnicity'}</Text>
                                    <Text style={styles.modalinfo}>Religion: {selectedUser.religion || 'No specified religion'}</Text>
                                    <Text style={styles.modalinfo}>Children: {selectedUser.children || 'No info on children'}</Text>
                                    <Text style={styles.modalinfo}>Education: {selectedUser.education || 'No specified education'}</Text>
                                    <Text style={styles.modalinfo}>Occupation: {selectedUser.job || 'No specified occupation'}</Text>
                                    <Text style={styles.modalinfo}>Drinking: {selectedUser.alcohol || 'No info on alcohol'}</Text>
                                    <Text style={styles.modalinfo}>Smoking: {selectedUser.smoking || 'No info on smoking'}</Text>
                                    <Text style={styles.modalinfo}>Sex: {selectedUser.sex || 'No info on sex'}</Text>
                                    <Text style={styles.modalinfo}>
                                        Distance: ~{currentUserData && selectedUser && (isMiles ? convertDistance(haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude)) + ' miles' : haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude).toFixed(2) + ' km')}
                                    </Text>
                                </>
                            )}
                            <Button title="Close Modal" onPress={() => {
                                setModalVisible(false);
                                setSelectedUser(null);
                            }} />
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };
    // USER CARD

    useEffect(() => {
        console.log("retryCount: ", retryCount);
        console.log("Current Index: ", currentIndex);
        console.log("Users length: ", users.length);
    }, [currentIndex, users, retryCount]);

    // RENDER
    return (
        <SafeAreaView style={{ flex: 1 }} onLayout={onLayout}>
            <View style={styles.container}>
                {paused ? (
                    pausedRender
                ) : (
                    <>
                        {users.length > 0 && !isLoading && (
                            <FlatList
                                data={[users[currentIndex]]}
                                renderItem={renderItem}
                                keyExtractor={(user) => user.id}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </>
                )}

                <Spinner
                    visible={isLoading}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="black"
                    textContent='Loading...'
                    textStyle={{
                        fontFamily: FONT.bold,
                        fontSize: SIZES.medium,
                        fontWeight: 'normal',
                        color: 'black',
                    }}
                />
            </View>
        </SafeAreaView>
    );
    // RENDER
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    likeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },
    dislikeButton: {
        position: 'absolute',
        bottom: 20,
        right: 280,
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },
    cardContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'white', // Set the background color of the cards
    },
    image: {
        flex: 1,
        resizeMode: 'contain',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 10,
    },
    userName: {
        color: 'black',
        fontSize: 18,
        fontFamily: FONT.bold
    },
    userDetails: {
        color: 'black',
        fontSize: 16,
        fontFamily: FONT.medium
    },
    userAge: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: cardWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: cardWidth,
        padding: 20,
        alignItems: 'center',
    },
    arrowIcon: {
        position: 'absolute',
        bottom: 100,
        right: 20,
    },
    modalinfo: {
        color: 'black',
        fontSize: 16,
    },
    filterModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: cardHeight,
        width: cardWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'black',
        zIndex: 3, // Ensure filter modal container appears above everything
    },
    filterButton: {
        position: 'absolute',
        top: 10, // Adjust as needed
        right: 10, // Adjust as needed
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1, // Ensure filter button appears above the images
    },
    buttonTitle: {
        fontFamily: FONT.medium,
        color: 'white'
    },
    modalButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 4
    }
});

export default HomeScreen;
