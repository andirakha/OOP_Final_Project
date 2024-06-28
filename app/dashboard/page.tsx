'use client';

import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import { addToCart, fetchCartItems, fetchCarts, fetchProducts, getCartIdByUserId } from '@/lib/actions';

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

interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(categories);
  const [isSubcategoryView, setIsSubcategoryView] = useState<boolean>(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartId, setCartId] = useState<number | null>(null); // State untuk menyimpan cartId
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get('user');

        if (userCookie) {
          const decryptedUser = decryptData(userCookie);
          setUser(decryptedUser);

          // Ambil cartId setelah pengguna diambil
          const fetchedCartId = await getCartIdByUserId(decryptedUser.id);
          setCartId(fetchedCartId); // Set cartId ke dalam state
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

  useEffect(() => {
    if (cartId !== null) {
      const fetchAllCartItems = async () => {
        try {
          const fetchedCartItems = await fetchCartItems();
          if (fetchedCartItems) {
            const filteredCartItems = fetchedCartItems.filter(item => item.cartId === cartId);
            setCartItems(filteredCartItems);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      };

      fetchAllCartItems();
    }
  }, [cartId]); // Tambahkan cartId

  if (!user) {
    return null;
  }

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
    setSelectedProduct(null);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10); // Ubah nilai kuantitas menjadi integer
    setQuantity(value >= 1 ? value : 1); // Pastikan nilai kuantitas tidak kurang dari 1
  };

  const handleAddToCart = () => {
    if (selectedProduct && cartId) {
      addToCart(selectedProduct.id, quantity, user.id, cartId)
        .then((cart) => {
          if (cart) {
            console.log('Produk berhasil ditambahkan ke keranjang:', cart);
            setIsSuccess(true);
            // Update cartItems state dengan item baru
            setCartItems(prevCartItems => [
              ...prevCartItems,
              {
                id: cart.id,
                cartId: cartId,
                productId: selectedProduct.id,
                quantity: quantity
              }
            ]);
            setSelectedProduct(null); // Reset produk terpilih setelah ditambahkan
          } else {
            console.error('Gagal menambahkan produk ke keranjang: Cart is null');
            setIsSuccess(false);
            setErrorMessage('Gagal menambahkan produk ke keranjang. Silakan coba lagi.');
          }
        })
        .catch((error) => {
          console.error('Gagal menambahkan produk ke keranjang:', error);
          setIsSuccess(false);
          setErrorMessage('Gagal menambahkan produk ke keranjang. Silakan coba lagi.');
        });
    } else {
      console.error('Produk tidak valid untuk ditambahkan ke keranjang');
      setIsSuccess(false);
      setErrorMessage('Produk tidak valid untuk ditambahkan ke keranjang');
    }
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(product => product.id === item.productId);
      return total + ((product?.price ?? 0) * item.quantity);
    }, 0);
  };  

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
              selectedProduct ? (
                // Tampilkan detail produk jika produk dipilih
                <div className="w-full bg-gray-100 p-5 rounded-lg">
                  <div className="flex items-start">
                    {/* Gambar di atas kiri */}
                    <div className="relative h-40 w-1/3">
                      <img
                        src={selectedProduct.img_src}
                        alt={selectedProduct.name}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    {/* Konten di sebelah kanan */}
                    <div className="ml-5 flex-1">
                      {/* Nama produk, harga, dan deskripsi */}
                      <div className="mb-4 bg-white rounded-lg p-4">
                        <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                        <p className="text-gray-600 mb-2">Harga: Rp {selectedProduct.price.toLocaleString()}</p>
                        <p className="text-sm mb-4" style={{ textAlign: 'justify' }}>{selectedProduct.description}</p>

                        {/* Input kuantitas */}
                        <div className="flex items-center mb-4">
                          <label htmlFor="quantity" className="mr-2">Kuantitas:</label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="border border-gray-300 rounded-md px-2 py-1 w-20"
                          />
                        </div>
                        {isSuccess !== null && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
          {isSuccess ? 'Produk berhasil ditambahkan ke keranjang' : errorMessage}
          <button className="ml-2 text-sm" onClick={() => { setIsSuccess(null); setErrorMessage(''); }}>Tutup</button>
        </div>
      )}
                        {/* Tombol tambah ke keranjang */}
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                          onClick={handleAddToCart}
                        >
                          Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Tampilkan produk jika tidak ada produk yang dipilih
                displayedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="w-1/3 text-center border border-gray-300 rounded-lg p-3 bg-white cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative h-40">
                      <img
                        src={product.img_src}
                        alt={product.name}
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-2">{product.name}</p>
                  </div>
                ))
              )
            ) : (
              // Tampilkan kategori jika tidak ada produk yang ditampilkan
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
              {cartItems.map(item => {
  const product = products.find(product => product.id === item.productId);
  return (
    <tr key={item.id} className="border">
      <td className="border border-black px-4 py-2">{item.productId}</td>
      <td className="border border-black px-4 py-2">{product ? product.name : 'N/A'}</td>
      <td className="border border-black px-4 py-2">{product ? product.price : 'N/A'}</td>
      <td className="border border-black px-4 py-2">{item.quantity}</td>
      <td className="border border-black px-4 py-2">{(product?.price ?? 0) * (item?.quantity ?? 0)}</td>
    </tr>
  );
})}
                <tr className="border-t border-black pt-2 mt-2 font-bold">
                  <td colSpan={4} className="text-right px-4 py-2">Total:</td>
                  <td className="border border-black px-4 py-2">{calculateTotal()}</td>
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
