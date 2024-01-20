const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.cleanUpOldChats =
    functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
      const chatRoomsRef =
          admin.firestore().collection("privatechatrooms");
      const snapshot =
          await chatRoomsRef.get();
      const chatRooms =
          snapshot.docs.map((doc) => doc.data());
      const oneDay =
          24 * 60 * 60 * 1000; // ms
      const now =
          Date.now();
      const seventyTwoHoursAgo =
          now - 3 * oneDay;

      for (const chatRoom of chatRooms) {
        const latestMessageTime =
           chatRoom.latestMessage.timestamp.toMillis();
        if (latestMessageTime < seventyTwoHoursAgo) {
          // This chat room hasn't had a message in the last 72 hours
          // Perform cleanup operations
          const chatRoomRef = chatRoomsRef.doc(chatRoom.id);
          await chatRoomRef.delete();

          // Also remove the match from the user profiles
          // Assume each user has a 'matches' field that lists their matches
          const user1Ref =
              admin.firestore().collection("profiles").doc(chatRoom.user1Id);
          const user2Ref =
              admin.firestore().collection("profiles").doc(chatRoom.user2Id);

          await user1Ref.update({
            matches: admin.firestore.FieldValue.arrayRemove(chatRoom.id),
          });
          await user2Ref.update({
            matches: admin.firestore.FieldValue.arrayRemove(chatRoom.id),
          });

          await user1Ref.update({
            likes:admin.firestore.FieldValue.arrayRemove(chatRoom.user2Id),
            likedBy: admin.firestore.FieldValue.arrayRemove(chatRoom.user2Id)
          })
          await user2Ref.update({
            likes:admin.firestore.FieldValue.arrayRemove(chatRoom.user1Id),
            likedBy: admin.firestore.FieldValue.arrayRemove(chatRoom.user1Id)
          })
        }
      }
    });
