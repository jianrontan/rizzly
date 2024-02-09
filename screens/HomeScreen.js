import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, Modal, Button, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';
import { Swipeable } from 'react-native-gesture-handler';
import NoMoreUserScreen from './NoMoreUserScreen';
import { Feather } from '@expo/vector-icons';
import { haversineDistance } from '../screens/haversine';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, setUnreadChatroomsCount } from '../redux/actions';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

const { width, height } = Dimensions.get('window');
const cardWidth = width;
const cardHeight = height - 170;

const HomeScreen = () => {
    const [users, setUsers] = useState([]);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [swipedUpUsers, setSwipedUpUsers] = useState([]);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0)
    const [paused, setPaused] = useState(false);
    const [noMoreUsers, setNoMoreUsers] = useState(false);
    const [blockedIDs, setBlockedIDs] = useState([]);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);
    const [isMetric, setIsMetric] = useState(false);
    const [isMiles, setIsMiles] = useState(false);
    const [minHeight, setMinHeight] = useState(100); // Default minimum height
    const [maxHeight, setMaxHeight] = useState(200); // Default maximum height
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(80);
    const [minDistance, setMinDistance] = useState(1);
    const [maxDistance, setMaxDistance] = useState(10);
    const [currentUserDislikes, setCurrentUserDislikes] = useState([]);

    useEffect(() => {
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

                    // Log the success message here
                    console.log('Successfully retrieved filter data:', filterData);
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

        fetchFilters();
    }, []);

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

            // Cleanup function
            return () => {
                // You can perform any cleanup here if needed
            };
        }, []) // Empty dependency array means this effect runs only once when the component mounts
    );

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

    const fetchCurrentUserDislikes = async () => {
        try {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDoc = await getDoc(currentUserDocRef);

            if (currentUserDoc.exists()) {
                const userData = currentUserDoc.data();
                const dislikesArray = userData.dislikes || [];
                setCurrentUserDislikes(dislikesArray);
            }
        } catch (error) {
            console.error('Error fetching current user dislikes:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUserDislikes();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);
            const currentUserDoc = await getDoc(currentUserDocRef);
            let blockedIDs = [];

            if (currentUserDoc.exists()) {
                const userData = currentUserDoc.data();
                blockedIDs = userData.blockedIDs || [];

                // Calculate user's age based on current date and birthdate
                const currentDate = new Date();
                const birthdateParts = userData.birthday.split('/');
                const birthDay = parseInt(birthdateParts[0], 10) - 1; // Month is 0-indexed
                const birthMonth = parseInt(birthdateParts[1], 10);
                const birthYear = parseInt(birthdateParts[2], 10);
                const birthdate = new Date(birthYear, birthMonth, birthDay);

                let userAge = currentDate.getFullYear() - birthdate.getFullYear();
                if (
                    currentDate.getMonth() >= birthdate.getMonth() ||
                    (currentDate.getMonth() === birthdate.getMonth() && currentDate.getDate() < birthdate.getDate())
                ) {
                    // If current date is before the birthdate, decrement the age
                    userAge++;
                }

                // Update age field in the Firestore document if necessary
                if (currentDate >= birthdate && userAge !== userData.age) {
                    await updateDoc(currentUserDocRef, {
                        age: userAge,
                    });
                }

                // Set other user data
                setCurrentUserData(userData);
            }
            setBlockedIDs(blockedIDs);
        } catch (error) {
            console.error('Error fetching current user data:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // Re-fetch current user data when the screen is focused
            fetchCurrentUser();
        }, [])
    );

    // Use another useEffect to update the paused state when pausedUser changes
    useEffect(() => {
        // Check if the pausedUser field is true
        const isUserPaused = currentUserData?.pausedUser === true;

        // Update the paused state based on the value of pausedUser field
        setPaused(isUserPaused);
    }, [currentUserData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (!currentUserData) {
                // Handle the case where currentUserData is null
                return;
            }

            const usersCollection = collection(db, 'profiles');
            const snapshot = await getDocs(usersCollection);
            let usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Filter users based on the ranges set by the user in the modal
            let filteredUsers = usersData.filter(isUserWithinRanges);

            // Filter users based on gender and current user's orientation
            filteredUsers = filteredUsers.filter((user) => {
                const userGender = user.gender?.toLowerCase?.();

                if (currentUserData.orientation) {
                    const { male, female, nonBinary } = currentUserData.orientation;

                    if (userGender === 'female' && female) {
                        return true;
                    } else if (userGender === 'male' && male) {
                        return true;
                    } else if (userGender === 'nonbinary' && nonBinary) {
                        return true;
                    } else {
                        return false;
                    }
                }

                return true;
            });

            // Calculate distance for each user and filter based on distance range
            filteredUsers = filteredUsers.filter((user) => {
                const distance = haversineDistance(currentUserData.latitude, currentUserData.longitude, user.latitude, user.longitude);
                return distance >= minDistance && distance <= maxDistance;
            });

            // Exclude the current user, swiped up users, and users present in dislikes array from the list
            filteredUsers = filteredUsers.filter(
                (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !currentUserDislikes.includes(user.id) && !blockedIDs.includes(user.id)
            );

            // Exclude users who have blocked the current user
            filteredUsers = filteredUsers.filter(
                (user) => !user.blockedIDs?.includes(auth.currentUser.uid)
            );

            // Limit the number of users to render to the first 10
            filteredUsers = filteredUsers.slice(0, 10);

            if (filteredUsers.length === 0) {
                setNoMoreUsers(true);
            } else {
                setNoMoreUsers(false);
            }

            // Always include the "No More Users" item at the end of the users array
            setUsers([...filteredUsers]);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, [currentUserData]);


    const handleLikeClick = async (likedUserId) => {
        try {
            const likedUserDocRef = doc(db, 'profiles', likedUserId);

            await updateDoc(likedUserDocRef, {
                likedBy: arrayUnion(auth.currentUser.uid),
            });

            const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);

            await updateDoc(currentUserDocRef, {
                likes: arrayUnion(likedUserId),
            });

            // Remove the liked user from the users array
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== likedUserId));
        } catch (error) {
            console.error('Error adding like:', error);
        }
        if (!swipedUpUsers.includes(likedUserId)) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== likedUserId));
        }
    };

    const handleDislikeClick = async (dislikedUserId) => {
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
            }, 3000000);
        } catch (error) {
            console.error('Error adding dislike:', error);
        }
        if (!swipedUpUsers.includes(dislikedUserId)) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== dislikedUserId));
        }
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // Check if the user is scrolling back up
        if (offsetY < scrollOffset) {
            // Scroll back up detected, set the scroll position back to the previous value
            // This prevents scrolling back up
            flatListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
            return;
        }

        // Calculate the current index based on the scroll offset
        const newIndex = Math.round((offsetY / cardHeight) - 1);

        // If the current index is greater than the previous index, it means the user has swiped to the next user
        if (newIndex > currentIndex) {
            const dislikedUserId = users[currentIndex]?.id;

            // Only call handleDislikeClick if the user hasn't been swiped up yet
            if (dislikedUserId && !swipedUpUsers.includes(dislikedUserId)) {
                handleDislikeClick(dislikedUserId);
            }
        }

        // Update the previous index and scroll offset
        setCurrentIndex(newIndex);
        setScrollOffset(offsetY); // Update the scroll offset
    };

    const pausedRender = (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Your profile is currently paused, that means that you cant see new matches and you will not be featured on other peoples screen</Text>
            <Text>To unpause, you can go back to pause account and turn the switch back to off </Text>
        </View>
    )

    const renderModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => {
                    setFilterModalVisible(!filterModalVisible);
                }}
            >
                <View style={styles.filterModalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.sliderLabel}>Height Range</Text>
                        <MultiSlider
                            values={[minHeight, maxHeight]}
                            sliderLength={300}
                            min={100}
                            max={250}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                            onValuesChange={(values) => {
                                setMinHeight(values[0]);
                                setMaxHeight(values[1]);
                            }}
                        />
                        <Text style={styles.sliderValue}>
                            {isMetric ? `${convertHeight(minHeight)} - ${convertHeight(maxHeight)} ft` : `${minHeight} - ${maxHeight} cm`}
                        </Text>
                        <Text style={styles.sliderLabel}>Age Range</Text>
                        <MultiSlider
                            values={[minAge, maxAge]}
                            sliderLength={200}
                            min={18}
                            max={100}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                            onValuesChange={(values) => {
                                setMinAge(values[0]);
                                setMaxAge(values[1]);
                            }}
                        />
                        <Text style={styles.sliderValue}>Between {minAge} and {maxAge} years old</Text>
                        <Text style={styles.sliderLabel}>Distance Range</Text>
                        <MultiSlider
                            values={[minDistance, maxDistance]}
                            sliderLength={200}
                            min={1}
                            max={50}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                            onValuesChange={(values) => {
                                setMinDistance(values[0]);
                                setMaxDistance(values[1]);
                            }}
                        />
                        <Text style={styles.sliderValue}>
                            {isMiles ? `~ ${convertDistance(minDistance).toFixed(2)} - ${convertDistance(maxDistance).toFixed(2)} miles away` : `~ ${minDistance.toFixed(2)} - ${maxDistance.toFixed(2)} km away`}
                        </Text>
                        <Button title="Apply Filter" onPress={() => {
                            setFilterModalVisible(false);
                            saveFilters(auth.currentUser.uid, minAge, maxAge, minDistance, maxDistance, minHeight, maxHeight);
                            fetchData(); // Refresh the users list
                        }} />
                    </View>
                </View>
            </Modal>
        );
    };

    const saveFilters = async (uid, minAge, maxAge, minDistance, maxDistance, minHeight, maxHeight) => {
        try {
            const minHeightCm = isMetric ? minHeight : convertHeightToCm(minHeight);
            const maxHeightCm = isMetric ? maxHeight : convertHeightToCm(maxHeight);

            // Get a reference to the 'filters' collection and the specific document using the user's UID
            const filterDocRef = doc(db, 'filters', uid);

            // Set the filter data for the document
            await setDoc(filterDocRef, {
                minAge: minAge,
                maxAge: maxAge,
                minDistance: minDistance,
                maxDistance: maxDistance,
                minHeight: minHeightCm, // Save height as centimeters
                maxHeight: maxHeightCm, // Save height as centimeters
            });

            console.log(`Filter settings saved for user ${uid}.`);
        } catch (error) {
            console.error(`Failed to save filter settings for user ${uid}:`, error);
        }
    };

    const convertHeight = (cm) => {
        const inches = cm / 2.54;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);
        return `${feet}' ${remainingInches}"`;
    };

    const convertHeightToCm = (ft) => {
        const cm = ft * 30.48; // 1 foot = 30.48 cm
        return cm.toFixed(2);
    };

    const convertDistance = (km) => {
        const miles = km * 0.621371;
        return miles;
    };

    const renderItem = ({ item: user }) => {
        if (users.length === 0) {
            return (
                <View style={{ width: cardWidth, height: cardHeight }}>
                    <NoMoreUserScreen />
                </View>
            );
        }

        const allImages = user.selfieURLs ? [user.selfieURLs, ...user.imageURLs] : user.imageURLs;
        console.log(`Displaying user with ID: ${user.id}`);

        return (
            <Swipeable>
                <View style={styles.cardContainer}>
                    <Swiper
                        style={[styles.swiper]}
                        index={0}
                        loop={false}
                    >
                        {allImages.map((imageUrl, imageIndex) => (
                            <View key={imageIndex} style={{ flex: 1 }}>
                                <ImageZoom
                                    uri={imageUrl}
                                    minScale={0.5}
                                    maxScale={3}
                                    resizeMode="cover"
                                />
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.userName}>{user.firstName + ' ' + user.lastName || 'No name'}</Text>
                                    <Text style={styles.userDetails}>{`${user.gender || 'No gender'}, Age: ${user.age || 'No age'}`}</Text>
                                    <Text style={styles.userDetails}>Number of retakes: {user.retakes || 'No retakes'} </Text>
                                    <Text style={styles.userDetails}>Location: {user.location || 'No Location'} </Text>
                                    <Text style={styles.userDetails}>Height: {isMetric ? convertHeight(user.cmHeight) + ' ft' : user.cmHeight + ' cm'}</Text>
                                    <TouchableOpacity onPress={() => handleLikeClick(user.id)}>
                                        <Text style={styles.likeButton}>Like</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </Swiper>
                    {/* TouchableOpacity for filter modal button */}
                    <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
                        <Feather name="chevron-down" size={30} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        setSelectedUser(user); // Pass the user object directly
                        setModalVisible(true);
                    }}>
                        <Feather name="chevron-up" size={30} color="white" style={styles.arrowIcon} />
                    </TouchableOpacity>
                    <Modal animationType="slide" transparent={true} visible={modalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {selectedUser && (
                                    <>
                                        <Text style={styles.modalinfo}>{selectedUser.firstName + ' ' + selectedUser.lastName || 'No name'}</Text>
                                        <Text style={styles.modalinfo}>{`${selectedUser.gender || 'No gender'}, Age: ${selectedUser.age || 'No age'}`}</Text>
                                        <Text style={styles.modalinfo}>Number of retakes: {selectedUser.retakes || 'No retakes'} </Text>
                                        <Text style={styles.modalinfo}>Bio: {selectedUser.bio || 'No bio'} </Text>
                                        <Text style={styles.modalinfo}>Location: {selectedUser.location || 'No location'}</Text>
                                        <Text style={styles.modalinfo}>Ethnicity: {selectedUser.ethnicity || 'No specified ethnicity'}</Text>
                                        <Text style={styles.modalinfo}>Religion: {selectedUser.religion || 'No specified religion'}</Text>
                                        <Text style={styles.modalinfo}>
                                            Distance: ~{currentUserData && selectedUser && (isMiles ? convertDistance(haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude)).toFixed(2) + ' miles' : haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude).toFixed(2) + ' km')}
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
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator />
            ) : noMoreUsers ? (
                <NoMoreUserScreen />
            ) : (
                paused ? (
                    pausedRender
                ) : (
                    <>
                        <FlatList
                            ref={flatListRef}
                            data={users}
                            keyExtractor={(user) => user.id}
                            renderItem={renderItem}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            onEndReached={() => {
                                if (users[users.length - 1]?.id !== 'no-more-users') {
                                    setUsers((prevUsers) => [...prevUsers, { id: 'no-more-users' }]);
                                }
                            }}
                            onEndReachedThreshold={0}
                            pagingEnabled
                            showsVerticalScrollIndicator={false}
                            alwaysBounceVertical={false}
                        />
                        {renderModal()}
                    </>
                )
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    likeButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        color: 'white',
    },

    swiperItem: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'white', // Set the background color of the cards
        width: cardWidth,
        height: cardHeight,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
    },
    userInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userDetails: {
        color: 'white',
        fontSize: 16,
    },
    userAge: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: cardHeight,
        width: cardWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        height: cardHeight,
        width: cardWidth,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    arrowIcon: {
        position: 'absolute',
        bottom: 20,
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
});

export default HomeScreen;
