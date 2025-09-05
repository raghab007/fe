import { useState } from "react";
import { InputWithLabel } from "./InputWithLabel";
import type { IUser } from "../pages/User";
import { axiosInstance } from "../api/apis";


interface UpdateFormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    age: string;
}

function UpdateUserForm({ user }: { user: IUser }) {
    const [formData, setFormData] = useState<UpdateFormData>({
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        age: user.age.toString()
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function handleUpdateUser(event: React.FormEvent<HTMLFormElement>) {
        try {
            event.preventDefault();

            // Convert age back to number for API
            const updateData = {
                ...formData,
                age: parseInt(formData.age)
            };

            await axiosInstance.put(`/api/users/${user._id}`, updateData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            alert("User updated successfully!");
            window.location.reload();
        } catch (error) {
            console.log(error);
            alert("Error while updating user");
        }
    }

    return (
        <form onSubmit={handleUpdateUser} className="space-y-4">
            <InputWithLabel
                type="text"
                name="name"
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
            />
            <InputWithLabel
                type="email"
                name="email"
                label="Email Address"
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
                label="Phone Number"
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
                Update User
            </button>
        </form>
    );
}


export { UpdateUserForm }