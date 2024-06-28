'use client';

import { useState, useEffect } from 'react';
import { loginUser, checkIdCart } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import Navbar from '@/components/navbar';

// Fungsi untuk mengenkripsi data sebelum disimpan ke cookie
const encryptData = (data: any): string => {
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret_key').toString();
  return encryptedData;
};

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const {user} = await loginUser(username, password);
      const encryptedUser = encryptData(user);
      Cookies.set('user', encryptedUser, { expires: 1 }); // Simpan data pengguna di cookie selama 1 hari
      await checkIdCart(username);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed');
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const decryptedUser = decryptData(userCookie);
          // Jika user ada, langsung arahkan ke halaman Dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Handle error, misalnya dengan menampilkan pesan kesalahan atau melakukan tindakan lainnya
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
        <Navbar />
        <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" /> */}
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Login to your account
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    id="username"
                                    name="username"
                                    required
                                    style={{ paddingLeft: '10px' }}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id="password"
                                    name="password"
                                    required
                                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        {error && (
                          <div className="text-red-500 text-sm">
                            {error}
                          </div>
                        )}
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Log In
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            Not registered? <a href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">Sign up</a>
                          </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;
