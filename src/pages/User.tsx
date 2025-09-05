import React, { useEffect, useState } from "react";
import { axiosInstance } from "../api/apis";
import { usePaginatedFetchData } from "../hooks/user";
import { UpdateUserForm } from "../components/UpdateUserForm";

interface IUser {
    name: string;
    _id: string;
    email: string;
    age: string; // fix type issue by changing from number to string
    address: string;
    phone: string;
}

function User() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateUser, setUpdateUser] = useState<IUser>()
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>([])
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
    const [chatbot, setChatbot] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [userInput, setUserInput] = useState("");

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

    // Initialize chatbot with welcome message
    useEffect(() => {
        if (chatbot && chatMessages.length === 0) {
            setChatMessages([{
                role: "assistant",
                content: "Hello! I'm your user management assistant. You can ask me to create, update, delete, or search for users using natural language."
            }]);
        }
    }, [chatbot, chatMessages.length]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        // Add user message to chat
        const newMessage = { role: "user", content: userInput };
        setChatMessages(prev => [...prev, newMessage]);
        setUserInput("");

        try {
            // Send message to backend
            const response = await axiosInstance.get(`/chat/${encodeURIComponent(userInput)}`);

            // Format the response based on its type
            let responseContent;
            if (response.data.users) {
                // If the response contains users data
                responseContent = `${response.data.message}\n\nUsers found:\n${JSON.stringify(response.data.users, null, 2)}`;
            } else {
                // Regular message response
                responseContent = response.data.message;
            }

            // Add bot response to chat
            setChatMessages(prev => [...prev, {
                role: "assistant",
                content: responseContent
            }]);

            // Refresh users list if operation was successful
            if (response.data.operation &&
                (response.data.operation === "create" ||
                    response.data.operation === "update" ||
                    response.data.operation === "delete")) {
                // Refresh the user data
                refetch();
            }
        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error processing your request. Please try again."
            }]);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
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

    async function handleDeleteUser(id: string) {
        try {
            const response = await axiosInstance.delete(`/api/users/${id}`)
            console.log(response.data.message)
            alert("User deleted successfully")
            refetch();
        } catch (error) {
            console.log(error)
            alert("Error while deleting user")
        }
    }


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">
                                User Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your users
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-gray-600">Total Users: </span>
                                <span className="font-semibold text-blue-600">{count}</span>
                            </div>
                            <button
                                onClick={() => setChatbot(!chatbot)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {chatbot ? "Close Chat" : "AI Assistant"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chatbot Modal */}
                {chatbot && (
                    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex flex-col max-h-[600px]">
                        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="font-semibold">AI Assistant</h3>
                            <button
                                onClick={() => setChatbot(false)}
                                className="text-white hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-xs p-3 rounded-lg ${message.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {message.content.split('\n').map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Ask to create, update, delete or search users..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search users by name, email, phone, address, or age..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {searchTerm && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <button
                                    onClick={clearSearch}
                                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    {searchTerm && (
                        <p className="mt-2 text-sm text-gray-600">
                            Showing {filteredUsers.length} results for "{searchTerm}"
                        </p>
                    )}
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
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">
                                User Directory
                            </h2>
                            {searchTerm && filteredUsers.length === 0 && (
                                <span className="text-sm text-red-600">No matching users found</span>
                            )}
                        </div>
                    </div>

                    {users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Age
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers?.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-800 font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.address}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {user.age} years
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setIsUpdating(true)
                                                            setUpdateUser(user)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
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
                        <div className="text-center py-12">
                            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                            <p className="text-gray-500">Get started by adding your first user.</p>
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
            </div>
        </div>
    );
}

export { User, type IUser };