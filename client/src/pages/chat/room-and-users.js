import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomAndUsers = ({ socket, username, room }) => {
   const [roomUsers, setRoomUsers] = useState([]);

   const navigate = useNavigate();

   // runs every time the component is rendered and whenever the socket object is modified
   useEffect(() => {
      //
      socket.on('chatroom_users', (data) => {
         console.log(data);
         setRoomUsers(data);
      });

      // stop listening for chatroom_users event when the component is not being rendered in the client
      return () => socket.off('chatroom_users');
   }, [socket]);

   const leaveRoom = () => {
      const __createdtime__ = Date.now();
      // tell the server that this socket instance is leaving the room
      socket.emit('leave_room', { username, room, __createdtime__ });
      // redirect to homepage
      navigate('/', { replace: true });
   };

   return (
      <div className={styles.roomAndUsersColumn}>
         <h2 className={styles.roomTitle}>{room}</h2>

         <div>
            {/* only renders component IF the user list contains at least one user */}
            {roomUsers.length > 0 && <h5 className={styles.usersTitle}>Users:</h5>}
            <ul className={styles.usersList}>
               {roomUsers.map((user) => (
                  // if the user being rendered is the current user, make their name bold
                  <li
                     style={{
                        fontWeight: `${user.username === username ? 'bold' : 'normal'}`,
                     }}
                     key={user.id}
                  >
                     {user.username}
                  </li>
               ))}
            </ul>
         </div>

         <button className='btn btn-outline' onClick={leaveRoom}>
            Leave
         </button>
      </div>
   );
};

export default RoomAndUsers;