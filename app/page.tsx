"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  MapPin,
  ShieldCheck,
  CreditCard,
  Star,
  Package2,
  Lock,
  User,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

export default function Page() {
  const defaultProducts: Product[] = [
    {
      id: 1,
      name: "Luxury Blue Bag",
      price: 4999,
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/020/221/141/small_2x/1514-blue-bag-isolated-on-a-transparent-background-photo.jpg",
      category: "Fashion",
    },

    {
      id: 2,
      name: "Gaming Headset",
      price: 2999,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200&auto=format&fit=crop",
      category: "Gaming",
    },

    {
      id: 3,
      name: "Smart Watch",
      price: 7999,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
      category: "Wearables",
    },
  ];

  const [products, setProducts] = useState<Product[]>(defaultProducts);

  const [cart, setCart] = useState<Product[]>([]);

  const [adminOpen, setAdminOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [login, setLogin] = useState({
    username: "",
    password: "",
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
  });

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  useEffect(() => {
    const savedProducts = localStorage.getItem("products");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleFakePayment = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    const receiptWindow = window.open("", "_blank");

    if (!receiptWindow) return;

    const itemsHTML = cart
      .map(
        (item) => `
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span>${item.name}</span>
        <span>₱${item.price.toLocaleString()}</span>
      </div>
    `,
      )
      .join("");

    receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>

        <style>
          body{
            font-family:Arial;
            padding:40px;
            background:#f4f4f4;
          }

          .receipt{
            max-width:500px;
            margin:auto;
            background:white;
            padding:30px;
            border-radius:20px;
            box-shadow:0 10px 30px rgba(0,0,0,0.1);
          }

          h1{
            text-align:center;
            margin-bottom:10px;
          }

          .line{
            border-top:1px dashed #ccc;
            margin:20px 0;
          }

          .total{
            display:flex;
            justify-content:space-between;
            font-size:24px;
            font-weight:bold;
            margin-top:20px;
          }

          .success{
            text-align:center;
            color:green;
            font-weight:bold;
            margin-top:20px;
            font-size:20px;
          }
        </style>
      </head>

      <body>
        <div class="receipt">
          <h1>Adz Receipt</h1>

          <p style="text-align:center;color:gray;">
            Demo Ecommerce Transaction
          </p>

          <div class="line"></div>

          ${itemsHTML}

          <div class="line"></div>

          <div class="total">
            <span>Total</span>
            <span>₱${total.toLocaleString()}</span>
          </div>

          <div class="success">
            Payment Successful ✅
          </div>
        </div>
      </body>
    </html>
  `);

    receiptWindow.document.close();

    setCart([]);
  };

  const adminLogin = () => {
    if (login.username === "admin" && login.password === "admin") {
      setIsAdmin(true);
    } else {
      alert("Wrong credentials");
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert("Please fill all fields");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      image: newProduct.image,
      category: newProduct.category,
    };

    setProducts([...products, product]);

    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "",
    });
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="min-h-screen font-mono bg-[#0B0F19] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-linear-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              ADZ
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAdminOpen(true)}
              className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl hover:bg-white/20 transition flex items-center gap-2"
            >
              <ShieldCheck size={18} />
              Admin
            </button>

            <div className="relative">
              <div className="bg-cyan-500 p-3 rounded-2xl">
                <ShoppingCart size={20} />
              </div>

              <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-7xl md:text-8xl font-black leading-none">
            ADZ
            <span className="block bg-linear-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mt-4">
              Store
            </span>
          </h1>

          <div className="flex items-center justify-center gap-5 mt-10">
            <a
              href="#products"
              className="bg-cyan-500 hover:bg-cyan-400 px-8 py-4 rounded-2xl font-bold text-lg transition"
            >
              Explore Products
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div id="products" className="flex items-center justify-between mb-14">
          <div>
            <h2 className="text-5xl font-black">Featured Products</h2>

            <p className="text-gray-400 mt-3">
              Premium products for modern lifestyle
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
            <span className="text-cyan-400 font-bold">{products.length}</span>{" "}
            Products
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white/5 border border-white/10 backdrop-blur-xl rounded-[30px] overflow-hidden hover:scale-[1.02] transition duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  className="w-full h-87.5 object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              <div className="p-7">
                <div className="flex items-center justify-between">
                  <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-bold">
                    {product.category}
                  </span>

                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    4.9
                  </div>
                </div>

                <h2 className="text-3xl font-black mt-5">{product.name}</h2>

                <div className="flex items-center justify-between mt-8">
                  <h3 className="text-4xl font-black">
                    ₱{product.price.toLocaleString()}
                  </h3>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-cyan-500 hover:bg-cyan-400 px-6 py-4 rounded-2xl font-bold transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAP */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white/5 border border-white/10 rounded-[35px] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex items-center gap-3">
            <MapPin className="text-cyan-400" />
            <h2 className="text-3xl font-black">Store Location</h2>
          </div>

          <iframe
            src="https://maps.google.com/maps?q=silay%20city&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-125"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-white/5 border border-white/10 rounded-[35px] p-10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-5xl font-black">Your Cart</h2>

            <div className="text-3xl font-black text-cyan-400">
              ₱{total.toLocaleString()}
            </div>
          </div>

          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <img
                    src={item.image}
                    className="w-24 h-24 object-cover rounded-2xl"
                  />

                  <div>
                    <h3 className="text-2xl font-bold">{item.name}</h3>

                    <p className="text-gray-400">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <h2 className="text-2xl font-black">
                    ₱{item.price.toLocaleString()}
                  </h2>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 hover:bg-red-400 p-4 rounded-2xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleFakePayment}
            className="w-full mt-10 bg-linear-to-r from-cyan-500 to-blue-500 py-6 rounded-3xl text-2xl font-black hover:scale-[1.01] transition flex items-center justify-center gap-3"
          >
            <CreditCard />
            Checkout
          </button>
        </div>
      </section>

      {adminOpen && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-[#111827] border border-white/10 rounded-[35px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-4xl font-black">Admin Dashboard</h2>

              <button
                onClick={() => setAdminOpen(false)}
                className="bg-red-500 p-3 rounded-2xl"
              >
                <X />
              </button>
            </div>

            {!isAdmin ? (
              <div className="p-10">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-10">
                    <Lock size={70} className="mx-auto text-cyan-400 mb-5" />

                    <h3 className="text-3xl font-black">Admin Login</h3>

                    <p className="text-gray-400 mt-3">
                      Demo credentials: admin/admin
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400" />

                      <input
                        type="text"
                        placeholder="Username"
                        value={login.username}
                        onChange={(e) =>
                          setLogin({
                            ...login,
                            username: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-14 outline-none"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 text-gray-400" />

                      <input
                        type="password"
                        placeholder="Password"
                        value={login.password}
                        onChange={(e) =>
                          setLogin({
                            ...login,
                            password: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-14 outline-none"
                      />
                    </div>

                    <button
                      onClick={adminLogin}
                      className="w-full bg-linear-to-r from-cyan-500 to-blue-500 py-5 rounded-2xl font-black text-lg"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10">
                <div className="grid md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        image: e.target.value,
                      })
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 outline-none"
                  />
                </div>

                <button
                  onClick={addProduct}
                  className="mt-6 bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-5 rounded-2xl font-black flex items-center gap-3"
                >
                  <Plus />
                  Add Product
                </button>

                <div className="mt-10 space-y-5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <img
                          src={product.image}
                          className="w-24 h-24 rounded-2xl object-cover"
                        />

                        <div>
                          <h3 className="text-2xl font-bold">{product.name}</h3>

                          <p className="text-gray-400">{product.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <h3 className="text-2xl font-black">
                          ₱{product.price.toLocaleString()}
                        </h3>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="bg-red-500 p-4 rounded-2xl"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="py-10 text-center border-t border-white/10 mt-20">
        <div className="flex items-center justify-center gap-3">
          <Package2 className="text-cyan-400" />

          <h2 className="text-3xl font-black">ADZ STORE</h2>
        </div>

        <p className="text-gray-500 mt-4">
          Ecommerce Demo • Next.js • Tailwind • Local Storage
        </p>
      </footer>
    </div>
  );
}
