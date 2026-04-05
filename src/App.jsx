import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Clients from './pages/Clients';

export default function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey(k => k + 1);

    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard key={refreshKey} onRefresh={refresh} />} />
                        <Route path="/tasks" element={<Tasks key={refreshKey} onRefresh={refresh} />} />
                        <Route path="/clients" element={<Clients key={refreshKey} onRefresh={refresh} />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
