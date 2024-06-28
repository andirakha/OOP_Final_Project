'use client';

import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import { getProducts } from '@/lib/data';
import { fetchProducts } from '@/lib/actions';

interface Category {
  src: string;
  alt: string;
  text: string;
}

interface Subcategory {
  category: string;
  text: string;
}

interface Product {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  description: string | null;
  price: number;
  img_src: string;
  stock: number;
}


const categories: Category[] = [
  { src: '/pictures/category/bahan_makanan.jpeg', alt: 'Bahan Makanan', text: 'Bahan Makanan' },
  { src: '/pictures/category/peralatan_rumah_tangga.jpeg', alt: 'Peralatan Rumah Tangga', text: 'Peralatan Rumah Tangga' },
  { src: '/pictures/category/produk_kebersihan.jpeg', alt: 'Produk Kebersihan', text: 'Produk Kebersihan' },
  { src: '/pictures/category/produk_perawatan_diri.jpeg', alt: 'Produk Perawatan Diri', text: 'Produk Perawatan Diri' },
  { src: '/pictures/category/elektronik_rumah_tangga.webp', alt: 'Elektronik Rumah Tangga', text: 'Elektronik Rumah Tangga' },
  { src: '/pictures/category/pakaian_dan_aksesoris.jpeg', alt: 'Pakaian dan Aksesoris', text: 'Pakaian dan Aksesoris' },
  { src: '/pictures/category/perlengkapan_anak.jpeg', alt: 'Perlengkapan Anak', text: 'Perlengkapan Anak' },
  { src: '/pictures/category/kesehatan.jpeg', alt: 'Kesehatan', text: 'Kesehatan' },
  { src: '/pictures/category/peralatan_tulis_dan_kantor.jpeg', alt: 'Peralatan Tulis dan Kantor', text: 'Peralatan Tulis dan Kantor' }
];

const subcategories: { [key: string]: Subcategory[] } = {
  'Bahan Makanan': [
    { category: 'Bahan Makanan', text: 'Makanan Pokok' },
    { category: 'Bahan Makanan', text: 'Makanan Siap Saji' },
    { category: 'Bahan Makanan', text: 'Minuman' },
    { category: 'Bahan Makanan', text: 'Bumbu dan Rempah' }
  ],
  'Peralatan Rumah Tangga': [
    { category: 'Peralatan Rumah Tangga', text: 'Peralatan Dapur' },
    { category: 'Peralatan Rumah Tangga', text: 'Peralatan Makan' },
    { category: 'Peralatan Rumah Tangga', text: 'Peralatan Kebersihan' }
  ],
  'Produk Kebersihan': [
    { category: 'Produk Kebersihan', text: 'Kebersihan Pribadi' },
    { category: 'Produk Kebersihan', text: 'Kebersihan Rumah' }
  ],
  'Produk Perawatan Diri': [
    { category: 'Produk Perawatan Diri', text: 'Skincare' },
    { category: 'Produk Perawatan Diri', text: 'Haircare' }
  ],
  'Elektronik Rumah Tangga': [
    { category: 'Elektronik Rumah Tangga', text: 'Elektronik Dapur' },
    { category: 'Elektronik Rumah Tangga', text: 'Elektronik Kebersihan' },
    { category: 'Elektronik Rumah Tangga', text: 'Elektronik Hiburan' }
  ],
  'Pakaian dan Aksesoris': [
    { category: 'Pakaian dan Aksesoris', text: 'Pakaian Pria' },
    { category: 'Pakaian dan Aksesoris', text: 'Pakaian Wanita' },
    { category: 'Pakaian dan Aksesoris', text: 'Aksesoris' }
  ],
  'Perlengkapan Anak': [
    { category: 'Perlengkapan Anak', text: 'Makanan dan Minuman Anak' },
    { category: 'Perlengkapan Anak', text: 'Mainan' },
    { category: 'Perlengkapan Anak', text: 'Pakaian Anak' }
  ],
  'Kesehatan': [
    { category: 'Kesehatan', text: 'Obat-obatan' },
    { category: 'Kesehatan', text: 'Alat Kesehatan' }
  ],
  'Peralatan Tulis dan Kantor': [
    { category: 'Peralatan Tulis dan Kantor', text: 'Alat Tulis' },
    { category: 'Peralatan Tulis dan Kantor', text: 'Peralatan Kantor' }
  ]
};

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

