function leaveRoom(userID, chatRoomUsers) {
   // return an updated array that includes all previous users except
   // the user with an ID that matches the userID parameter
   return chatRoomUsers.filter((user) => user.id != userID);
}

module.exports = leaveRoom;