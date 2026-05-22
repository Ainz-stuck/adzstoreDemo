"use client";

import { useEffect, useState, useCallback } from "react";
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
  Check,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

// ── Toast Component ──────────────────────────────────────────────────────────
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border
            backdrop-blur-xl animate-toast
            ${toast.type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : ""}
            ${toast.type === "error" ? "bg-red-500/20 border-red-500/30 text-red-300" : ""}
            ${toast.type === "info" ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300" : ""}
          `}
        >
          {toast.type === "success" && <Check size={16} />}
          {toast.type === "error" && <AlertCircle size={16} />}
          {toast.type === "info" && <Zap size={16} />}
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 opacity-50 hover:opacity-100 transition"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  // ── Default data ────────────────────────────────────────────────────────
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
    {
      id: 4,
      name: "Wireless Keyboard",
      price: 3499,
      image:
        "https://keychron.co.nz/cdn/shop/files/Keychron-Q6-Ultra-8K-Wireless-Custom-Mechanical-Keyboard-White-Keychron-Silk-POM-Switch-Red.jpg?v=1772417219&width=1214",
      category: "Tech",
    },
    {
      id: 5,
      name: "Running Sneakers",
      price: 5299,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      category: "Footwear",
    },
    {
      id: 6,
      name: "Leather Wallet",
      price: 1899,
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
      category: "Accessories",
    },
  ];

  // ── State ────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<Product[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500
    );
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      // Always show all default products; append any admin-added extras on top
      const defaultIds = new Set(defaultProducts.map((p) => p.id));
      const extras = parsed.filter((p) => !defaultIds.has(p.id));
      setProducts([...defaultProducts, ...extras]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Cart logic ───────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    addToast(`${product.name} added to cart`, "success");
  };

  const removeFromCart = (id: number) => {
    const item = cart.find((i) => i.id === id);
    setCart(cart.filter((i) => i.id !== id));
    if (item) addToast(`${item.name} removed`, "info");
  };

  // ── Checkout ─────────────────────────────────────────────────────────────
  const handleFakePayment = () => {
    if (cart.length === 0) {
      addToast("Your cart is empty!", "error");
      return;
    }
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;

    const itemsHTML = cart
      .map(
        (item) => `
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="font-weight:500;color:#334155">${item.name}</span>
        <span style="font-weight:700;color:#0ea5e9">₱${item.price.toLocaleString()}</span>
      </div>`
      )
      .join("");

    receiptWindow.document.write(`
      <html>
        <head>
          <title>ADZ Receipt</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:'Montserrat',sans-serif;background:linear-gradient(135deg,#080C14,#111827);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
            .receipt{background:white;padding:44px;border-radius:28px;max-width:460px;width:100%;box-shadow:0 40px 80px rgba(0,0,0,0.5)}
            .brand{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:700;background:linear-gradient(135deg,#06b6d4,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;letter-spacing:0.05em}
            .subtitle{text-align:center;color:#94a3b8;font-size:13px;margin-top:6px}
            .divider{border:none;border-top:2px dashed #e2e8f0;margin:22px 0}
            .total{display:flex;justify-content:space-between;font-size:22px;font-weight:700;padding:14px 0;color:#0f172a}
            .success{text-align:center;background:#f0fdf4;border:2px solid #86efac;border-radius:16px;padding:18px;margin-top:20px;color:#16a34a;font-weight:700;font-size:15px}
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="brand">ADZ STORE</div>
            <div class="subtitle">Official Purchase Receipt</div>
            <hr class="divider">
            ${itemsHTML}
            <hr class="divider">
            <div class="total"><span>Total</span><span>₱${total.toLocaleString()}</span></div>
            <div class="success">✅ Payment Successful — Thank you!</div>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    setCart([]);
    setCartOpen(false);
    addToast("Order placed successfully!", "success");
  };

  // ── Admin logic ──────────────────────────────────────────────────────────
  const adminLogin = () => {
    if (login.username === "admin" && login.password === "admin") {
      setIsAdmin(true);
      addToast("Welcome back, Admin!", "success");
    } else {
      addToast("Invalid credentials", "error");
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      addToast("Please fill all required fields", "error");
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
    setNewProduct({ name: "", price: "", image: "", category: "" });
    addToast(`${product.name} added!`, "success");
  };

  const deleteProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    if (product) addToast(`${product.name} deleted`, "info");
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global styles & fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        *, body { font-family: 'Montserrat', sans-serif; }
        .font-display { font-family: 'Montserrat', sans-serif !important; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
          50%       { box-shadow: 0 0 0 14px rgba(6,182,212,0); }
        }
        @keyframes shimmer-move {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .animate-toast     { animation: toast-in 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-fade-up   { animation: fade-up  0.6s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-float     { animation: float 3.5s ease-in-out infinite; }
        .animate-pulse-ring{ animation: pulse-ring 2.2s ease-in-out infinite; }
        .animate-drawer    { animation: slide-in-right 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-modal     { animation: fade-up 0.35s cubic-bezier(0.4,0,0.2,1) both; }

        .shimmer-text {
          background: linear-gradient(90deg, #06b6d4 0%, #e0f7ff 45%, #06b6d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-move 4s linear infinite;
        }

        /* Glass utilities */
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Primary button */
        .btn-primary {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover::after  { opacity: 1; }
        .btn-primary:hover         { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(6,182,212,0.45); }
        .btn-primary:active        { transform: translateY(0); }

        /* Product card */
        .product-card { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s; }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 40px 70px rgba(6,182,212,0.14), 0 0 0 1px rgba(6,182,212,0.15);
        }

        /* Input focus */
        input:focus {
          border-color: rgba(6,182,212,0.5) !important;
          background: rgba(255,255,255,0.07) !important;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.25); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.45); }
      `}</style>

      <div className="min-h-screen bg-[#080C14] text-white overflow-x-hidden">

        {/* ── Ambient Background Orbs ─────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-24 w-[640px] h-[640px] rounded-full bg-cyan-500/[0.045] blur-[130px]" />
          <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] rounded-full bg-blue-600/[0.05] blur-[110px]" />
          <div className="absolute top-[45%] left-[45%] w-[380px] h-[380px] rounded-full bg-indigo-500/[0.035] blur-[100px]" />
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
            ${scrolled ? "glass border-b border-white/[0.07] py-3.5" : "bg-transparent py-5"}`}
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="font-display text-xl font-bold tracking-tight">
              <span className="shimmer-text">ADZ</span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
              {["Products", "Location", "Cart"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setAdminOpen(true)}
                className="glass px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70
                  hover:text-white hover:bg-white/8 transition-all duration-200 flex items-center gap-2"
                aria-label="Open admin dashboard"
              >
                <ShieldCheck size={15} className="text-cyan-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="relative btn-primary p-3 rounded-xl"
                aria-label={`Open cart (${cart.length} items)`}
              >
                <ShoppingCart size={17} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-bold
                    w-[18px] h-[18px] rounded-full flex items-center justify-center
                    border-2 border-[#080C14] animate-toast">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero Section ───────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover scale-105"
            style={{ filter: "saturate(0.5) brightness(0.8)" }}
            alt=""
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080C14]/60 via-[#080C14]/55 to-[#080C14]" />

          {/* Decorative floating dots */}
          <div className="absolute top-1/4 right-[28%] w-2 h-2 rounded-full bg-cyan-400/70 animate-float" style={{ animationDelay: "0s" }} aria-hidden />
          <div className="absolute top-[38%] left-[22%] w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-float" style={{ animationDelay: "1.2s" }} aria-hidden />
          <div className="absolute bottom-[32%] right-[35%] w-1 h-1 rounded-full bg-cyan-300/60 animate-float" style={{ animationDelay: "2.1s" }} aria-hidden />

          <div className="relative z-10 text-center max-w-5xl px-6 animate-fade-up">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 glass border border-cyan-500/25 px-4 py-2
              rounded-full text-[11px] font-bold text-cyan-400 mb-8 tracking-widest uppercase">
              <Sparkles size={11} />
              Premium E-Commerce Experience
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold leading-tight tracking-normal">
              <span className="block text-6xl md:text-7xl xl:text-8xl text-white">ADZ</span>
              <span className="block text-6xl md:text-7xl xl:text-8xl shimmer-text">STORE</span>
            </h1>

            <p className="text-white/45 text-base md:text-lg mt-8 max-w-sm mx-auto leading-relaxed font-medium">
              Curated premium products for the modern lifestyle. Quality meets style.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <a
                href="#products"
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-base
                  flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Explore Products
                <ChevronRight size={17} />
              </a>
              <button
                onClick={() => setCartOpen(true)}
                className="glass border border-white/12 px-8 py-4 rounded-2xl font-semibold text-base
                  hover:bg-white/8 transition-all duration-200 w-full sm:w-auto"
              >
                View Cart ({cart.length})
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-10 mt-16">
              {[
                { label: "Products", value: `${products.length}+` },
                { label: "Customers", value: "2K+" },
                { label: "Rating",    value: "4.9★" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/35 text-xs font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Badges ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-10" aria-label="Trust indicators">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <ShieldCheck size={19} className="text-cyan-400 flex-shrink-0" />, text: "Secure Payments" },
              { icon: <Zap         size={19} className="text-cyan-400 flex-shrink-0" />, text: "Fast Delivery" },
              { icon: <Star        size={19} className="text-cyan-400 flex-shrink-0" />, text: "Top Rated" },
              { icon: <Package2    size={19} className="text-cyan-400 flex-shrink-0" />, text: "Quality Guaranteed" },
            ].map((b) => (
              <div key={b.text} className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3">
                {b.icon}
                <span className="text-sm font-semibold text-white/65">{b.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Products Section ───────────────────────────────────────────── */}
        <section id="products" className="max-w-7xl mx-auto px-5 md:px-8 py-16" aria-label="Featured products">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-cyan-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                Our Collection
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug">
                Featured
                <span className="block text-white/35">Products</span>
              </h2>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl hidden md:flex items-center gap-2">
              <TrendingUp size={15} className="text-cyan-400" />
              <span className="text-sm font-semibold text-white/60">
                <span className="text-cyan-400">{products.length}</span> items
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            /* Empty products state */
            <div className="text-center py-24 glass-card rounded-[28px]">
              <Package2 size={52} className="mx-auto text-white/10 mb-5" />
              <h3 className="font-display text-xl font-bold text-white/30 mb-2">No products yet</h3>
              <p className="text-white/20 text-sm">Add products via the Admin panel</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {products.map((product, idx) => (
                <article
                  key={product.id}
                  className="product-card glass-card rounded-[28px] overflow-hidden group"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Product image */}
                  <div className="relative h-[280px] overflow-hidden bg-white/[0.03]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover CTA */}
                    <div className="absolute bottom-5 inset-x-0 flex justify-center
                      opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
                      transition-all duration-300">
                      <button
                        onClick={() => addToCart(product)}
                        className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus size={15} />
                        Add to Cart
                      </button>
                    </div>

                    {/* Category pill */}
                    <span className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white
                      px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase">
                      {product.category}
                    </span>
                  </div>

                  {/* Product info */}
                  <div className="p-6">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="#facc15" className="text-yellow-400" />
                      ))}
                      <span className="text-white/30 text-[11px] ml-2">4.9 (128)</span>
                    </div>

                    <h3 className="font-display text-lg font-semibold mb-5 group-hover:text-cyan-400
                      transition-colors duration-200 leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-1">
                          Price
                        </p>
                        <p className="font-display text-2xl font-bold">
                          ₱{product.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Mobile add button (visible; desktop hover CTA handles it) */}
                      <button
                        onClick={() => addToCart(product)}
                        className="btn-primary w-11 h-11 rounded-xl flex items-center justify-center
                          md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0
                          transition-all duration-300"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Map Section ────────────────────────────────────────────────── */}
        <section id="location" className="max-w-7xl mx-auto px-5 md:px-8 py-16" aria-label="Store location">
          <div className="glass-card rounded-[32px] overflow-hidden">
            <div className="p-7 md:p-8 flex items-center justify-between border-b border-white/[0.07]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/15 rounded-2xl flex items-center justify-center">
                  <MapPin className="text-cyan-400" size={21} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Store Location</h2>
                  <p className="text-white/35 text-sm mt-0.5">Silay City, Philippines</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Open Now
              </div>
            </div>
            <iframe
              src="https://maps.google.com/maps?q=silay%20city&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-96 md:h-[480px]"
              title="Store location map"
            />
          </div>
        </section>

        {/* ── Cart Section ───────────────────────────────────────────────── */}
        <section id="cart" className="max-w-7xl mx-auto px-5 md:px-8 py-16" aria-label="Shopping cart">
          <div className="glass-card rounded-[32px] p-7 md:p-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold">Your Cart</h2>
                <p className="text-white/35 text-sm mt-1.5">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in bag
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1">Total</p>
                <p className="font-display text-2xl md:text-3xl font-bold text-cyan-400">
                  ₱{total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Empty state */}
            {cart.length === 0 && (
              <div className="text-center py-20" role="status" aria-label="Empty cart">
                <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <ShoppingCart size={30} className="text-white/15" />
                </div>
                <h3 className="font-display text-xl font-bold text-white/30 mb-2">Your cart is empty</h3>
                <p className="text-white/20 text-sm">Add some products to get started</p>
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm font-semibold mt-6"
                >
                  Browse Products <ChevronRight size={15} />
                </a>
              </div>
            )}

            {/* Cart items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:border-white/14 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-base">{item.name}</h3>
                    <span className="text-cyan-400/60 text-xs font-semibold mt-0.5 block">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className="font-display font-semibold text-lg hidden sm:block">
                      ₱{item.price.toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-10 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/20
                        rounded-xl flex items-center justify-center transition-all duration-200
                        text-red-400 hover:text-white"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout block */}
            {cart.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/[0.07]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-10 text-white/40">
                      <span>Subtotal</span><span>₱{total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-10 text-white/40">
                      <span>Shipping</span>
                      <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleFakePayment}
                  className="w-full btn-primary py-4 rounded-2xl text-base font-semibold
                    flex items-center justify-center gap-3"
                  aria-label={`Checkout for ₱${total.toLocaleString()}`}
                >
                  <CreditCard size={19} />
                  Checkout — ₱{total.toLocaleString()}
                </button>
                <p className="text-center text-white/20 text-xs mt-4 flex items-center justify-center gap-1.5">
                  <Lock size={11} />
                  Secured with 256-bit SSL encryption
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] mt-6">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row
            items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center">
                <Package2 size={17} />
              </div>
              <div>
                <p className="font-display text-base font-bold leading-tight">ADZ STORE</p>
                <p className="text-white/25 text-xs">Premium E-Commerce</p>
              </div>
            </div>

            <p className="text-white/20 text-sm text-center">
              Built with Next.js • TypeScript • Tailwind CSS
            </p>

            <nav className="flex items-center gap-5 text-white/25 text-sm" aria-label="Footer navigation">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <a key={link} href="#" className="hover:text-white/60 transition-colors">{link}</a>
              ))}
            </nav>
          </div>
        </footer>

        {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
        {cartOpen && (
          <div className="fixed inset-0 z-[100] flex" role="dialog" aria-label="Cart drawer" aria-modal>
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/55 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />

            {/* Drawer panel */}
            <div className="w-full max-w-[380px] bg-[#0C1120] border-l border-white/[0.08]
              flex flex-col animate-drawer shadow-2xl">
              {/* Drawer header */}
              <div className="p-6 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-display text-xl font-bold">Cart</h2>
                  <p className="text-white/30 text-xs mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="glass p-2.5 rounded-xl hover:bg-white/8 transition"
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart size={44} className="mx-auto text-white/8 mb-4" />
                    <p className="text-white/25 font-semibold text-sm">Nothing here yet</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="font-display text-cyan-400 font-semibold text-base mt-0.5">
                          ₱{item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400/60 hover:text-red-400 transition p-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer checkout */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-white/[0.07] flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50 text-sm font-medium">Total</span>
                    <span className="font-display text-xl font-bold text-cyan-400">
                      ₱{total.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleFakePayment}
                    className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <CreditCard size={19} />
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Admin Modal ─────────────────────────────────────────────────── */}
        {adminOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog" aria-label="Admin dashboard" aria-modal
          >
            <div className="bg-[#0C1120] border border-white/[0.09] rounded-[32px] w-full max-w-3xl
              max-h-[90vh] overflow-hidden flex flex-col animate-modal shadow-[0_40px_100px_rgba(0,0,0,0.6)]">

              {/* Modal header */}
              <div className="p-6 md:p-8 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 btn-primary rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">Admin Dashboard</h2>
                    <p className="text-white/30 text-xs mt-0.5">{products.length} products total</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAdminOpen(false); setIsAdmin(false); setLogin({ username: "", password: "" }); }}
                  className="glass p-2.5 rounded-xl border border-transparent
                    hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                  aria-label="Close admin panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1">
                {!isAdmin ? (
                  /* ── Login form ── */
                  <div className="p-8 md:p-12">
                    <div className="max-w-[320px] mx-auto">
                      <div className="text-center mb-10">
                        <div className="w-20 h-20 btn-primary rounded-3xl flex items-center justify-center
                          mx-auto mb-6 animate-pulse-ring">
                          <Lock size={30} />
                        </div>
                        <h3 className="font-display text-2xl font-bold">Admin Login</h3>
                        <p className="text-white/30 text-sm mt-2">
                          Demo: <span className="text-cyan-400 font-semibold">admin / admin</span>
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                          <input
                            type="text"
                            placeholder="Username"
                            value={login.username}
                            onChange={(e) => setLogin({ ...login, username: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && adminLogin()}
                            className="w-full glass rounded-2xl py-4 pl-11 pr-4 text-sm outline-none
                              transition placeholder:text-white/20"
                          />
                        </div>
                        <div className="relative">
                          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                          <input
                            type="password"
                            placeholder="Password"
                            value={login.password}
                            onChange={(e) => setLogin({ ...login, password: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && adminLogin()}
                            className="w-full glass rounded-2xl py-4 pl-11 pr-4 text-sm outline-none
                              transition placeholder:text-white/20"
                          />
                        </div>
                        <button
                          onClick={adminLogin}
                          className="w-full btn-primary py-4 rounded-2xl font-bold text-base mt-1"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Admin panel ── */
                  <div className="p-6 md:p-8">
                    {/* Add product form */}
                    <section className="glass-card rounded-3xl p-6 mb-8" aria-label="Add new product">
                      <h3 className="font-display text-base font-bold mb-5 flex items-center gap-2">
                        <Plus size={18} className="text-cyan-400" />
                        Add New Product
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                          { key: "name",     placeholder: "Product Name", type: "text"   },
                          { key: "price",    placeholder: "Price (₱)",    type: "number" },
                          { key: "category", placeholder: "Category",     type: "text"   },
                          { key: "image",    placeholder: "Image URL",    type: "text"   },
                        ].map((field) => (
                          <input
                            key={field.key}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={newProduct[field.key as keyof typeof newProduct]}
                            onChange={(e) => setNewProduct({ ...newProduct, [field.key]: e.target.value })}
                            className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                              transition placeholder:text-white/20"
                          />
                        ))}
                      </div>
                      <button
                        onClick={addProduct}
                        className="mt-4 btn-primary px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
                      >
                        <Plus size={15} />
                        Add Product
                      </button>
                    </section>

                    {/* Products list */}
                    <div>
                      <h3 className="font-display text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                        All Products ({products.length})
                      </h3>
                      <div className="space-y-3">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="glass rounded-2xl p-4 flex items-center gap-4
                              hover:border-white/14 transition-all duration-200"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{product.name}</p>
                              <span className="text-cyan-400/55 text-xs font-semibold">{product.category}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <p className="font-display font-semibold text-base hidden sm:block">
                                ₱{product.price.toLocaleString()}
                              </p>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="w-10 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/20
                                  rounded-xl flex items-center justify-center transition-all duration-200
                                  text-red-400 hover:text-white"
                                aria-label={`Delete ${product.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Toast Notifications ─────────────────────────────────────────── */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}