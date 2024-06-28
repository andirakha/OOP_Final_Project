'use client';

import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import { addToCart, checkout, fetchCartItems, fetchCarts, fetchProducts, getCartIdByUserId } from '@/lib/actions';

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

const ShoppingCart: React.FC = () => {
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
  
    const handleQuantityChange = (index: number, amount: number) => {
        const updatedCartItems = [...cartItems]; // Salin array cartItems ke variabel baru
        const updatedItem = { ...updatedCartItems[index] }; // Salin item yang ingin diubah
      
        // Ubah kuantitas item sesuai dengan jumlah yang ditentukan
        updatedItem.quantity += amount;
      
        // Pastikan kuantitas tidak kurang dari 1
        if (updatedItem.quantity < 1) {
          updatedItem.quantity = 1;
        }
      
        // Perbarui array cartItems dengan item yang telah diubah
        updatedCartItems[index] = updatedItem;
      
        // Perbarui state cartItems
        setCartItems(updatedCartItems);
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
    <div className="relative z-10 after:bg-gray-50">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-12">
          <div className="col-span-12 xl:col-span-8 lg:pr-8 pt-14 pb-8 lg:py-24 w-full max-xl:max-w-3xl max-xl:mx-auto">
            <div className="flex items-center justify-between pb-8 border-b border-gray-300">
              <h2 className="font-manrope font-bold text-3xl leading-10 text-black">Shopping Cart</h2>
              <h2 className="font-manrope font-bold text-xl leading-8 text-gray-600">{cartItems.length} Items</h2>
            </div>
            <div className="grid grid-cols-12 mt-8 max-md:hidden pb-6 border-b border-gray-200">
              <div className="col-span-12 md:col-span-7">
                <p className="font-normal text-lg leading-8 text-gray-400">Product Details</p>
              </div>
              <div className="col-span-12 md:col-span-5">
                <div className="grid grid-cols-5">
                  <div className="col-span-3">
                    <p className="font-normal text-lg leading-8 text-gray-400 text-center">Quantity</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-normal text-lg leading-8 text-gray-400 text-center">Total</p>
                  </div>
                </div>
              </div>
            </div>
            {cartItems.map((item, index) => {
  const product = products.find(product => product.id === item.productId);

  return (
    <div key={index} className="flex flex-col md:flex-row items-start gap-5 py-6 border-b border-gray-200 group">
      <div className="w-full md:max-w-[100px]">
        <Image src={product ? product.img_src : 'N/A'} alt={product ? product.name : 'N/A'} width={126} height={126} className="mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 w-full">
        <div className="md:col-span-2">
          <div className="flex flex-col max-[500px] items-center gap-3">
            <h6 className="font-semibold text-base leading-7 text-black">{product ? product.name : 'N/A'}</h6>
            <h6 className="font-medium text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-indigo-600">{product ? product.price : 'N/A'} IDR</h6>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end space-x-3 md:col-span-2 mr-6">
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(index, -1)}
              className="group rounded-l-xl px-5 py-[18px] border border-gray-200 flex items-center justify-center shadow-sm shadow-transparent transition-all duration-500 hover:bg-gray-50 hover:border-gray-300 hover:shadow-gray-300 focus-within:outline-gray-300"
            >
              <svg
                className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path d="M16.5 11H5.5" stroke="" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="text"
              value={item.quantity}
              readOnly
              className="border-y border-gray-200 outline-none text-gray-900 font-semibold text-lg w-full max-w-[73px] min-w-[60px] placeholder:text-gray-900 py-[15px] text-center bg-transparent"
            />
            <button
              onClick={() => handleQuantityChange(index, 1)}
              className="group rounded-r-xl px-5 py-[18px] border border-gray-200 flex items-center justify-center shadow-sm shadow-transparent transition-all duration-500 hover:bg-gray-50 hover:border-gray-300 hover:shadow-gray-300 focus-within:outline-gray-300"
            >
              <svg
                className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path d="M11 5.5V16.5M16.5 11H5.5" stroke="" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <p className="font-bold text-lg leading-8 text-gray-600 text-center transition-all duration-300 group-hover:text-indigo-600">{(product?.price ?? 0) * (item?.quantity ?? 0)} IDR</p>
          </div>
        </div>
      </div>
    </div>
  );
})}



   
          </div>
          <div className="col-span-12 xl:col-span-4 bg-gray-50 w-full max-xl:px-6 max-w-3xl xl:max-w-lg mx-auto lg:pl-8 py-24">
            <h2 className="font-manrope font-bold text-3xl leading-10 text-black pb-8 border-b border-gray-300">
              Order Summary
            </h2>
            <div className="mt-8">
              <div className="flex items-center justify-between pb-6">
                <p className="font-normal text-lg leading-8 text-black">{cartItems.length} Items</p>
                <p className="font-medium text-lg leading-8 text-black">{calculateTotal()} IDR</p>
              </div>
              <div className="flex items-center justify-between pt-8 pb-8 border-b border-gray-300">
                <p className="font-normal text-lg leading-8 text-black">Discount</p>
                <p className="font-medium text-lg leading-8 text-black">-0 IDR</p>
              </div>
              <div className="flex items-center justify-between pt-8 pb-8 border-b border-gray-300">
                <p className="font-normal text-lg leading-8 text-black">Subtotal</p>
                <p className="font-medium text-lg leading-8 text-black">{calculateTotal() - 0} IDR</p>
              </div>
              <div className="flex items-center justify-between pt-8">
                <p className="font-semibold text-xl leading-8 text-black">Order Total</p>
                <p className="font-bold text-xl leading-8 text-black">{calculateTotal()} IDR</p>
              </div>
              <button
  type="button"
  className="mt-8 inline-flex items-center justify-center py-4 px-6 font-semibold text-base text-white bg-indigo-600 rounded-lg transition-all duration-300 shadow-sm hover:bg-indigo-700"
  onClick={() => {
    // Pastikan cartId tidak null sebelum memanggil checkout
    if (cartId !== null) {
      try {
        checkout(cartId); // Panggil fungsi checkout dengan cartId yang sesuai
        router.push('/dashboard');
      } catch (error) {
        console.error('Error with checkout');
      }
        
    } else {
      console.error('cartId is null, cannot proceed with checkout.');
    }
  }}
>
  Proceed to Checkout
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;