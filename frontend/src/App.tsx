import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import IdeasList from './pages/IdeasList';
import IdeaDetail from './pages/IdeaDetail';
import CreateIdea from './pages/CreateIdea';
import Pricing from './pages/Pricing';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Help from './pages/Help';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import Loading from './pages/Loading';
import Generate from './pages/Generate';

function App() {
  const { setUser, setToken, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('bizgenius_token');
    const userStr = localStorage.getItem('bizgenius_user');
    
    if (token && userStr) {
      setToken(token);
      try {
        const user = JSON.parse(userStr);
        setUser(user);
      } catch {
        localStorage.removeItem('bizgenius_user');
      }
    }
  }, [setToken, setUser]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/generate" element={<Generate />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/ideas" element={isAuthenticated ? <Layout><IdeasList /></Layout> : <Navigate to="/login" />} />
      <Route path="/ideas/new" element={isAuthenticated ? <Layout><CreateIdea /></Layout> : <Navigate to="/login" />} />
      <Route path="/ideas/:id" element={isAuthenticated ? <Layout><IdeaDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/subscription" element={isAuthenticated ? <Layout><Subscription /></Layout> : <Navigate to="/login" />} />
      <Route path="/billing" element={isAuthenticated ? <Layout><Billing /></Layout> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
      <Route path="/settings" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
      <Route path="/help" element={isAuthenticated ? <Layout><Help /></Layout> : <Navigate to="/login" />} />
      
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
