// localStorage-based data store for tasks and clients

const TASKS_KEY = 'secretary_tasks';
const CLIENTS_KEY = 'secretary_clients';
const ACTIVITY_KEY = 'secretary_activity';

// ---- Helpers ----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getDaysUntil(deadline) {
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ---- Phase definitions ----
const CLIENT_PHASES = [
    { id: 'contact', label: '初回連絡', color: '#8b5cf6' },
    { id: 'hearing', label: 'ヒアリング', color: '#6366f1' },
    { id: 'proposal', label: '提案', color: '#3b82f6' },
    { id: 'contract', label: '契約', color: '#06b6d4' },
    { id: 'active', label: '実行中', color: '#10b981' },
    { id: 'complete', label: '完了', color: '#22d3ee' },
];

// ---- Task CRUD ----
function getTasks() {
    return getFromStorage(TASKS_KEY);
}

function createTask(task) {
    const tasks = getTasks();
    const newTask = {
        id: generateId(),
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',      // todo | progress | done
        priority: task.priority || 'medium', // high | medium | low
        deadline: task.deadline || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    saveToStorage(TASKS_KEY, tasks);
    addActivity(`タスク「${newTask.title}」を作成しました`, 'task');
    return newTask;
}

function updateTask(id, updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTask = tasks[index];
    tasks[index] = { ...oldTask, ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(TASKS_KEY, tasks);

    if (updates.status && updates.status !== oldTask.status) {
        const statusLabels = { todo: '未着手', progress: '進行中', done: '完了' };
        addActivity(`タスク「${tasks[index].title}」を${statusLabels[updates.status]}に変更`, 'task');
    }

    return tasks[index];
}

function deleteTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    const filtered = tasks.filter(t => t.id !== id);
    saveToStorage(TASKS_KEY, filtered);
    if (task) addActivity(`タスク「${task.title}」を削除しました`, 'task');
    return filtered;
}

// ---- Client CRUD ----
function getClients() {
    return getFromStorage(CLIENTS_KEY);
}

function createClient(client) {
    const clients = getClients();
    const newClient = {
        id: generateId(),
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phase: client.phase || 'contact',
        notes: client.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    clients.unshift(newClient);
    saveToStorage(CLIENTS_KEY, clients);
    addActivity(`クライアント「${newClient.name}」を追加しました`, 'client');
    return newClient;
}

function updateClient(id, updates) {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldClient = clients[index];
    clients[index] = { ...oldClient, ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(CLIENTS_KEY, clients);

    if (updates.phase && updates.phase !== oldClient.phase) {
        const phaseLabel = CLIENT_PHASES.find(p => p.id === updates.phase)?.label || updates.phase;
        addActivity(`${clients[index].name}のフェーズを「${phaseLabel}」に更新`, 'client');
    }

    return clients[index];
}

function deleteClient(id) {
    const clients = getClients();
    const client = clients.find(c => c.id === id);
    const filtered = clients.filter(c => c.id !== id);
    saveToStorage(CLIENTS_KEY, filtered);
    if (client) addActivity(`クライアント「${client.name}」を削除しました`, 'client');
    return filtered;
}

// ---- Activity Log ----
function getActivities(limit = 20) {
    return getFromStorage(ACTIVITY_KEY).slice(0, limit);
}

function addActivity(text, type = 'general') {
    const activities = getFromStorage(ACTIVITY_KEY);
    activities.unshift({
        id: generateId(),
        text,
        type,
        timestamp: new Date().toISOString(),
    });
    // Keep last 50 activities
    saveToStorage(ACTIVITY_KEY, activities.slice(0, 50));
}

// ---- Stats ----
function getStats() {
    const tasks = getTasks();
    const clients = getClients();

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const progressCount = tasks.filter(t => t.status === 'progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const overdueCount = tasks.filter(t => {
        if (!t.deadline || t.status === 'done') return false;
        return getDaysUntil(t.deadline) < 0;
    }).length;

    const phaseDistribution = {};
    CLIENT_PHASES.forEach(phase => {
        phaseDistribution[phase.id] = clients.filter(c => c.phase === phase.id).length;
    });

    return {
        tasks: { total: tasks.length, todo: todoCount, progress: progressCount, done: doneCount, overdue: overdueCount },
        clients: { total: clients.length, phaseDistribution },
    };
}

export {
    getTasks, createTask, updateTask, deleteTask,
    getClients, createClient, updateClient, deleteClient,
    getActivities, addActivity, getStats,
    CLIENT_PHASES,
    formatDate, formatDateTime, getDaysUntil,
    generateId,
};
