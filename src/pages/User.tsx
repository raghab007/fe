import React, { useEffect, useState } from "react";
import { axiosInstance } from "../api/apis";
import { usePaginatedFetchData } from "../hooks/user";
import { UpdateUserForm } from "../components/UpdateUserForm";
import { useToast } from "../components/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TableSkeleton } from "../components/LoadingStates";
import { LoadingSpinner } from "../components/LoadingStates";
import { EnhancedInputWithLabel } from "../components/AddUser";
import Chatbot from "../components/Chatbot";

interface IUser {
    name: string;
    _id: string;
    email: string;
    age: string; // fix type issue by changing from number to string
    address: string;
    phone: string;
}

interface FormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    age: string;
}

function User() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateUser, setUpdateUser] = useState<IUser>()
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([])
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        address: '',
        phone: '',
        age: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    let { 
        data: users, 
        currentPage, 
        count, 
        error, 
        loading, 
        refetch,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        changePageSize
    } = usePaginatedFetchData(`/api/users`);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const { showToast } = useToast();
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string; userName: string }>({ isOpen: false, userId: '', userName: '' });

    // Filter users based on search term
    useEffect(() => {
        if (users && users.length > 0) {
            const typedUsers = users as IUser[];
            if (searchTerm === "") {
                setFilteredUsers(typedUsers);
            } else {
                const filtered = typedUsers.filter((user: IUser) =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone.includes(searchTerm) ||
                    user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.age.toString().includes(searchTerm)
                );
                setFilteredUsers(filtered);
            }
        }
    }, [searchTerm, users]);

    const handleDeleteUser = async (id: string) => {
        try {
            const response = await axiosInstance.delete(`/api/users/${id}`);
            console.log(response.data.message);
            showToast("User deleted successfully", "success");
            refetch();
        } catch (error) {
            console.log(error);
            showToast("Error while deleting user", "error");
        }
        setDeleteConfirm({ isOpen: false, userId: '', userName: '' });
    };

    const confirmDelete = (userId: string, userName: string) => {
        setDeleteConfirm({ isOpen: true, userId, userName });
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false, userId: '', userName: '' });
    };


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
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

            // Reset form and refresh data
            setFormData({
                name: '',
                email: '',
                address: '',
                phone: '',
                age: ''
            });
            setErrors({});
            setShowAddForm(false);
            refetch();
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error while adding user";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <TableSkeleton rows={8} />
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center bg-white p-6 rounded-lg shadow border border-gray-200 max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-500">Unable to load users. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900">
                                User Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage and organize your users efficiently
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl border border-blue-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-gray-700 font-medium">Total Users:</span>
                                    <span className="font-bold text-blue-600 text-lg">{count}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {showAddForm ? "Cancel" : "Add User"}
                            </button>
                            <button
                                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {isChatbotOpen ? "Close Chat" : "AI Assistant"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Enhanced Chatbot */}
                <Chatbot 
                    isOpen={isChatbotOpen} 
                    onClose={() => setIsChatbotOpen(false)}
                    onRefresh={refetch}
                />

                {/* Add User Form */}
                {showAddForm && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h2 className="ml-3 text-lg font-semibold text-gray-900">Add New User</h2>
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

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                                            isSubmitting 
                                                ? 'bg-green-400 cursor-not-allowed' 
                                                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                                        } text-white`}
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
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="ml-3 text-lg font-semibold text-gray-900">Search Users</h2>
                        </div>
                        <div className="relative max-w-2xl">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search users by name, email, phone, address, or age..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                            />
                            {searchTerm && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <button
                                        onClick={clearSearch}
                                        className="h-6 w-6 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        {searchTerm && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                        {filteredUsers.length}
                                    </span>
                                    results found for "{searchTerm}"
                                </p>
                                {filteredUsers.length === 0 && (
                                    <span className="text-sm text-red-600 font-medium">No matching users found</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Update Form Modal */}
                {isUpdating && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-lg">
                            <button
                                onClick={() => setIsUpdating(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">Update User</h3>
                                <p className="text-gray-600 text-sm">Update user information</p>
                            </div>

                            {updateUser && <UpdateUserForm user={updateUser} />}
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        User Directory
                                    </h2>
                                    <p className="text-sm text-gray-500">Manage and view all registered users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User Information
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Contact Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Age
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredUsers?.map((user) => (
                                        <tr key={user._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                                            <span className="text-white font-bold text-lg">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{user.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {user.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l.5 3m5.5-3l-.5 3M12 15l.5 3M12 15l-.5 3" />
                                                    </svg>
                                                    {user.age} years
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsUpdating(true)
                                                            setUpdateUser(user)
                                                        }}
                                                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(user._id, user.name)}
                                                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-6">Get started by adding your first user to the system.</p>
                            <a href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Your First User
                            </a>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination - Only show if not searching */}
                {users && users.length > 0 && !searchTerm && (
                    <div className="mt-6">
                        <div className="bg-white rounded-lg shadow border border-gray-200 px-6 py-4">
                            {/* Page Size Selector */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="pageSize" className="text-sm text-gray-700">Show:</label>
                                    <select
                                        id="pageSize"
                                        value={pageSize}
                                        onChange={(e) => changePageSize(Number(e.target.value))}
                                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-700">per page</span>
                                </div>
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * pageSize, count)}</span> of{' '}
                                    <span className="font-medium">{count}</span> results
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Mobile View */}
                                <div className="flex justify-between items-center sm:hidden">
                                    <button
                                        onClick={previousPage}
                                        disabled={!hasPreviousPage}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                                            !hasPreviousPage 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                    <div className="text-sm text-gray-700">
                                        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                    </div>
                                    <button
                                        onClick={nextPage}
                                        disabled={!hasNextPage}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                                            !hasNextPage 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
                                    {/* Go to Page Input */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Go to page:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={currentPage}
                                            onChange={(e) => {
                                                const page = Number(e.target.value);
                                                if (page >= 1 && page <= totalPages) {
                                                    goToPage(page);
                                                }
                                            }}
                                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-16 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">of {totalPages}</span>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => goToPage(1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium transition-colors ${
                                                currentPage === 1 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={previousPage}
                                            disabled={!hasPreviousPage}
                                            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                                                !hasPreviousPage 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                                            {currentPage}
                                        </span>
                                        <button
                                            onClick={nextPage}
                                            disabled={!hasNextPage}
                                            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                                                !hasNextPage 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium transition-colors ${
                                                currentPage === totalPages 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={deleteConfirm.isOpen}
                    title="Delete User"
                    message={`Are you sure you want to delete ${deleteConfirm.userName}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDeleteUser(deleteConfirm.userId)}
                    onCancel={cancelDelete}
                    type="danger"
                />
            </div>
        </div>
    );
}

export { User, type IUser };