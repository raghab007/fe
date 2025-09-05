import React, { useState } from 'react';
import { axiosInstance } from "../api/apis";

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            const response = await axiosInstance.post('/api/users', formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            alert(response.data.message);

            // Reset form after successful submission
            setFormData({
                name: '',
                email: '',
                address: '',
                phone: '',
                age: ''
            });
        }
        catch (error) {
            console.log(error);
            alert("Error while adding user");
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
                        <InputWithLabel
                            type="text"
                            name="name"
                            label="Name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        <InputWithLabel
                            type="email"
                            name="email"
                            label="Email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <InputWithLabel
                            type="text"
                            name="address"
                            label="Address"
                            id="address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                        <InputWithLabel
                            type="tel"
                            name="phone"
                            label="Phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                        <InputWithLabel
                            type="number"
                            name="age"
                            label="Age"
                            id="age"
                            value={formData.age}
                            onChange={handleInputChange}
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium mt-6"
                        >
                            Add User
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface InputWithLabelProps {
    type: string;
    name: string;
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputWithLabel({ type, name, label, id, value, onChange }: InputWithLabelProps) {
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export { InputWithLabel };