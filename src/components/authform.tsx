import React from 'react';
import InputField from './inputfield';

interface Field {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AuthFormProps {
    title: string;
    fields: Field[];
    buttonText: string;
    footerText: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
}


const AuthForm: React.FC<AuthFormProps> = ({ title, fields, buttonText, footerText, onSubmit }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
            <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center drop-shadow-sm tracking-wide">
                {title}
            </h2>
            <form className="space-y-5" onSubmit={onSubmit}>
                {fields.map((field) => (
                    <InputField key={field.id} {...field} />
                ))}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    {buttonText}
                </button>
            </form>
            <p className="text-sm text-center text-gray-500 mt-4">{footerText}</p>
        </div>
    </div>
);

export default AuthForm;