const formatTwoDigits = (num: number): string => {
  return num.toString().padStart(2, '0');
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(categories);
  const [isSubcategoryView, setIsSubcategoryView] = useState<boolean>(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get('user');

        if (userCookie) {
          const decryptedUser = decryptData(userCookie);
          setUser(decryptedUser);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/auth/login');
      }
    };

    const fetchAllProducts = async () => {
      try {
      const fetchedProducts = await fetchProducts();
      if (fetchedProducts) {
        setProducts(fetchedProducts);
      } 
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      const formattedTime = `${formatTwoDigits(now.getHours())}:${formatTwoDigits(now.getMinutes())}:${formatTwoDigits(now.getSeconds())}`;
      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    }, 1000);

    fetchUser();
    fetchAllProducts();
    

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return null;
  }

  // const calculateTotal = () => {
  //   let total = 0;
  //   products.forEach(product => {
  //     total += product.price * product.quantity;
  //   });
  //   return total;
  // };

  const handleCategoryClick = (category: string) => {
    if (!isSubcategoryView) {
      const subcategoryItems = subcategories[category].map(subcat => ({
        src: `/pictures/subcategory/${subcat.text.toLowerCase().replace(/ /g, '_')}.jpeg`,
        alt: subcat.text,
        text: subcat.text
      }));
      setDisplayedCategories(subcategoryItems);
      setIsSubcategoryView(true);
    } else {
      const filteredProducts = products.filter((product) => product.subcategory === category);
      setDisplayedProducts(filteredProducts);
    }
  };

  const handleBackToCategories = () => {
    setDisplayedCategories(categories);
    setIsSubcategoryView(false);
    setDisplayedProducts([]);
  };

  const total = 0;

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen font-sans">
        <div className="flex flex-wrap justify-center w-full max-w-6xl mx-auto mt-5">
          <div className="flex-1 flex flex-wrap gap-5 justify-around bg-gray-100 p-5 rounded-lg">
            {isSubcategoryView && (
              <div className="w-full text-center mb-5">
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  onClick={handleBackToCategories}
                >
                  Back to Categories
                </button>
              </div>
            )}
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => (
                <div
                  key={index}
                  className="w-1/3 text-center border border-gray-300 rounded-lg p-3 bg-white"
                >
                  <div className="relative h-40">
                    <Image
                      src={product.img_src}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <p className="mt-2">{product.name}</p>
                </div>
              ))
            ) : (
              displayedCategories.map((item, index) => (
                <div
                  key={index}
                  className="w-1/3 text-center border border-gray-300 rounded-lg p-3 bg-white cursor-pointer"
                  onClick={() => handleCategoryClick(item.text)}
                >
                  <div className="relative h-40">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <p className="mt-2">{item.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex-1 bg-gray-100 p-5 rounded-lg ml-5">
            <h3 className="font-bold">Receipt</h3>
            <p className="my-1">Date: {currentDate}</p>
            <p className="my-1">Time: {currentTime}</p>
            <p className="my-1">User ID: {user.id}</p>
            <p className="my-1">Name: {user.username}</p>
            <table className="my-5 w-full border-collapse border border-black bg-white">
              <thead>
                <tr className="border">
                  <th className="border border-black px-4 py-2">ID Product</th>
                  <th className="border border-black px-4 py-2">Nama Product</th>
                  <th className="border border-black px-4 py-2">Harga</th>
                  <th className="border border-black px-4 py-2">Kuantitas</th>
                  <th className="border border-black px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                  <tr className="border">
                    <td className="border border-black px-4 py-2">ID</td>
                    <td className="border border-black px-4 py-2">Name</td>
                    <td className="border border-black px-4 py-2">Price</td>
                    <td className="border border-black px-4 py-2">Quantity</td>
                    <td className="border border-black px-4 py-2">Price</td>
                  </tr>
     
                <tr className="border-t border-black pt-2 mt-2 font-bold">
                  <td colSpan={4} className="text-right px-4 py-2">Total:</td>
                  <td className="border border-black px-4 py-2">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
