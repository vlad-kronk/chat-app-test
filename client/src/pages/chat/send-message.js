import styles from './styles.module.css';
import React, { useState } from 'react';

const SendMessage = ({ socket, username, room }) => {
   const [message, setMessage] = useState('');

   const sendMessage = () => {
      // require message to have text
      if (message !== '') {
         const __createdtime__ = Date.now();
         // send message to server. can't specify who to send it to
         // server will recieve message and then send it to all users in the room, including the sender
         socket.emit('send_message', { username, room, message, __createdtime__ });
         // reset message textbox to be empty
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