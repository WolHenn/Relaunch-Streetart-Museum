import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={!token ? <Login setToken={setToken} /> : <Navigate to="/admin" />}
                />
                <Route
                    path="/admin/*"
                    element={token ? <Dashboard logout={logout} /> : <Navigate to="/login" />}
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;