import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getDaysUntil, formatDate } from '../store';
import Modal from '../components/Modal';

const STATUS_CONFIG = {
    todo: { label: '未着手', icon: '⬜', color: 'var(--status-todo)' },
    progress: { label: '進行中', icon: '🔵', color: 'var(--status-progress)' },
    done: { label: '完了', icon: '✅', color: 'var(--status-done)' },
};

const PRIORITY_CONFIG = {
    high: { label: '高', class: 'badge-priority-high' },
    medium: { label: '中', class: 'badge-priority-medium' },
    low: { label: '低', class: 'badge-priority-low' },
};

const emptyForm = { title: '', description: '', status: 'todo', priority: 'medium', deadline: '' };

export default function Tasks({ onRefresh }) {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setTasks(getTasks());
    }, []);

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

    const openCreate = (status = 'todo') => {
        setEditingTask(null);
        setForm({ ...emptyForm, status });
        setShowModal(true);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        if (editingTask) {
            updateTask(editingTask.id, form);
        } else {
            createTask(form);
        }
        setTasks(getTasks());
        setShowModal(false);
        setForm(emptyForm);
        onRefresh?.();
    };

    const handleDelete = (id) => {
        deleteTask(id);
        setTasks(getTasks());
        onRefresh?.();
    };

    const handleStatusChange = (id, newStatus) => {
        updateTask(id, { status: newStatus });
        setTasks(getTasks());
        onRefresh?.();
    };

    const renderDeadline = (deadline) => {
        if (!deadline) return null;
        const days = getDaysUntil(deadline);
        const isOverdue = days < 0;
        const label = isOverdue
            ? `${Math.abs(days)}日超過`
            : days === 0
                ? '今日まで'
                : `あと${days}日`;
        return (
            <span className={`badge-deadline ${isOverdue ? 'overdue' : ''}`}>
                📅 {label}
            </span>
        );
    };

    const renderTaskCard = (task) => (
        <div key={task.id} className="task-card" onClick={() => openEdit(task)}>
            <div className="task-card-actions">
                {task.status !== 'done' && (
                    <button
                        className="task-action-btn"
                        title={task.status === 'todo' ? '進行中にする' : '完了にする'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, task.status === 'todo' ? 'progress' : 'done');
                        }}
                    >
                        {task.status === 'todo' ? '▶' : '✓'}
                    </button>
                )}
                <button
                    className="task-action-btn delete"
                    title="削除"
                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                >
                    🗑
                </button>
            </div>
            <div className="task-card-title">{task.title}</div>
            {task.description && (
                <div className="task-card-desc">{task.description}</div>
            )}
            <div className="task-card-meta">
                <span className={`badge ${PRIORITY_CONFIG[task.priority].class}`}>
                    {PRIORITY_CONFIG[task.priority].label}
                </span>
                {renderDeadline(task.deadline)}
            </div>
        </div>
    );

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">タスク管理</h1>
                <p className="page-subtitle">カンバンボードでタスクを管理</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 タスクを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={() => openCreate()}>
                        ＋ タスクを追加
                    </button>
                </div>
            </div>

            <div className="kanban-board">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const columnTasks = getTasksByStatus(status);
                    return (
                        <div key={status} className="kanban-column">
                            <div className="kanban-column-header">
                                <div className="kanban-column-title">
                                    <span>{config.icon}</span>
                                    <span>{config.label}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="kanban-column-count">{columnTasks.length}</span>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: '2px 8px', fontSize: '1rem' }}
                                        onClick={() => openCreate(status)}
                                        title="追加"
                                    >
                                        ＋
                                    </button>
                                </div>
                            </div>
                            <div className="kanban-column-body">
                                {columnTasks.length === 0 ? (
                                    <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                                        <div className="empty-state-text" style={{ fontSize: 'var(--font-size-sm)' }}>
                                            タスクなし
                                        </div>
                                    </div>
                                ) : (
                                    columnTasks.map(renderTaskCard)
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setForm(emptyForm); }}
                title={editingTask ? 'タスクを編集' : '新しいタスク'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">タイトル *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="タスクのタイトル"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">説明</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="タスクの詳細を入力..."
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">ステータス</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">優先度</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                >
                                    <option value="high">🔴 高</option>
                                    <option value="medium">🟡 中</option>
                                    <option value="low">🟢 低</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">期限</label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            キャンセル
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingTask ? '更新する' : '作成する'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
