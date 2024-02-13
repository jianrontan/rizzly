import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, Image, Modal, Button, StyleSheet, SafeAreaView, TouchableOpacity, useWindowDimensions, FlatList, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useHeaderHeight, getDefaultHeaderHeight } from '@react-navigation/elements';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import NoMoreUserScreen from './NoMoreUserScreen';
import { Feather } from '@expo/vector-icons';
import { haversineDistance } from '../screens/haversine';
import { useDispatch, useSelector } from 'react-redux';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { setLikes, setUnreadChatroomsCount } from '../redux/actions';
import Spinner from 'react-native-loading-spinner-overlay';
import Loading from '../screens/LoadingScreen'

import { FONT, COLORS, SIZES, icons } from '../constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const cardWidth = width;
let cardHeight = 0;

const HomeScreen = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [swipedUpUsers, setSwipedUpUsers] = useState([]);

    const [scrolling, setScrolling] = useState(false);
    const [scrollCounter, setScrollCounter] = useState(0);

    const [scrollOffset, setScrollOffset] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [fetchedUsers, setFetchedUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [paused, setPaused] = useState(false);
    const [blockedIDs, setBlockedIDs] = useState([]);
    const [currentUserDislikes, setCurrentUserDislikes] = useState([]);
    const [isMetric, setIsMetric] = useState(false);
    const [isMiles, setIsMiles] = useState(false);
    const [minHeight, setMinHeight] = useState(100); // Default minimum height
    const [maxHeight, setMaxHeight] = useState(200); // Default maximum height
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(80);
    const [minDistance, setMinDistance] = useState(1);
    const [maxDistance, setMaxDistance] = useState(10);

    const [contentHeight, setContentHeight] = useState(0);

    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        setContentHeight(height);
    }

    console.log("contentHeight: ", contentHeight);

    const tabNavigatorHeight = useContext(BottomTabBarHeightContext);
    // console.log("tabNavigatorHeight: ", tabNavigatorHeight);
    const dimensions = useWindowDimensions();
    const insets = useSafeAreaInsets();
    let headerHeight = getDefaultHeaderHeight(dimensions, false, insets.top);
    // console.log("headerHeight: ", headerHeight);
    const statusBarHeight = StatusBar.currentHeight;
    // console.log("statusBarHeight: ", statusBarHeight);
    if (insets.top === 0) {
        headerHeight += statusBarHeight;
    }
    const availableSpace = height - tabNavigatorHeight - headerHeight + statusBarHeight;
    // console.log("cardHeight: ", cardHeight);
    // console.log("availableSpace: ", availableSpace);
    cardHeight = availableSpace;
    console.log("available space: ", availableSpace);

    const dispatch = useDispatch();
    const flatListRef = useRef(null);


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

    const fetchData = async () => {
        setIsLoading(true);
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

            // Exclude the current user and swiped up users from the list
            filteredUsers = filteredUsers.filter(
                // (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !blockedIDs.includes(user.id) && !currentUserDislikes.includes(user.id)
                // (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !blockedIDs.includes(user.id)
                (user) => user.id !== auth.currentUser.uid && !blockedIDs.includes(user.id)
            );

            // Exclude users who have blocked the current user
            filteredUsers = filteredUsers.filter(
                (user) => !user.blockedIDs?.includes(auth.currentUser.uid)
            );

            // Limit the number of users to render to the first 10
            filteredUsers = filteredUsers.slice(0, 10);

            if (filteredUsers.length === 0) {
                // If no users match the filter criteria, set the users state with a single object representing the "No More Users" screen
                setUsers([{ id: 'no-more-users' }]);
            } else {
                // Set the users state with the filtered users
                setUsers([...filteredUsers]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
        setScrollCounter(0);
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
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
        } catch (error) {
            console.error('Error adding dislike:', error);
        }
    };

    const [currentProfiles, setCurrentProfiles] = useState([]);

    useEffect(() => {
        if (users.length >= 2) {
            setCurrentProfiles([users[0], users[1]]);
        } else if (users.length === 1) {
            setCurrentProfiles([users[0]]);
        }
    }, [users]);

    const onScroll = (event) => {
        let offsetY = event.nativeEvent.contentOffset.y;
        console.log(offsetY);

        if (offsetY >= availableSpace) {
            // setScrollCounter(scrollCounter + 1);
            if (currentProfiles.length > 0) {
                const dislikedUserId = currentProfiles[0].id; // Assuming the first profile is the one to dislike
                handleDislikeClick(dislikedUserId);
            }
            console.log("prevent going back")
            const remainingUsers = users.slice(1);
            setUsers(remainingUsers);
            setCurrentProfiles([users[0], users[1]]);
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
    };

    // useEffect(() => {
    //     console.log('scrollCounter: ', scrollCounter);
    // }, [scrollCounter]);

    const onScrollStart = () => {
        setScrolling(true);
        console.log('SCROLLING ON');
    };

    const onScrollEnd = (event) => {
        setScrolling(false);
        console.log('SCROLLING OFF');
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
                            onValuesChangeFinish={(values) => {
                                const convertedMinHeight = isMetric ? convertHeight(values[0]) : values[0];
                                const convertedMaxHeight = isMetric ? convertHeight(values[1]) : values[1];
                                setMinHeight(convertedMinHeight);
                                setMaxHeight(convertedMaxHeight);
                            }}
                        />
                        <Text style={styles.sliderValue}>
                            {isMetric ? `${convertHeight(minHeight)} ft - ${convertHeight(maxHeight)} ft` : `${minHeight} cm - ${maxHeight} cm`}
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
                            onValuesChangeFinish={(values) => {
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
                            onValuesChangeFinish={(values) => {
                                setMinDistance(values[0]);
                                setMaxDistance(values[1]);
                            }}
                        />
                        <Text style={styles.sliderValue}>
                            {isMiles ? `~ ${convertDistance(minDistance).toFixed(2)} - ${convertDistance(maxDistance).toFixed(2)} miles away` : `~ ${minDistance.toFixed(2)} - ${maxDistance.toFixed(2)} km away`}
                        </Text>
                        <Button
                            color="#000" // Black background
                            onPress={() => {
                                setFilterModalVisible(false);
                                saveFilters(auth.currentUser.uid, minAge, maxAge, minDistance, maxDistance, minHeight, maxHeight);
                                fetchData(); // Refresh the users list
                            }}
                            titleStyle={styles.buttonTitle} // Apply the style to the button's title
                            title="Apply Filter"
                        />
                        <Text></Text>
                        <Button
                            color="#000" // Black background
                            onPress={() => {
                                setFilterModalVisible(false);
                            }}
                            titleStyle={styles.buttonTitle} // Apply the style to the button's title
                            title="Close modal"
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    const saveFilters = async (uid, minAge, maxAge, minDistance, maxDistance, minHeight, maxHeight) => {
        try {
            const minHeightCm = isMetric ? convertHeightToCm(minHeight) : minHeight;
            const maxHeightCm = isMetric ? convertHeightToCm(maxHeight) : maxHeight;

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

    // FIX SWIPING FUNCTIONS BELOW

    const [swipeableEnabled, setSwipeableEnabled] = useState(false);

    const [allowSwipe, setAllowSwipe] = useState({
        vertical: true,
        horizontal: true,
    });

    // Handlers for starting swipe gestures
    const onSwipeStart = (direction) => {
        if (direction === 'vertical') {
            setAllowSwipe({ vertical: true, horizontal: false });
            setSwipeableEnabled(true);
        } else if (direction === 'horizontal') {
            setAllowSwipe({ vertical: false, horizontal: true });
            setSwipeableEnabled(false);
        }
    };

    // Handler for when a swipe is complete
    const onSwipeComplete = () => {
        setAllowSwipe({ vertical: true, horizontal: true });
        setSwipeableEnabled(true);
    };

    // FIX SWIPING FUNCTIONS ABOVE

    const renderItem = ({ item: user }) => {
        if (!users.length) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>No more users to display.</Text>
                </View>
            );
        }

        if (user.id === 'no-more-users') {
            return (
                <View style={{ width: cardWidth, height: availableSpace }}>
                    <NoMoreUserScreen />
                </View>
            );
        }

        const allImages = user.selfieURLs ? [user.selfieURLs, ...user.imageURLs] : user.imageURLs;

        return (
            <Swipeable
                // onSwipeableRightComplete={() => handleDislikeClick(user.id)}
                enabled={swipeableEnabled}
                onSwipeableOpen={(direction) => {
                    onSwipeStart('vertical');
                }}
                onSwipeableClose={() => {
                    onSwipeComplete();
                }}
            >
                <View style={[styles.cardContainer, { width: cardWidth, height: availableSpace }]}>
                    <View style={{ flex: 1 }}>
                        <Swiper
                            dotStyle={{
                                width: 5,
                                height: 5,
                            }}
                            activeDotColor='white'
                            activeDotStyle={{
                                width: 5,
                                height: 5,
                            }}
                            scrollEnabled={true}
                            onIndexChanged={() => {
                                onSwipeStart('horizontal');
                                console.log("swiped horizontally");
                            }}
                            paginationStyle={{
                                bottom: availableSpace - (cardWidth * 4 / 3) + 5,
                            }}
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
                            <TouchableOpacity onPress={() => handleLikeClick(user.id)}>
                                <Text style={styles.likeButton}>Like</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedUser(user); // Pass the user object directly
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
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }} onLayout={onLayout}>
            <View style={styles.container}>
                {isLoading ? <ActivityIndicator /> : (
                    paused ? (
                        pausedRender
                    ) : (
                        <>
                            <FlatList
                                ref={flatListRef}
                                data={currentProfiles}
                                keyExtractor={(user) => user.id}
                                renderItem={renderItem}
                                onScroll={onScroll}
                                // onScrollBeginDrag={onScrollStart}
                                // onScrollEndDrag={onScrollEnd}
                                scrollEventThrottle={16}
                                onEndReached={() => {
                                    if (users[users.length - 1]?.id !== 'no-more-users') {
                                        setUsers((prevUsers) => [...prevUsers, { id: 'no-more-users' }]);
                                    }
                                }}
                                onEndReachedThreshold={0}
                                showsVerticalScrollIndicator={false}
                                alwaysBounceVertical={false}
                            />
                            {/* Filter modal button */}
                            <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
                                <Feather name="chevron-down" size={30} color="black" />
                            </TouchableOpacity>
                        </>
                    )
                )}

                <Spinner
                    visible={isLoading}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    textContent='Loading...'
                    textStyle={{
                        fontFamily: FONT.bold,
                        fontSize: SIZES.medium,
                        fontWeight: 'normal',
                        color: 'white',
                    }}
                />
            </View>
            {renderModal()}
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
    buttonTitle: {
        color: 'white', // Set the text color to white
        fontWeight: 'bold',
    },
});

export default HomeScreen;