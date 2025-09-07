import React, { useState } from 'react';
import { axiosInstance } from "../api/apis";
import { useToast } from "./Toast";
import { LoadingSpinner } from "./LoadingStates";

interface FormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    age: string;
}

export default function AddUser() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        address: '',
        phone: '',
        age: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const { showToast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
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

    async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
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

            // Reset form after successful submission
            setFormData({
                name: '',
                email: '',
                address: '',
                phone: '',
                age: ''
            });
            setErrors({});
        }
        catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || "Error while adding user";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-50 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Add User
                    </h2>

                    <form onSubmit={handleAddUser} className="space-y-4">
                        <EnhancedInputWithLabel
                            type="text"
                            name="name"
                            label="Full Name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Enter your full name"
                        />
                        <EnhancedInputWithLabel
                            type="email"
                            name="email"
                            label="Email Address"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            placeholder="Enter your email address"
                        />
                        <EnhancedInputWithLabel
                            type="text"
                            name="address"
                            label="Address"
                            id="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={errors.address}
                            placeholder="Enter your address"
                        />
                        <EnhancedInputWithLabel
                            type="tel"
                            name="phone"
                            label="Phone Number"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                            placeholder="Enter your phone number"
                        />
                        <EnhancedInputWithLabel
                            type="number"
                            name="age"
                            label="Age"
                            id="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            error={errors.age}
                            placeholder="Enter your age"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-md font-medium mt-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                                'Add User'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface EnhancedInputWithLabelProps {
    type: string;
    name: string;
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
}

function EnhancedInputWithLabel({ type, name, label, id, value, onChange, error, placeholder }: EnhancedInputWithLabelProps) {
    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                className={`w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                }`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center animate-slideUp">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export { EnhancedInputWithLabel };