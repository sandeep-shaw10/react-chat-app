import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import './styles/main.scss';
import 'rsuite/dist/rsuite.min.css';
import ProfileProvider from './context/profile';


function App() {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/" element={<PrivateRoute render={<Home/>}/>}>
          <Route path="/chat/:id" element={<>Hello</>} />
        </Route>
        <Route path="/signin" element={<PublicRoute render={<SignIn/>}/>}/>
      </Routes>
    </ProfileProvider>
  );
}

export default App;
