import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const [time, setTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { path: '/', icon: '📊', label: 'ダッシュボード' },
        { path: '/tasks', icon: '📋', label: 'タスク管理' },
        { path: '/clients', icon: '👥', label: 'クライアント' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🤖</div>
                    <div>
                        <div className="sidebar-logo-text">Secretary</div>
                        <div className="sidebar-subtitle">ビジネス秘書</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-time">
                    {time.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                    <br />
                    {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </aside>
    );
}
