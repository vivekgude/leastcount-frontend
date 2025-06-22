import Head from 'next/head';
import AuthForm from '../components/authform';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { API_ROUTES } from '@/constants';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch(API_ROUTES.AUTH.SIGNUP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!res.ok) {
                throw new Error('Signup failed');
            }

            const data = await res.json();
            
            // Store the token, username and id
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.id.toString());
            router.push('/home'); // Redirect to home after successful signup
        } catch (error) {
            setError('Something went wrong. Please try again later.');
            console.error('Signup error:', error);
        }
    };

    return (
        <>
            <Head>
                <title>Sign Up</title>
            </Head>
            <AuthForm
                title="Create Account"
                buttonText="Register"
                onSubmit={handleSubmit}
                fields={[
                    {
                        label: 'Username',
                        id: 'username',
                        placeholder: 'Enter your username',
                        type: 'text',
                        value: formData.username,
                        onChange: handleChange,
                    },
                    {
                        label: 'Email',
                        id: 'email',
                        type: 'email',
                        placeholder: 'you@example.com',
                        value: formData.email,
                        onChange: handleChange,
                    },
                    {
                        label: 'Password',
                        id: 'password',
                        type: 'password',
                        placeholder: '••••••••',
                        value: formData.password,
                        onChange: handleChange,
                    },
                    {
                        label: 'Confirm Password',
                        id: 'confirmPassword',
                        type: 'password',
                        placeholder: '••••••••',
                        value: formData.confirmPassword,
                        onChange: handleChange,
                    },
                ]}
                footerText={
                    <>
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Login
                        </Link>
                    </>
                }
            />
            {error && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </>
    );
}
