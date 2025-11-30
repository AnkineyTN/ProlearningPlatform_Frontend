import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Calendar, BarChart3, Clock, Trash2 } from 'lucide-react';
import CalendarCard from '@/components/cards/CalendarCard';
import HeaderDashboard from '@/components/header/HeaderDashboard'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TodoDashboard = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Finish the sales presentation for the client meeting at 2:00', category: 'Work', completed: false, priority: 'high', dueDate: '2023-09-25' },
        { id: 2, title: 'Send follow-up emails to potential leads', category: 'Work', completed: false, priority: 'medium', dueDate: '2023-09-25' },
        { id: 3, title: 'Review and approve the marketing budget for Q4', category: 'Work', completed: true, priority: 'high', dueDate: '2023-09-24' },
        { id: 4, title: 'Do 30 minutes of physical exercise', category: 'Personal', completed: false, priority: 'low', dueDate: '2023-09-25' },
        { id: 5, title: 'Read one chapter of the book you want to finish', category: 'Personal', completed: false, priority: 'low', dueDate: '2023-09-25' },
        { id: 6, title: 'Complete Monthly Report', category: 'Work', completed: false, priority: 'medium', dueDate: '2023-09-26' },
    ]);

    const [newTask, setNewTask] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { name: 'All Tasks', value: 'all', color: 'bg-purple-500', count: tasks.length },
        { name: 'Work', value: 'Work', color: 'bg-blue-500', count: tasks.filter(t => t.category === 'Work').length },
        { name: 'Personal', value: 'Personal', color: 'bg-green-500', count: tasks.filter(t => t.category === 'Personal').length },
        { name: 'Completed', value: 'completed', color: 'bg-gray-500', count: tasks.filter(t => t.completed).length },
    ];

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const addTask = () => {
        if (newTask.trim()) {
            const task = {
                id: Date.now(),
                title: newTask,
                category: selectedCategory === 'all' ? 'Personal' : selectedCategory,
                completed: false,
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0]
            };
            setTasks([...tasks, task]);
            setNewTask('');
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'completed') return task.completed;
        return task.category === selectedCategory;
    });

    const todayTasks = tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split('T')[0]);
    const completedToday = tasks.filter(t => t.completed).length;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <HeaderDashboard title="Todo Dashboard" />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-bg-purple rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-text-purple" />
                            </div>
                            <span className="text-sm text-green-600 font-semibold">+12%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground0">{completedToday}</h3>
                        <p className="text-muted-foreground text-sm">Tasks Completed</p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-bg-selected rounded-xl">
                                <Clock className="w-6 h-6 text-text-selected" />
                            </div>
                            <span className="text-sm text-orange-600 font-semibold">{todayTasks.length}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground0">7h 28m</h3>
                        <p className="text-muted-foreground text-sm">Time Tracked</p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-bg-info rounded-xl">
                                <BarChart3 className="w-6 h-6 text-text-info" />
                            </div>
                            <span className="text-sm text-text-info font-semibold">85%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground0">{tasks.length}</h3>
                        <p className="text-muted-foreground text-sm">Total Tasks</p>
                    </div>

                    <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-bg-pinked rounded-xl">
                                <Calendar className="w-6 h-6 text-text-pinked" />
                            </div>
                            <span className="text-sm text-text-pinked font-semibold">3 due</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground0">Today</h3>
                        <p className="text-muted-foreground text-sm">Current Focus</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Task Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Categories */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {categories.map((cat) => (
                                <Button
                                    variant={"secondary"}
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat.value
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                        : 'bg-card text-foreground'
                                        }`}
                                >
                                    {cat.name} ({cat.count})
                                </Button>
                            ))}
                        </div>

                        {/* Add New Task */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm">
                            <div className="flex gap-3">
                                <Input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 px-4 py-2 rounded-xl border border-ring focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <Button
                                    onClick={addTask}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 cursor-pointer to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Task
                                </Button>
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-foreground0 mb-4">
                                {selectedCategory === 'all' ? 'All Tasks' :
                                    selectedCategory === 'completed' ? 'Completed Tasks' :
                                        `${selectedCategory} Tasks`}
                            </h2>
                            <div className="space-y-3">
                                {filteredTasks.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No tasks found. Add a new task to get started!</p>
                                    </div>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md ${task.completed
                                                ? 'bg-card-secondary border-border'
                                                : 'bg-card border-ring hover:border-purple-500'
                                                }`}
                                        >
                                            <Button
                                                variant={"ghost"}
                                                onClick={() => toggleTask(task.id)}
                                                className="flex-shrink-0 cursor-pointer p-2 rounded-lg"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle2 className="w-10 h-10 text-text-info" />
                                                ) : (
                                                        <Circle className="w-10 h-10 text-muted-foreground hover:text-text-purple" />
                                                )}
                                            </Button>
                                            <div className="flex-1">
                                                <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${task.category === 'Work' ? 'bg-bg-selected text-text-selected' : 'bg-bg-info text-text-info'
                                                        }`}>
                                                        {task.category}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-bg-error text-text-error' :
                                                        task.priority === 'medium' ? 'bg-bg-warning text-text-warning' :
                                                            'bg-bg-indigo text-text-indigo'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 bg-transparent hover:bg-bg-error rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5 text-text-error" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Calendar */}
                        <CalendarCard />

                        {/* Progress Card */}
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Weekly Progress</h3>
                            <div className="text-4xl font-bold mb-4">78%</div>
                            <div className="w-full bg-white/30 rounded-full h-3 mb-4">
                                <div className="bg-white rounded-full h-3 w-3/4"></div>
                            </div>
                            <p className="text-sm opacity-90">You're doing great! Keep it up!</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-foreground0 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Productivity</span>
                                    <span className="font-bold text-green-600">+15%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Tasks/Day</span>
                                    <span className="font-bold text-foreground0">8.5</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Streak</span>
                                    <span className="font-bold text-orange-500">12 days 🔥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodoDashboard;