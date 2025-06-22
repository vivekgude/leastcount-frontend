import Head from 'next/head';
import AuthForm from '../components/authform';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { API_ROUTES } from '@/constants';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      // Store the token, username and id
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.id.toString());
      router.push('/home'); // Redirect to home after successful login
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={handleSubmit}
        fields={[
          { 
            label: 'Username', 
            id: 'username', 
            type: 'text', 
            placeholder: 'Enter your username',
            value: formData.username,
            onChange: handleChange
          },
          { 
            label: 'Password', 
            id: 'password', 
            type: 'password', 
            placeholder: '••••••••',
            value: formData.password,
            onChange: handleChange
          },
        ]}
        footerText={
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
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
