import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, Modal, Button, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { collection, getDocs, updateDoc, arrayUnion, doc, getDoc, arrayRemove, query, where, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { db, auth } from '../firebase/firebase';
import Swiper from 'react-native-swiper';
import { Swipeable } from 'react-native-gesture-handler';
import NoMoreUserScreen from './NoMoreUserScreen';
import { Feather } from '@expo/vector-icons';
import { haversineDistance } from '../screens/haversine';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, setUnreadChatroomsCount } from '../redux/actions';
import Spinner from 'react-native-loading-spinner-overlay';

import { FONT, COLORS, SIZES, icons } from '../constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const cardWidth = width;
const cardHeight = height - 105;

const HomeScreen = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [swipedUpUsers, setSwipedUpUsers] = useState([]);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [fetchedUsers, setFetchedUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0)
    const [paused, setPaused] = useState(false);
    const [blockedIDs, setBlockedIDs] = useState([]);

    const tabNavigatorHeight = useContext(BottomTabBarHeightContext);
    // console.log("tabNavigatorHeight: ", tabNavigatorHeight);
    const headerHeight = useHeaderHeight();
    // console.log("headerHeight: ", headerHeight);
    const statusBarHeight = StatusBar.currentHeight;
    // console.log("statusBarHeight: ", statusBarHeight);
    const availableSpace = height - tabNavigatorHeight - headerHeight + statusBarHeight;
    // console.log("cardHeight: ", cardHeight);
    // console.log("availableSpace: ", availableSpace);

    const dispatch = useDispatch();
    const [heightRange, setHeightRange] = useState([100, 200]); // Default height range
    const [ageRange, setAgeRange] = useState([18, 80]); // Default age range
    const [distanceRange, setDistanceRange] = useState([1, 10])
    const [loading, setLoading] = useState(false);

    const isUserWithinRanges = (user) => {
        const userHeight = user.cmHeight;
        const userAge = user.age;

        // Check if the user's height falls within the height range
        if (userHeight < heightRange[0] || userHeight > heightRange[1]) {
            return false;
        }

        // Check if the user's age falls within the age range
        if (userAge < ageRange[0] || userAge > ageRange[1]) {
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

            // Exclude the current user and swiped up users from the list
            filteredUsers = filteredUsers.filter(
                (user) => user.id !== auth.currentUser.uid && !swipedUpUsers.includes(user.id) && !blockedIDs.includes(user.id)
            );

            // Exclude users who have blocked the current user
            filteredUsers = filteredUsers.filter(
                (user) => !user.blockedIDs?.includes(auth.currentUser.uid)
            );

            // Always include the "No More Users" item at the end of the users array
            setUsers([...filteredUsers]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
            setIsLoading(false);
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
        // try {
        //     const currentUserDocRef = doc(db, 'profiles', auth.currentUser.uid);

        //     // Add the disliked user to the current user's document
        //     await updateDoc(currentUserDocRef, {
        //         dislikes: arrayUnion(dislikedUserId),
        //     });

        //     // Add the disliked user to the swipedUpUsers array
        //     setSwipedUpUsers((prevSwipedUpUsers) => [...prevSwipedUpUsers, dislikedUserId]);

        //     // After 10 seconds, remove the disliked user from the current user's document
        //     setTimeout(async () => {
        //         await updateDoc(currentUserDocRef, {
        //             dislikes: arrayRemove(dislikedUserId),
        //         });

        //         // Also remove the disliked user from the swipedUpUsers array
        //         setSwipedUpUsers((prevSwipedUpUsers) => prevSwipedUpUsers.filter(userId => userId !== dislikedUserId));
        //     }, 1000000000);
        // } catch (error) {
        //     console.error('Error adding dislike:', error);
        // }
    };


    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // Calculate the current index based on the scroll offset
        const newIndex = Math.round(offsetY / availableSpace);

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
    };

    const pausedRender = (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Your profile is currently paused, that means that you cant see new matches and you will not be featured on other peoples screen</Text>
            <Text>To unpause, you can go back to pause account and turn the switch back to off </Text>
        </View>
    )

    const renderModal = () => {
        const handleHeightChange = (values) => {
            setHeightRange(values);
        };

        const handleAgeChange = (values) => {
            setAgeRange(values);
        };

        const handleDistanceChange = (values) => {
            setDistanceRange(values);
        }
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
                            values={heightRange}
                            sliderLength={300}
                            onValuesChangeFinish={handleHeightChange}
                            min={100}
                            max={250}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                        />
                        <Text style={styles.sliderValue}>{heightRange[0]} - {heightRange[1]} cm</Text>
                        <Text style={styles.sliderLabel}>Age Range</Text>
                        <MultiSlider
                            values={ageRange}
                            sliderLength={200}
                            onValuesChangeFinish={handleAgeChange}
                            min={18}
                            max={100}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                        />
                        <Text style={styles.sliderValue}>Between {ageRange[0]} and {ageRange[1]} years old</Text>
                        <Text style={styles.sliderLabel}>Distance Range</Text>
                        <MultiSlider
                            values={distanceRange}
                            sliderLength={200}
                            onValuesChangeFinish={handleDistanceChange}
                            min={1}
                            max={50}
                            step={1}
                            allowOverlap={false}
                            snapped={true}
                        />
                        <Text style={styles.sliderValue}>From {distanceRange[0]} to {distanceRange[1]} km away</Text>
                        <Button title="Close Modal" onPress={() => {
                            setFilterModalVisible(false);
                            fetchData(); // Refresh the users list
                        }} />
                    </View>
                </View>
            </Modal>
        );
    };

    // FIX SWIPING FUNCTIONS BELOW

    const [allowSwipe, setAllowSwipe] = useState({
        vertical: true,
        horizontal: true,
    });

    // Handlers for starting swipe gestures
    const onSwipeStart = (direction) => {
        if (direction === 'vertical') {
            setAllowSwipe({ vertical: true, horizontal: false });
        } else if (direction === 'horizontal') {
            setAllowSwipe({ vertical: false, horizontal: true });
        }
    };

    // Handler for when a swipe is complete
    const onSwipeComplete = () => {
        setAllowSwipe({ vertical: true, horizontal: true });
    };

    // FIX SWIPING FUNCTIONS ABOVE

    useEffect(() => {
        console.log(allowSwipe);
    }, [allowSwipe])

    const renderItem = ({ item: user }) => {
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
                onSwipeableRightComplete={() => handleDislikeClick(user.id)}
                enabled={allowSwipe.vertical}
                onSwipeableOpen={(direction) => {
                    onSwipeStart('vertical');
                }}
                onSwipeableClose={() => {
                    onSwipeComplete();
                }}
            >
                <View style={[styles.cardContainer, { width: cardWidth, height: availableSpace }]}>
                    <Swiper
                        scrollEnabled={allowSwipe.horizontal}
                        onIndexChanged={() => {
                            onSwipeStart('horizontal');
                            console.log("swiped horizontally");
                        }}
                        style={[styles.swiper]}
                        index={0}
                        loop={false}
                    >
                        {allImages.map((imageUrl, imageIndex) => (
                            <View key={imageIndex} style={{ flex: 1 }}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    onLoad={() => console.log('Image loaded')}
                                    onError={(error) => console.log('Error loading image: ', error)}
                                    style={styles.image}
                                />
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.userName}>{user.firstName + ' ' + user.lastName || 'No name'}</Text>
                                    <Text style={styles.userDetails}>{`${user.gender || 'No gender'}, Age: ${user.age || 'No age'}`}</Text>
                                    <Text style={styles.userDetails}>Number of retakes: {user.retakes || 'No retakes'} </Text>
                                    <Text style={styles.userDetails}>Location: {user.location || 'No Location'} </Text>
                                    <Text style={styles.userDetails}>Height: {user.cmHeight + ' cm' || 'No Height'}  </Text>
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
                        <View style={[styles.modalContainer, { height: availableSpace }]}>
                            <View style={[styles.modalContent, { height: availableSpace }]}>
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
                                            Distance: ~{currentUserData && selectedUser && haversineDistance(currentUserData.latitude, currentUserData.longitude, selectedUser.latitude, selectedUser.longitude)}km
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {loading ? <ActivityIndicator /> : (
                paused ? (
                        pausedRender
                    ) : (
                        <>
                        <FlatList
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
                            />
                            {renderModal()}
                    </>
                )
            )}

                <Spinner
                    visible={isLoading}
                    animation='fade'
                    overlayColor="rgba(0, 0, 0, 0.25)"
                    color="white"
                    indicatorStyle={{

                    }}
                    textContent='Loading...'
                    textStyle={{
                        fontFamily: FONT.bold,
                        fontSize: SIZES.medium,
                        fontWeight: 'normal',
                        color: 'white',
                    }}
                />
            </View>
        </GestureHandlerRootView>
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
        overflow: 'hidden',
        backgroundColor: 'white', // Set the background color of the cards
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
});

export default HomeScreen;