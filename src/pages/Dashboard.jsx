import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getActivities, formatDateTime } from '../store';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        setStats(getStats());
        setActivities(getActivities(10));
    }, []);

    if (!stats) return null;

    const { tasks, clients } = stats;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">ダッシュボード</h1>
                <p className="page-subtitle">ビジネスの全体像を把握</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="glass-card stat-card purple">
                    <div className="stat-label">📋 合計タスク</div>
                    <div className="stat-value">{tasks.total}</div>
                    <div className="stat-change">{tasks.progress} 件が進行中</div>
                </div>
                <div className="glass-card stat-card amber">
                    <div className="stat-label">⏳ 未着手</div>
                    <div className="stat-value">{tasks.todo}</div>
                    <div className="stat-change">対応が必要</div>
                </div>
                <div className="glass-card stat-card green">
                    <div className="stat-label">✅ 完了</div>
                    <div className="stat-value">{tasks.done}</div>
                    <div className="stat-change">
                        {tasks.total > 0
                            ? `${Math.round((tasks.done / tasks.total) * 100)}% 達成率`
                            : '—'
                        }
                    </div>
                </div>
                {tasks.overdue > 0 && (
                    <div className="glass-card stat-card red">
                        <div className="stat-label">🚨 期限切れ</div>
                        <div className="stat-value">{tasks.overdue}</div>
                        <div className="stat-change">早急に対応</div>
                    </div>
                )}
                <div className="glass-card stat-card cyan">
                    <div className="stat-label">👥 クライアント数</div>
                    <div className="stat-value">{clients.total}</div>
                    <div className="stat-change">
                        {clients.phaseDistribution.active || 0} 件が実行中
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Client Phase Distribution */}
                {clients.total > 0 && (
                    <div className="glass-card">
                        <div className="section-header">
                            <h2 className="section-title">📈 クライアントフェーズ分布</h2>
                            <Link to="/clients" className="btn btn-ghost btn-sm">すべて見る →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { id: 'contact', label: '初回連絡', color: '#8b5cf6' },
                                { id: 'hearing', label: 'ヒアリング', color: '#6366f1' },
                                { id: 'proposal', label: '提案', color: '#3b82f6' },
                                { id: 'contract', label: '契約', color: '#06b6d4' },
                                { id: 'active', label: '実行中', color: '#10b981' },
                                { id: 'complete', label: '完了', color: '#22d3ee' },
                            ].map(phase => {
                                const count = clients.phaseDistribution[phase.id] || 0;
                                const pct = clients.total > 0 ? (count / clients.total) * 100 : 0;
                                return (
                                    <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 }}>
                                            {phase.label}
                                        </span>
                                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${pct}%`,
                                                background: phase.color,
                                                borderRadius: '3px',
                                                transition: 'width 0.5s ease',
                                                minWidth: count > 0 ? '4px' : '0',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '24px', textAlign: 'right' }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Activity */}
                <div className="glass-card">
                    <div className="section-header">
                        <h2 className="section-title">🕐 最近のアクティビティ</h2>
                    </div>
                    {activities.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <div className="empty-state-text">まだアクティビティがありません</div>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {activities.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-dot" style={{
                                        background: activity.type === 'client' ? '#06b6d4' : '#8b5cf6'
                                    }} />
                                    <div className="activity-content">
                                        <div className="activity-text">{activity.text}</div>
                                        <div className="activity-time">{formatDateTime(activity.timestamp)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card full-width">
                    <div className="section-header">
                        <h2 className="section-title">⚡ クイックアクション</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link to="/tasks" className="btn btn-primary">📋 タスクを追加</Link>
                        <Link to="/clients" className="btn btn-secondary">👤 クライアントを追加</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
