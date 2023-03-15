import styles from './styles.module.css';
import React, { useState } from 'react';

const SendMessage = ({ socket, username, room }) => {
   const [message, setMessage] = useState('');

   const sendMessage = () => {
      if (message !== '') {
         const __createdtime__ = Date.now();
         // send message to server. can't specify who to send it to from frontend
         // server will recieve message and then send it to all users in the room
         socket.emit('send_message', { username, room, message, __createdtime__ });
         setMessage('');
      }
   };

   return (
      <div className={styles.sendMessageContainer}>
         <input
            className={styles.messageInput}
            placeholder='Message...'
            onChange={(e) => setMessage(e.target.value)}
         />
         <button className='btn btn-primary' onClick={sendMessage}>
            Send Message
         </button>
      </div>
   );
};

export default SendMessage;