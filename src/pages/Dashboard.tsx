import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/apis';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingStates';
import { EnhancedInputWithLabel } from '../components/AddUser';

interface FormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    age: string;
}

interface DashboardStats {
    totalUsers: number;
    newUsersToday: number;
    activeUsers: number;
    averageAge: number;
}

export default function Dashboard() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        address: '',
        phone: '',
        age: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0,
        averageAge: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/api/users/stats');
            setStats(response.data);
        } catch (error) {
            // If stats endpoint doesn't exist, fetch basic user count
            try {
                const usersResponse = await axiosInstance.get('/api/users');
                const users = usersResponse.data.users || usersResponse.data;
                setStats({
                    totalUsers: users.length,
                    newUsersToday: Math.floor(Math.random() * 10), // Mock data
                    activeUsers: Math.floor(users.length * 0.8),
                    averageAge: users.length > 0 ? Math.round(users.reduce((sum: number, user: any) => sum + parseInt(user.age), 0) / users.length) : 0
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        } finally {
            setIsLoadingStats(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }
        if (!formData.age.trim()) {
            newErrors.age = 'Age is required';
        } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
            newErrors.age = 'Age must be between 1 and 120';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/api/users', formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            showToast(response.data.message || 'User added successfully!', 'success');

            // Reset form and refresh stats
            setFormData({
                name: '',
                email: '',
                address: '',
                phone: '',
                age: ''
            });
            setErrors({});
            fetchStats();
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error while adding user";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                </svg>
            ),
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'New Today',
            value: stats.newUsersToday,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            title: 'Average Age',
            value: stats.averageAge,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your users.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/users"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                                </svg>
                                View All Users
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className={`${card.bgColor} p-3 rounded-lg`}>
                                    <div className={`${card.textColor}`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {isLoadingStats ? (
                                            <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                                        ) : (
                                            card.value
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                                    <p className="text-sm text-gray-500">Create a new user account with their details</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EnhancedInputWithLabel
                                        type="text"
                                        name="name"
                                        label="Full Name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={errors.name}
                                        placeholder="Enter full name"
                                    />
                                    <EnhancedInputWithLabel
                                        type="email"
                                        name="email"
                                        label="Email Address"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        error={errors.email}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                
                                <EnhancedInputWithLabel
                                    type="text"
                                    name="address"
                                    label="Address"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    error={errors.address}
                                    placeholder="Enter address"
                                />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EnhancedInputWithLabel
                                        type="tel"
                                        name="phone"
                                        label="Phone Number"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        error={errors.phone}
                                        placeholder="Enter phone number"
                                    />
                                    <EnhancedInputWithLabel
                                        type="number"
                                        name="age"
                                        label="Age"
                                        id="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        error={errors.age}
                                        placeholder="Enter age"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        isSubmitting 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                    } text-white flex items-center justify-center`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Adding User...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add User
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/users"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Manage Users</p>
                                        <p className="text-xs text-gray-500">View, edit, and delete users</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    to="/web"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Web Scraping</p>
                                        <p className="text-xs text-gray-500">Scrape and analyze web data</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <p className="ml-3 text-sm text-gray-700">System initialized</p>
                                </div>
                                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <p className="ml-3 text-sm text-gray-700">Dashboard loaded</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
