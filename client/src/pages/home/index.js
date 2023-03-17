import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket }) => {
   const navigate = useNavigate();

   const joinRoom = async () => {

      // console.log("this is the socket:", socket);

      // form fields require values
      if (room !== '' && username !== '') {
         // localStorage.setItem('userData', JSON.stringify({ username, room }))
         // tell the server that this client is joining the specified room
         socket.emit('join_room', { username, room });
         // Redirect to /chat
         navigate('/chat', { replace: true });
      }

   };

   return (
      <div className={styles.container}>
         <div className={styles.formContainer}>
            <h1>{`Hi, user!`}</h1>
            <input
               className={styles.input}
               placeholder='Username...'
               onChange={(e) => setUsername(e.target.value)}
            />

            <select
               className={styles.input}
               onChange={(e) => setRoom(e.target.value)}
            >
               <option>--select a room--</option>
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (<option value={`Room ${i}`}>{`Room ${i}`}</option>))}
            </select>

            <button
               className='btn btn-secondary'
               style={{ width: '100%' }}
               onClick={joinRoom}>
               Join Room
            </button>
         </div>
      </div>
   );
};

export default Home;