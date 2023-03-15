import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Messages = ({ socket }) => {

   const [messagesReceived, setMessagesReceived] = useState([]);

   // accesses the dom element for autoscroll
   const messagesColumnRef = useRef(null);

   // Runs whenever a socket event is recieved from the server
   useEffect(() => {
      socket.on('receive_message', (data) => {
         console.log(data);
         setMessagesReceived((state) => [
            ...state,
            {
               message: data.message,
               username: data.username,
               __createdtime__: data.__createdtime__,
            },
         ]);
      });

      // Remove event listener on component unmount
      return () => socket.off('receive_message');
   }, [socket]);

   // runs whenever a socket event is recieved
   useEffect(() => {
      // fetches last 100 messages sent in chat room from the db
      socket.on('last_100_messages', (last100Messages) => {
         console.log('Last 100 messages:', JSON.parse(last100Messages));
         // set variable to parsed data
         last100Messages = JSON.parse(last100Messages);
         // sort messages by __createdtime__
         last100Messages = sortMessagesByDate(last100Messages);
         setMessagesReceived((state) => [...last100Messages, ...state]);
      });
   }, [socket])

   // scroll to most recent message whenever we get a new one
   useEffect(() => {
      messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
   }, [messagesReceived]);

   // sorts messages by their date value from least to most recent
   function sortMessagesByDate(messages) {
      return messages
         .sort((a, b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__));
   }

   // dd/mm/yyyy, hh:mm:ss
   function formatDateFromTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
   }

   return (
      <div className={styles.messagesColumn} ref={messagesColumnRef}>
         {messagesReceived.map((msg, i) => (
            <div className={styles.message} key={i}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className={styles.msgMeta}>{msg.username}</span>
                  <span className={styles.msgMeta}>
                     {formatDateFromTimestamp(msg.__createdtime__)}
                  </span>
               </div>
               <p className={styles.msgText}>{msg.message}</p>
               <br />
            </div>
         ))}
      </div>
   );
};

export default Messages;