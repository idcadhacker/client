import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';

const App = () => {
  const [user, setUser] = useState(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const authenticate = (token) => {
    localStorage.setItem('token', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser(payload);
  };

  const fetchContent = async (page) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/content/${page}`, {
      headers: { Authorization: token },
    });
    if (res.status === 401) logout();
    return res.json();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) authenticate(token);
  }, []);

  return (
    <Router>
      <header>
        <Link to="/home">Home</Link>
        {user ? (
          <>
            <span>{user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </header>
      <Routes>
        <Route path="/home" element={<ContentPage fetchContent={fetchContent} page="home" />} />
        <Route path="/login" element={<LoginPage authenticate={authenticate} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/user"
          element={user ? <ContentPage fetchContent={fetchContent} page="user" /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && user.role === 'admin' ? <ContentPage fetchContent={fetchContent} page="admin" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

const ContentPage = ({ fetchContent, page }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchContent(page).then((data) => setContent(data.message));
  }, [page]);

  return <div>{content}</div>;
};

const LoginPage = ({ authenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) authenticate(data.token);
  };

  return (
    <div>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Uživatelské jméno" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" type="password" />
      <button onClick={login}>Přihlásit se</button>
    </div>
  );
};

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  };

  return (
    <div>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Uživatelské jméno" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" type="password" />
      <button onClick={register}>Registrovat</button>
    </div>
  );
};

export default App;