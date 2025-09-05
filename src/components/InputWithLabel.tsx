
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
        <div className="space-y-1">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                value={value}
                onChange={onChange}
                placeholder={`Enter ${label.toLowerCase()}`}
            />
        </div>
    );
}

export { InputWithLabel }