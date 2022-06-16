import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import './styles/main.scss';
import 'rsuite/dist/rsuite.min.css';
import ProfileProvider from './context/profile';
import Chat from './pages/Home/Chat';
import HomeOutlet from './pages/Home/HomeOutlet';


function App() {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/" element={ <PrivateRoute render={<Home/>} />} >
          <Route index element={<HomeOutlet/>} />
          <Route path="chat/:chatId" element={<Chat/>} />
        </Route>
        <Route path="/signin" element={<PublicRoute render={<SignIn/>}/>}/>
      </Routes>
    </ProfileProvider>
  );
}

export default App;
