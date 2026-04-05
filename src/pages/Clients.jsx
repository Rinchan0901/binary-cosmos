import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient, CLIENT_PHASES, formatDate } from '../store';
import Modal from '../components/Modal';

const AVATAR_COLORS = [
    'linear-gradient(135deg, #8b5cf6, #6366f1)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #14b8a6, #22d3ee)',
];

const emptyForm = { name: '', company: '', email: '', phase: 'contact', notes: '' };

export default function Clients({ onRefresh }) {
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPhase, setFilterPhase] = useState('all');

    useEffect(() => {
        setClients(getClients());
    }, []);

    const filteredClients = clients.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchPhase = filterPhase === 'all' || c.phase === filterPhase;
        return matchSearch && matchPhase;
    });

    const openCreate = () => {
        setEditingClient(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (client) => {
        setEditingClient(client);
        setForm({
            name: client.name,
            company: client.company,
            email: client.email,
            phase: client.phase,
            notes: client.notes,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        if (editingClient) {
            updateClient(editingClient.id, form);
        } else {
            createClient(form);
        }
        setClients(getClients());
        setShowModal(false);
        setForm(emptyForm);
        onRefresh?.();
    };

    const handleDelete = (id) => {
        deleteClient(id);
        setClients(getClients());
        onRefresh?.();
    };

    const handlePhaseAdvance = (client) => {
        const currentIndex = CLIENT_PHASES.findIndex(p => p.id === client.phase);
        if (currentIndex < CLIENT_PHASES.length - 1) {
            updateClient(client.id, { phase: CLIENT_PHASES[currentIndex + 1].id });
            setClients(getClients());
            onRefresh?.();
        }
    };

    const getPhaseIndex = (phaseId) => CLIENT_PHASES.findIndex(p => p.id === phaseId);

    const getAvatarColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    };

    const getInitials = (name) => {
        return name.split(/[\s　]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    const renderPhaseProgress = (client) => {
        const currentIndex = getPhaseIndex(client.phase);
        const currentPhase = CLIENT_PHASES[currentIndex];

        return (
            <div className="phase-progress">
                <div className="phase-bar">
                    {CLIENT_PHASES.map((phase, i) => (
                        <div
                            key={phase.id}
                            className={`phase-step ${i < currentIndex ? 'completed' : ''} ${i === currentIndex ? 'current' : ''}`}
                        />
                    ))}
                </div>
                <div className="phase-label" style={{ color: currentPhase?.color }}>
                    {currentPhase?.label}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">クライアント管理</h1>
                <p className="page-subtitle">クライアントの進捗をフェーズごとに管理</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 クライアントを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="status-select">
                        <button
                            className={`status-pill ${filterPhase === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterPhase('all')}
                        >
                            すべて ({clients.length})
                        </button>
                        {CLIENT_PHASES.map(phase => {
                            const count = clients.filter(c => c.phase === phase.id).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={phase.id}
                                    className={`status-pill ${filterPhase === phase.id ? 'active' : ''}`}
                                    onClick={() => setFilterPhase(phase.id)}
                                >
                                    {phase.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={openCreate}>
                        ＋ クライアントを追加
                    </button>
                </div>
            </div>

            {filteredClients.length === 0 ? (
                <div className="glass-card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-text">
                            {clients.length === 0
                                ? 'まだクライアントが登録されていません'
                                : '条件に一致するクライアントが見つかりません'
                            }
                        </div>
                        {clients.length === 0 && (
                            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openCreate}>
                                最初のクライアントを追加
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="client-grid">
                    {filteredClients.map(client => (
                        <div key={client.id} className="glass-card client-card" onClick={() => openEdit(client)}>
                            <div className="client-card-header">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div
                                        className="client-avatar"
                                        style={{ background: getAvatarColor(client.name) }}
                                    >
                                        {getInitials(client.name)}
                                    </div>
                                    <div className="client-info">
                                        <div className="client-name">{client.name}</div>
                                        {client.company && <div className="client-company">{client.company}</div>}
                                    </div>
                                </div>
                                <div className="client-card-actions">
                                    {getPhaseIndex(client.phase) < CLIENT_PHASES.length - 1 && (
                                        <button
                                            className="task-action-btn"
                                            title="次のフェーズへ"
                                            onClick={(e) => { e.stopPropagation(); handlePhaseAdvance(client); }}
                                        >
                                            ⏭
                                        </button>
                                    )}
                                    <button
                                        className="task-action-btn delete"
                                        title="削除"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>

                            {renderPhaseProgress(client)}

                            {client.notes && (
                                <div className="client-notes">💬 {client.notes}</div>
                            )}
                            <div className="client-updated">
                                更新: {formatDate(client.updatedAt)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setForm(emptyForm); }}
                title={editingClient ? 'クライアントを編集' : '新しいクライアント'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">名前 *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="田中太郎"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">会社名</label>
                                <input
                                    type="text"
                                    value={form.company}
                                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    placeholder="株式会社〇〇"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">メール</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">フェーズ</label>
                            <select
                                value={form.phase}
                                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                            >
                                {CLIENT_PHASES.map(phase => (
                                    <option key={phase.id} value={phase.id}>{phase.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">メモ</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="クライアントに関するメモ..."
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            キャンセル
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingClient ? '更新する' : '追加する'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
