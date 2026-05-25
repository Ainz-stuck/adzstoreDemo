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
  Search,
  Eye,
  LogIn,
  UserPlus,
  Clock,
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
  stock: number;
  reservedStock?: number;
  lowStockThreshold?: number;
  description: string;
  archived?: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CustomerAccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  status: "Active" | "Blocked";
};

type StaffAccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "Seller" | "Store Staff";
  status: "Active" | "Inactive";
};

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled";
type PaymentStatus = "Paid" | "Unpaid" | "Pending Verification" | "Refunded";
type FulfillmentType = "Pickup" | "Delivery";
type SellerTab = "pending" | "assigned" | "lowStock";
type ReportStatusFilter = "All" | OrderStatus;
type ReportPaymentFilter = "All" | PaymentStatus;

type Order = {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  paymentReference?: string;
  proofOfPayment?: string;
  paymentStatus: PaymentStatus;
  paymentVerifiedAt?: string;
  orderStatus: OrderStatus;
  stockDeducted?: boolean;
  assignedStaffId?: number;
  assignedStaffName?: string;
  availabilityConfirmed?: boolean;
  fulfillmentType: FulfillmentType;
  sellerNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

type LowStockReport = {
  id: number;
  productId: number;
  productName: string;
  stock: number;
  reportedBy: string;
  createdAt: string;
};

type StockAdjustment = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  type: "Restock" | "Manual Adjustment" | "Reservation" | "Release" | "Deduction";
  reason: string;
  createdBy: string;
  createdAt: string;
};

type AdminTab =
  | "dashboard"
  | "products"
  | "categories"
  | "inventory"
  | "customers"
  | "staff"
  | "orders"
  | "reports";

type CustomerMode = "login" | "register" | "account";

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
      stock: 15,
      archived: false,
      description:
        "A stylish premium blue bag designed for everyday fashion, travel, and casual use.",
    },
    {
      id: 2,
      name: "Gaming Headset",
      price: 2999,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200&auto=format&fit=crop",
      category: "Gaming",
      stock: 10,
      archived: false,
      description:
        "Comfortable gaming headset with clear audio, soft ear cushions, and a modern design.",
    },
    {
      id: 3,
      name: "Smart Watch",
      price: 7999,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
      category: "Wearables",
      stock: 8,
      archived: false,
      description:
        "Modern smartwatch for fitness tracking, notifications, time management, and daily productivity.",
    },
    {
      id: 4,
      name: "Wireless Keyboard",
      price: 3499,
      image:
        "https://keychron.co.nz/cdn/shop/files/Keychron-Q6-Ultra-8K-Wireless-Custom-Mechanical-Keyboard-White-Keychron-Silk-POM-Switch-Red.jpg?v=1772417219&width=1214",
      category: "Tech",
      stock: 12,
      archived: false,
      description:
        "Premium wireless keyboard with smooth typing feel, clean layout, and reliable performance.",
    },
    {
      id: 5,
      name: "Running Sneakers",
      price: 5299,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      category: "Footwear",
      stock: 6,
      archived: false,
      description:
        "Lightweight sneakers made for running, walking, training, and active everyday comfort.",
    },
    {
      id: 6,
      name: "Leather Wallet",
      price: 1899,
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
      category: "Accessories",
      stock: 20,
      archived: false,
      description:
        "Compact leather wallet with a clean design, card storage, and premium everyday style.",
    },
  ];

  const defaultCustomers: CustomerAccount[] = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      password: "123456",
      status: "Active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      password: "123456",
      status: "Active",
    },
    {
      id: 3,
      name: "Andrei Magbanua",
      email: "andrei@example.com",
      password: "123456",
      status: "Active",
    },
  ];

  // ── State ────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    description: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // ── Added Admin States ──────────────────────────────────────────────────
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [categories, setCategories] = useState<string[]>([
    "Fashion",
    "Gaming",
    "Wearables",
    "Tech",
    "Footwear",
    "Accessories",
  ]);

  const [newCategory, setNewCategory] = useState("");

  const [customers, setCustomers] = useState<CustomerAccount[]>(defaultCustomers);

  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([
    {
      id: 1,
      name: "Carlo Reyes",
      email: "carlo@adzstore.com",
      password: "seller123",
      role: "Seller",
      status: "Active",
    },
    {
      id: 2,
      name: "Ana Lopez",
      email: "ana@adzstore.com",
      password: "staff123",
      role: "Store Staff",
      status: "Active",
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  // ── Improved Admin / Reports / Inventory States ─────────────────────────
  const [reportStatusFilter, setReportStatusFilter] = useState<ReportStatusFilter>("All");
  const [reportPaymentFilter, setReportPaymentFilter] = useState<ReportPaymentFilter>("All");
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "Seller" as StaffAccount["role"] });
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [restockForm, setRestockForm] = useState({ productId: "", quantity: "", reason: "" });

  // ── Added Seller / Store Staff States ───────────────────────────────────
  const [sellerOpen, setSellerOpen] = useState(false);
  const [currentSeller, setCurrentSeller] = useState<StaffAccount | null>(null);
  const [sellerLogin, setSellerLogin] = useState({ email: "", password: "" });
  const [sellerTab, setSellerTab] = useState<SellerTab>("pending");
  const [lowStockReports, setLowStockReports] = useState<LowStockReport[]>([]);

  // ── Added Customer States ───────────────────────────────────────────────
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<CustomerMode>("login");
  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(
    null
  );
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState("");

  const getReservedStock = (product: Product) => product.reservedStock ?? 0;
  const getLowStockThreshold = (product: Product) => product.lowStockThreshold ?? 5;
  const getAvailableStock = (product: Product) =>
    Math.max(product.stock - getReservedStock(product), 0);

  const getOrderQuantityByProductId = (order: Order, productId: number) =>
    order.items.reduce(
      (sum, item) => sum + (item.product.id === productId ? item.quantity : 0),
      0
    );

  const getCartQuantityByProductId = (productId: number) =>
    cart.reduce(
      (sum, item) => sum + (item.product.id === productId ? item.quantity : 0),
      0
    );

  const getOrderItemCount = (order: Order) =>
    order.items.reduce((sum, item) => sum + item.quantity, 0);

  const getOrderDateValue = (createdAt: string) => {
    const parsed = new Date(createdAt);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const adminTabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "categories", label: "Categories" },
    { key: "inventory", label: "Inventory" },
    { key: "customers", label: "Customers" },
    { key: "staff", label: "Staff" },
    { key: "orders", label: "Orders" },
    { key: "reports", label: "Reports" },
  ];

  const sellerTabs: { key: SellerTab; label: string }[] = [
    { key: "pending", label: "Pending Orders" },
    { key: "assigned", label: "Assigned Transactions" },
    { key: "lowStock", label: "Low-Stock Report" },
  ];

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const activeProducts = products.filter((p) => !p.archived);
  const archivedProducts = products.filter((p) => p.archived);
  const lowStockProducts = products.filter(
    (p) => !p.archived && getAvailableStock(p) <= getLowStockThreshold(p)
  );
  const activeStaffAccounts = staffAccounts.filter((staff) => staff.status === "Active");
  const defaultAssignedStaff = activeStaffAccounts[0] ?? staffAccounts[0];
  const pendingOrders = orders.filter((order) => order.orderStatus === "Pending");
  const assignedSellerOrders = currentSeller
    ? orders.filter((order) => order.assignedStaffId === currentSeller.id)
    : [];
  const sellerCompletedOrders = assignedSellerOrders.filter(
    (order) => order.orderStatus === "Completed"
  ).length;

  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const customerOrders = currentCustomer
    ? orders.filter((order) => order.customerId === currentCustomer.id)
    : [];

  const totalSales = orders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.total, 0);

  const completedOrders = orders.filter(
    (order) => order.orderStatus === "Completed"
  ).length;

  const totalItemsSold = orders.reduce(
    (sum, order) => sum + getOrderItemCount(order),
    0
  );

  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
  const pendingPaymentOrders = orders.filter(
    (order) => order.paymentStatus === "Pending Verification"
  );
  const verifiedPaymentOrders = orders.filter((order) => order.paymentStatus === "Paid");
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );
  const reservedInventoryValue = products.reduce(
    (sum, product) => sum + product.price * getReservedStock(product),
    0
  );
  const totalStockUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const totalReservedUnits = products.reduce(
    (sum, product) => sum + getReservedStock(product),
    0
  );

  const orderStatusOptions: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready for Pickup",
    "Out for Delivery",
    "Completed",
    "Cancelled",
  ];

  const paymentStatusOptions: PaymentStatus[] = [
    "Paid",
    "Unpaid",
    "Pending Verification",
    "Refunded",
  ];

  const orderStatusSummary = orderStatusOptions.map((status) => ({
    status,
    count: orders.filter((order) => order.orderStatus === status).length,
  }));

  const paymentMethodSummary = ["Cash on Delivery", "GCash", "Credit / Debit Card", "Bank Transfer"].map(
    (method) => ({
      method,
      count: orders.filter((order) => order.paymentMethod === method).length,
      sales: orders
        .filter((order) => order.paymentMethod === method && order.paymentStatus === "Paid")
        .reduce((sum, order) => sum + order.total, 0),
    })
  );

  const revenueByCategory = categories
    .map((category) => {
      const sales = orders
        .filter((order) => order.paymentStatus === "Paid")
        .reduce(
          (sum, order) =>
            sum +
            order.items
              .filter((item) => item.product.category === category)
              .reduce((itemSum, item) => itemSum + item.product.price * item.quantity, 0),
          0
        );

      return { category, sales };
    })
    .filter((item) => item.sales > 0);

  const topSellingProducts = activeProducts
    .map((product) => {
      const quantity = orders
        .filter((order) => order.paymentStatus === "Paid")
        .reduce((sum, order) => sum + getOrderQuantityByProductId(order, product.id), 0);
      return {
        product,
        quantity,
        sales: quantity * product.price,
      };
    })
    .filter((item) => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const staffPerformance = staffAccounts.map((staff) => {
    const assigned = orders.filter((order) => order.assignedStaffId === staff.id);
    const completed = assigned.filter((order) => order.orderStatus === "Completed");

    return {
      staff,
      assigned: assigned.length,
      completed: completed.length,
      sales: completed.reduce((sum, order) => sum + order.total, 0),
    };
  });

  const filteredReportOrders = orders.filter((order) => {
    const matchesStatus =
      reportStatusFilter === "All" || order.orderStatus === reportStatusFilter;
    const matchesPayment =
      reportPaymentFilter === "All" || order.paymentStatus === reportPaymentFilter;
    const orderTime = getOrderDateValue(order.createdAt);
    const fromTime = reportDateFrom ? new Date(`${reportDateFrom}T00:00:00`).getTime() : 0;
    const toTime = reportDateTo ? new Date(`${reportDateTo}T23:59:59`).getTime() : Infinity;

    return matchesStatus && matchesPayment && orderTime >= fromTime && orderTime <= toTime;
  });

  const filteredReportSales = filteredReportOrders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.total, 0);

  const filteredReportItemsSold = filteredReportOrders.reduce(
    (sum, order) => sum + getOrderItemCount(order),
    0
  );

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
    const savedProducts = localStorage.getItem("products");
    const savedCategories = localStorage.getItem("categories");
    const savedOrders = localStorage.getItem("orders");
    const savedCustomers = localStorage.getItem("customers");
    const savedCurrentCustomer = localStorage.getItem("currentCustomer");
    const savedLowStockReports = localStorage.getItem("lowStockReports");
    const savedStaffAccounts = localStorage.getItem("staffAccounts");
    const savedStockAdjustments = localStorage.getItem("stockAdjustments");

    if (savedProducts) {
      const parsed: Product[] = JSON.parse(savedProducts);

      const normalizedSaved = parsed.map((p) => ({
        ...p,
        stock: typeof p.stock === "number" ? p.stock : 10,
        reservedStock: typeof p.reservedStock === "number" ? p.reservedStock : 0,
        lowStockThreshold: typeof p.lowStockThreshold === "number" ? p.lowStockThreshold : 5,
        archived: p.archived ?? false,
        description:
          p.description ||
          "This product is part of the ADZ Store catalog and is available for online purchase.",
      }));

      const defaultIds = new Set(defaultProducts.map((p) => p.id));
      const savedMap = new Map(normalizedSaved.map((p) => [p.id, p]));

      const mergedDefaults = defaultProducts.map((p) =>
        savedMap.has(p.id) ? { ...p, ...savedMap.get(p.id)! } : p
      );

      const extras = normalizedSaved.filter((p) => !defaultIds.has(p.id));

      setProducts([...mergedDefaults, ...extras]);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    if (savedOrders) {
      const parsedOrders: Order[] = JSON.parse(savedOrders);
      setOrders(
        parsedOrders.map((order) => ({
          ...order,
          items: (order.items as unknown as Array<Product | CartItem>).map((item) =>
            "quantity" in item && "product" in item
              ? (item as CartItem)
              : { product: item as Product, quantity: 1 }
          ),
          assignedStaffId: order.assignedStaffId ?? defaultAssignedStaff?.id,
          assignedStaffName: order.assignedStaffName ?? defaultAssignedStaff?.name ?? "Unassigned",
          availabilityConfirmed: order.availabilityConfirmed ?? order.orderStatus !== "Pending",
          fulfillmentType: order.fulfillmentType ?? "Delivery",
          paymentStatus: order.paymentStatus ?? "Unpaid",
          stockDeducted: order.stockDeducted ?? false,
          sellerNotes: order.sellerNotes ?? "",
          updatedAt: order.updatedAt ?? order.createdAt,
        }))
      );
    }

    if (savedStaffAccounts) {
      setStaffAccounts(JSON.parse(savedStaffAccounts));
    }

    if (savedStockAdjustments) {
      setStockAdjustments(JSON.parse(savedStockAdjustments));
    }

    if (savedLowStockReports) {
      setLowStockReports(JSON.parse(savedLowStockReports));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    if (savedCurrentCustomer) {
      setCurrentCustomer(JSON.parse(savedCurrentCustomer));
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("products", JSON.stringify(products));
  }, [products, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("lowStockReports", JSON.stringify(lowStockReports));
  }, [lowStockReports, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("staffAccounts", JSON.stringify(staffAccounts));
  }, [staffAccounts, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("stockAdjustments", JSON.stringify(stockAdjustments));
  }, [stockAdjustments, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers, storageReady]);

  useEffect(() => {
    if (!storageReady) return;

    if (currentCustomer) {
      localStorage.setItem("currentCustomer", JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem("currentCustomer");
    }
  }, [currentCustomer, storageReady]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Customer logic ───────────────────────────────────────────────────────
  const openCustomerPanel = () => {
    setCustomerOpen(true);
    setCustomerMode(currentCustomer ? "account" : "login");
  };

  const registerCustomer = () => {
    if (!customerForm.name || !customerForm.email || !customerForm.password) {
      addToast("Please complete the registration form", "error");
      return;
    }

    const existingCustomer = customers.find(
      (customer) =>
        customer.email.toLowerCase() === customerForm.email.toLowerCase()
    );

    if (existingCustomer) {
      addToast("Email is already registered", "error");
      return;
    }

    const newCustomer: CustomerAccount = {
      id: Date.now(),
      name: customerForm.name,
      email: customerForm.email,
      password: customerForm.password,
      status: "Active",
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setCurrentCustomer(newCustomer);
    setCustomerForm({ name: "", email: "", password: "" });
    setCustomerMode("account");
    addToast("Customer account registered successfully!", "success");
  };

  const loginCustomer = () => {
    if (!customerForm.email || !customerForm.password) {
      addToast("Please enter your email and password", "error");
      return;
    }

    const customer = customers.find(
      (c) =>
        c.email.toLowerCase() === customerForm.email.toLowerCase() &&
        c.password === customerForm.password
    );

    if (!customer) {
      addToast("Invalid customer login credentials", "error");
      return;
    }

    if (customer.status === "Blocked") {
      addToast("Your account is currently blocked", "error");
      return;
    }

    setCurrentCustomer(customer);
    setCustomerForm({ name: "", email: "", password: "" });
    setCustomerMode("account");
    addToast(`Welcome back, ${customer.name}!`, "success");
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    setCustomerMode("login");
    setCustomerForm({ name: "", email: "", password: "" });
    addToast("Customer logged out", "info");
  };

  const getStatusColor = (status: OrderStatus) => {
    if (status === "Pending") return "text-orange-400";
    if (status === "Confirmed") return "text-blue-400";
    if (status === "Preparing") return "text-cyan-400";
    if (status === "Ready for Pickup") return "text-purple-400";
    if (status === "Out for Delivery") return "text-indigo-400";
    if (status === "Completed") return "text-emerald-400";
    return "text-red-400";
  };

  // ── Cart logic ───────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    if (product.archived) {
      addToast(`${product.name} is not available`, "error");
      return;
    }

    const availableStock = getAvailableStock(product);

    if (availableStock <= 0) {
      addToast(`${product.name} is out of stock`, "error");
      return;
    }

    const cartQuantity = getCartQuantityByProductId(product.id);

    if (cartQuantity >= availableStock) {
      addToast(`Only ${availableStock} available stock for ${product.name}`, "error");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    addToast(`${product.name} added to cart`, "success");
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const availableStock = getAvailableStock(product);
    const safeQuantity = Math.max(0, Math.min(quantity, availableStock));

    if (quantity > availableStock) {
      addToast(`Only ${availableStock} available stock for ${product.name}`, "error");
    }

    setCart((prev) =>
      safeQuantity === 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId
              ? { ...item, product, quantity: safeQuantity }
              : item
          )
    );
  };

  const removeFromCart = (id: number) => {
    const item = cart.find((i) => i.product.id === id);

    setCart((prev) => prev.filter((i) => i.product.id !== id));

    if (item) addToast(`${item.product.name} removed`, "info");
  };

  const clearCart = () => {
    setCart([]);
    addToast("Cart cleared", "info");
  };

  const reserveOrderStock = (orderItems: CartItem[], createdBy = "System") => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const quantity = orderItems.reduce(
          (sum, item) => sum + (item.product.id === product.id ? item.quantity : 0),
          0
        );

        if (quantity <= 0) return product;

        return {
          ...product,
          reservedStock: getReservedStock(product) + quantity,
        };
      })
    );

    const adjustments: StockAdjustment[] = orderItems.map((item) => ({
      id: Date.now() + item.product.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      type: "Reservation",
      reason: "Stock reserved after customer checkout.",
      createdBy,
      createdAt: new Date().toLocaleString(),
    }));

    setStockAdjustments((prev) => [...adjustments, ...prev]);
  };

  const releaseOrderReservation = (order: Order, reason = "Reservation released") => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const quantity = getOrderQuantityByProductId(order, product.id);

        if (quantity <= 0) return product;

        return {
          ...product,
          reservedStock: Math.max(getReservedStock(product) - quantity, 0),
        };
      })
    );

    const adjustments: StockAdjustment[] = order.items.map((item) => ({
      id: Date.now() + item.product.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: -item.quantity,
      type: "Release",
      reason,
      createdBy: currentSeller?.name ?? "Admin",
      createdAt: new Date().toLocaleString(),
    }));

    setStockAdjustments((prev) => [...adjustments, ...prev]);
  };

  const deductReservedStockForOrder = (order: Order) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const quantity = getOrderQuantityByProductId(order, product.id);

        if (quantity <= 0) return product;

        return {
          ...product,
          stock: Math.max(product.stock - quantity, 0),
          reservedStock: Math.max(getReservedStock(product) - quantity, 0),
        };
      })
    );

    const adjustments: StockAdjustment[] = order.items.map((item) => ({
      id: Date.now() + item.product.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: -item.quantity,
      type: "Deduction",
      reason: `Stock deducted after availability confirmation for Order #${order.id}.`,
      createdBy: currentSeller?.name ?? "Seller / Store Staff",
      createdAt: new Date().toLocaleString(),
    }));

    setStockAdjustments((prev) => [...adjustments, ...prev]);
  };

  // ── Checkout ─────────────────────────────────────────────────────────────
  const handleFakePayment = () => {
    if (!currentCustomer) {
      setCustomerOpen(true);
      setCustomerMode("login");
      addToast("Please login before checkout", "error");
      return;
    }

    if (cart.length === 0) {
      addToast("Your cart is empty!", "error");
      return;
    }

    if (!paymentMethod) {
      addToast("Please select a payment method", "error");
      return;
    }

    const requiresPaymentReference = paymentMethod !== "Cash on Delivery";

    if (requiresPaymentReference && !paymentReference.trim()) {
      addToast("Please enter payment reference number", "error");
      return;
    }

    for (const item of cart) {
      const product = products.find((p) => p.id === item.product.id);

      if (!product || product.archived) {
        addToast("One product in your cart is no longer available", "error");
        return;
      }

      if (getAvailableStock(product) < item.quantity) {
        addToast(`Not enough available stock for ${product.name}`, "error");
        return;
      }
    }

    const normalizedCart = cart.map((item) => {
      const latestProduct = products.find((product) => product.id === item.product.id) ?? item.product;
      return { product: latestProduct, quantity: item.quantity };
    });

    const paymentStatus: PaymentStatus =
      paymentMethod === "Cash on Delivery" ? "Unpaid" : "Pending Verification";

    const newOrder: Order = {
      id: Date.now(),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerEmail: currentCustomer.email,
      items: normalizedCart,
      total,
      paymentMethod,
      paymentReference: paymentReference.trim() || undefined,
      proofOfPayment: proofOfPayment.trim() || undefined,
      paymentStatus,
      orderStatus: "Pending",
      stockDeducted: false,
      assignedStaffId: defaultAssignedStaff?.id,
      assignedStaffName: defaultAssignedStaff?.name ?? "Unassigned",
      availabilityConfirmed: false,
      fulfillmentType: "Delivery",
      sellerNotes: "Waiting for seller/store staff availability confirmation.",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    reserveOrderStock(normalizedCart, currentCustomer.name);

    const receiptWindow = window.open("", "_blank");

    if (receiptWindow) {
      const itemsHTML = normalizedCart
        .map(
          (item) => `
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;gap:12px;">
          <span style="font-weight:500;color:#334155">${item.product.name} × ${item.quantity}</span>
          <span style="font-weight:700;color:#0ea5e9">₱${(item.product.price * item.quantity).toLocaleString()}</span>
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
              .receipt{background:white;padding:44px;border-radius:28px;max-width:500px;width:100%;box-shadow:0 40px 80px rgba(0,0,0,0.5);position:relative}
              .close-btn{position:absolute;top:18px;right:18px;width:34px;height:34px;border:none;border-radius:999px;background:#f1f5f9;color:#334155;font-size:22px;font-weight:700;line-height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease}
              .close-btn:hover{background:#e2e8f0;color:#0f172a;transform:scale(1.05)}
              .brand{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:700;background:linear-gradient(135deg,#06b6d4,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;letter-spacing:0.05em}
              .subtitle{text-align:center;color:#94a3b8;font-size:13px;margin-top:6px}
              .divider{border:none;border-top:2px dashed #e2e8f0;margin:22px 0}
              .info{color:#64748b;font-size:13px;margin-bottom:8px}
              .total{display:flex;justify-content:space-between;font-size:22px;font-weight:700;padding:14px 0;color:#0f172a}
              .success{text-align:center;background:#eff6ff;border:2px solid #93c5fd;border-radius:16px;padding:18px;margin-top:20px;color:#2563eb;font-weight:700;font-size:15px}
            </style>
          </head>
          <body>
            <div class="receipt">
              <button class="close-btn" onclick="returnToMainPage()" aria-label="Return to main page" title="Return to main page">×</button>
              <div class="brand">ADZ STORE</div>
              <div class="subtitle">Official Order Receipt</div>
              <hr class="divider">
              <p class="info"><strong>Customer:</strong> ${currentCustomer.name}</p>
              <p class="info"><strong>Email:</strong> ${currentCustomer.email}</p>
              <p class="info"><strong>Payment:</strong> ${paymentMethod}</p>
              <p class="info"><strong>Payment Status:</strong> ${paymentStatus}</p>
              ${paymentReference.trim() ? `<p class="info"><strong>Reference:</strong> ${paymentReference.trim()}</p>` : ""}
              <hr class="divider">
              ${itemsHTML}
              <hr class="divider">
              <div class="total"><span>Total</span><span>₱${total.toLocaleString()}</span></div>
              <div class="success">✅ Order Created — Seller will verify and prepare your order.</div>
            </div>
            <script>
              function returnToMainPage() {
                if (window.opener && !window.opener.closed) {
                  window.opener.focus();
                  window.close();
                  setTimeout(function () {
                    window.location.href = "/";
                  }, 200);
                } else {
                  window.location.href = "/";
                }
              }
            </script>
          </body>
        </html>
      `);

      receiptWindow.document.close();
    }

    setCart([]);
    setPaymentReference("");
    setProofOfPayment("");
    setCartOpen(false);
    addToast("Order placed, stock reserved, and payment sent for verification!", "success");
  };

  // ── Admin logic ──────────────────────────────────────────────────────────
  const adminLogin = () => {
    if (login.username === "admin" && login.password === "admin123") {
      setIsAdmin(true);
      addToast("Welcome back, Admin!", "success");
    } else {
      addToast("Invalid credentials", "error");
    }
  };

  const addProduct = () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.image ||
      !newProduct.category ||
      !newProduct.stock ||
      !newProduct.description
    ) {
      addToast("Please fill all required fields", "error");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      image: newProduct.image,
      category: newProduct.category,
      stock: Number(newProduct.stock),
      reservedStock: 0,
      lowStockThreshold: 5,
      description: newProduct.description,
      archived: false,
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "",
      stock: "",
      description: "",
    });
    addToast(`${product.name} added!`, "success");
  };

  const deleteProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    if (product) addToast(`${product.name} deleted`, "info");
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: String(product.price),
      image: product.image,
      category: product.category,
      stock: String(product.stock),
      description: product.description,
    });
    setAdminTab("products");
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "",
      stock: "",
      description: "",
    });
  };

  const updateProduct = () => {
    if (!editingProductId) return;

    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.image ||
      !newProduct.category ||
      !newProduct.stock ||
      !newProduct.description
    ) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              name: newProduct.name,
              price: Number(newProduct.price),
              image: newProduct.image,
              category: newProduct.category,
              stock: Number(newProduct.stock),
              description: newProduct.description,
            }
          : product
      )
    );

    setEditingProductId(null);
    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "",
      stock: "",
      description: "",
    });
    addToast("Product updated successfully!", "success");
  };

  const archiveProduct = (id: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, archived: true } : product
      )
    );

    addToast("Product archived", "info");
  };

  const restoreProduct = (id: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, archived: false } : product
      )
    );

    addToast("Product restored", "success");
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      addToast("Category name is required", "error");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      addToast("Category already exists", "error");
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    addToast("Category added", "success");
  };

  const deleteCategory = (category: string) => {
    const isUsed = products.some((product) => product.category === category);

    if (isUsed) {
      addToast("Cannot delete category used by products", "error");
      return;
    }

    setCategories(categories.filter((c) => c !== category));
    addToast("Category deleted", "info");
  };

  const updateOrderStatus = (orderId: number, status: OrderStatus) => {
    const existingOrder = orders.find((order) => order.id === orderId);

    if (!existingOrder) return;

    if (status === "Cancelled" && existingOrder.orderStatus !== "Cancelled") {
      if (existingOrder.stockDeducted) {
        restockItemsFromCancelledOrder(existingOrder);
      } else {
        releaseOrderReservation(existingOrder, `Order #${existingOrder.id} cancelled by admin.`);
      }
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              orderStatus: status,
              paymentStatus:
                status === "Completed" && order.paymentMethod === "Cash on Delivery"
                  ? "Paid"
                  : order.paymentStatus,
              paymentVerifiedAt:
                status === "Completed" && order.paymentMethod === "Cash on Delivery"
                  ? new Date().toLocaleString()
                  : order.paymentVerifiedAt,
              updatedAt: new Date().toLocaleString(),
            }
          : order
      )
    );

    addToast("Order status updated", "success");
  };

  const restockItemsFromCancelledOrder = (order: Order) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const quantity = getOrderQuantityByProductId(order, product.id);

        if (quantity <= 0) return product;

        return {
          ...product,
          stock: product.stock + quantity,
        };
      })
    );

    const adjustments: StockAdjustment[] = order.items.map((item) => ({
      id: Date.now() + item.product.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      type: "Manual Adjustment",
      reason: `Stock returned after cancellation of Order #${order.id}.`,
      createdBy: "Admin",
      createdAt: new Date().toLocaleString(),
    }));

    setStockAdjustments((prev) => [...adjustments, ...prev]);
  };

  const verifyPayment = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus: "Paid",
              paymentVerifiedAt: new Date().toLocaleString(),
              sellerNotes: `${order.sellerNotes ?? ""} Payment verified by admin.`.trim(),
              updatedAt: new Date().toLocaleString(),
            }
          : order
      )
    );

    addToast("Payment verified successfully", "success");
  };

  const markPaymentUnpaid = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus: "Unpaid",
              paymentVerifiedAt: undefined,
              updatedAt: new Date().toLocaleString(),
            }
          : order
      )
    );

    addToast("Payment marked as unpaid", "info");
  };

  const assignOrderToStaff = (orderId: number, staffId: number) => {
    const staff = staffAccounts.find((account) => account.id === staffId);

    if (!staff) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              assignedStaffId: staff.id,
              assignedStaffName: staff.name,
              updatedAt: new Date().toLocaleString(),
            }
          : order
      )
    );

    addToast(`Order assigned to ${staff.name}`, "success");
  };

  const toggleCustomerStatus = (customerId: number) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: customer.status === "Active" ? "Blocked" : "Active",
            }
          : customer
      )
    );

    addToast("Customer status updated", "success");
  };

  const saveStaffAccount = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      addToast("Please complete all staff fields", "error");
      return;
    }

    const duplicateEmail = staffAccounts.some(
      (staff) =>
        staff.email.toLowerCase() === staffForm.email.toLowerCase() &&
        staff.id !== editingStaffId
    );

    if (duplicateEmail) {
      addToast("Staff email already exists", "error");
      return;
    }

    if (editingStaffId) {
      setStaffAccounts((prev) =>
        prev.map((staff) =>
          staff.id === editingStaffId
            ? {
                ...staff,
                name: staffForm.name,
                email: staffForm.email,
                password: staffForm.password,
                role: staffForm.role,
              }
            : staff
        )
      );
      setEditingStaffId(null);
      addToast("Staff account updated", "success");
    } else {
      const newStaff: StaffAccount = {
        id: Date.now(),
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password,
        role: staffForm.role,
        status: "Active",
      };

      setStaffAccounts((prev) => [newStaff, ...prev]);
      addToast("Staff account added", "success");
    }

    setStaffForm({ name: "", email: "", password: "", role: "Seller" });
  };

  const startEditStaff = (staff: StaffAccount) => {
    setEditingStaffId(staff.id);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: staff.password,
      role: staff.role,
    });
  };

  const cancelEditStaff = () => {
    setEditingStaffId(null);
    setStaffForm({ name: "", email: "", password: "", role: "Seller" });
  };

  const toggleStaffStatus = (staffId: number) => {
    setStaffAccounts((prev) =>
      prev.map((staff) =>
        staff.id === staffId
          ? { ...staff, status: staff.status === "Active" ? "Inactive" : "Active" }
          : staff
      )
    );

    addToast("Staff account status updated", "success");
  };

  const deleteStaffAccount = (staffId: number) => {
    const hasAssignedOrders = orders.some((order) => order.assignedStaffId === staffId);

    if (hasAssignedOrders) {
      addToast("Cannot delete staff with assigned orders. Deactivate instead.", "error");
      return;
    }

    setStaffAccounts((prev) => prev.filter((staff) => staff.id !== staffId));
    addToast("Staff account deleted", "info");
  };

  const restockProduct = () => {
    const productId = Number(restockForm.productId);
    const quantity = Number(restockForm.quantity);
    const product = products.find((p) => p.id === productId);

    if (!product || quantity <= 0) {
      addToast("Please select a product and enter a valid restock quantity", "error");
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, stock: item.stock + quantity } : item
      )
    );

    const adjustment: StockAdjustment = {
      id: Date.now(),
      productId,
      productName: product.name,
      quantity,
      type: "Restock",
      reason: restockForm.reason || "Manual restock from admin inventory panel.",
      createdBy: "Admin",
      createdAt: new Date().toLocaleString(),
    };

    setStockAdjustments((prev) => [adjustment, ...prev]);
    setRestockForm({ productId: "", quantity: "", reason: "" });
    addToast(`${product.name} restocked successfully`, "success");
  };

  const exportSalesReportCsv = () => {
    const rows = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Date",
        "Items",
        "Total",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Assigned Staff",
      ],
      ...filteredReportOrders.map((order) => [
        String(order.id),
        order.customerName,
        order.customerEmail,
        order.createdAt,
        order.items.map((item) => `${item.product.name} x${item.quantity}`).join(" | "),
        String(order.total),
        order.paymentMethod,
        order.paymentStatus,
        order.orderStatus,
        order.assignedStaffName ?? "Unassigned",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adz-sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Sales report exported as CSV", "success");
  };

  const printSalesReport = () => {
    const reportWindow = window.open("", "_blank");

    if (!reportWindow) return;

    const rows = filteredReportOrders
      .map(
        (order) => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.createdAt}</td>
            <td>${order.items.map((item) => `${item.product.name} x${item.quantity}`).join("<br>")}</td>
            <td>₱${order.total.toLocaleString()}</td>
            <td>${order.paymentMethod}</td>
            <td>${order.paymentStatus}</td>
            <td>${order.orderStatus}</td>
          </tr>`
      )
      .join("");

    reportWindow.document.write(`
      <html>
        <head>
          <title>ADZ Store Sales Report</title>
          <style>
            body{font-family:Arial,sans-serif;padding:32px;color:#111827}
            h1{margin-bottom:4px} p{color:#64748b}
            table{width:100%;border-collapse:collapse;margin-top:24px;font-size:12px}
            th,td{border:1px solid #e5e7eb;padding:10px;text-align:left;vertical-align:top}
            th{background:#f8fafc}
            .summary{display:flex;gap:16px;margin-top:20px}
            .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;min-width:160px}
            .value{font-size:22px;font-weight:700;color:#0369a1}
          </style>
        </head>
        <body>
          <h1>ADZ Store Sales Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <div class="summary">
            <div class="card"><div>Total Sales</div><div class="value">₱${filteredReportSales.toLocaleString()}</div></div>
            <div class="card"><div>Orders</div><div class="value">${filteredReportOrders.length}</div></div>
            <div class="card"><div>Items Sold</div><div class="value">${filteredReportItemsSold}</div></div>
          </div>
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Method</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="8">No matching records.</td></tr>'}</tbody>
          </table>
          <script>window.print()</script>
        </body>
      </html>
    `);

    reportWindow.document.close();
  };

  // ── Seller / Store Staff logic ──────────────────────────────────────────
  const sellerStaffLogin = () => {
    if (!sellerLogin.email || !sellerLogin.password) {
      addToast("Please enter seller email and password", "error");
      return;
    }

    const staff = staffAccounts.find(
      (account) =>
        account.email.toLowerCase() === sellerLogin.email.toLowerCase() &&
        account.password === sellerLogin.password
    );

    if (!staff) {
      addToast("Invalid seller/store staff credentials", "error");
      return;
    }

    if (staff.status !== "Active") {
      addToast("This seller/store staff account is inactive", "error");
      return;
    }

    setCurrentSeller(staff);
    setSellerLogin({ email: "", password: "" });
    setSellerTab("pending");
    addToast(`Welcome, ${staff.name}!`, "success");
  };

  const logoutSeller = () => {
    setCurrentSeller(null);
    setSellerLogin({ email: "", password: "" });
    setSellerTab("pending");
    addToast("Seller/store staff logged out", "info");
  };

  const updateSellerOrder = (
    orderId: number,
    updates: Partial<Order>,
    message = "Order updated"
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...updates,
              assignedStaffId: currentSeller?.id ?? order.assignedStaffId,
              assignedStaffName: currentSeller?.name ?? order.assignedStaffName,
              updatedAt: new Date().toLocaleString(),
            }
          : order
      )
    );

    addToast(message, "success");
  };

  const confirmOrderAvailability = (order: Order) => {
    const unavailableItems = order.items.filter((item) => {
      const product = products.find((p) => p.id === item.product.id);
      return !product || product.archived || product.stock < item.quantity;
    });

    if (unavailableItems.length > 0) {
      addToast("Some items are no longer available in the required quantity", "error");
      return;
    }

    if (!order.stockDeducted) {
      deductReservedStockForOrder(order);
    }

    updateSellerOrder(
      order.id,
      {
        availabilityConfirmed: true,
        stockDeducted: true,
        orderStatus: "Confirmed",
        sellerNotes: "Product availability confirmed and reserved stock deducted by store staff.",
      },
      "Order availability confirmed and inventory deducted"
    );
  };

  const prepareOrderForFulfillment = (order: Order, fulfillmentType: FulfillmentType) => {
    if (!order.availabilityConfirmed) {
      addToast("Confirm product availability before preparing the order", "error");
      return;
    }

    updateSellerOrder(
      order.id,
      {
        fulfillmentType,
        availabilityConfirmed: true,
        orderStatus: fulfillmentType === "Pickup" ? "Ready for Pickup" : "Out for Delivery",
        sellerNotes:
          fulfillmentType === "Pickup"
            ? "Products prepared and ready for customer pickup."
            : "Products prepared and released for delivery.",
      },
      fulfillmentType === "Pickup"
        ? "Order prepared for pickup"
        : "Order prepared for delivery"
    );
  };

  const markOrderCompleted = (orderId: number) => {
    const order = orders.find((item) => item.id === orderId);

    updateSellerOrder(
      orderId,
      {
        orderStatus: "Completed",
        paymentStatus:
          order?.paymentMethod === "Cash on Delivery" ? "Paid" : order?.paymentStatus ?? "Paid",
        paymentVerifiedAt:
          order?.paymentMethod === "Cash on Delivery"
            ? new Date().toLocaleString()
            : order?.paymentVerifiedAt,
        sellerNotes: "Transaction completed by seller/store staff.",
      },
      "Order marked as completed"
    );
  };

  const reportLowStockProduct = (product: Product) => {
    if (!currentSeller) {
      addToast("Please login as seller/store staff first", "error");
      return;
    }

    const availableStock = getAvailableStock(product);
    const alreadyReported = lowStockReports.some(
      (report) => report.productId === product.id && report.stock === availableStock
    );

    if (alreadyReported) {
      addToast("This low-stock item was already reported", "info");
      return;
    }

    const report: LowStockReport = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      stock: availableStock,
      reportedBy: currentSeller.name,
      createdAt: new Date().toLocaleString(),
    };

    setLowStockReports((prev) => [report, ...prev]);
    addToast(`${product.name} reported as low stock`, "success");
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

        .product-card { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s; }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 40px 70px rgba(6,182,212,0.14), 0 0 0 1px rgba(6,182,212,0.15);
        }

        input:focus, select:focus, textarea:focus {
          border-color: rgba(6,182,212,0.5) !important;
          background: rgba(255,255,255,0.07) !important;
        }

        select {
          color-scheme: dark;
        }

        textarea {
          resize: vertical;
        }

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
            <a href="#" className="font-display text-xl font-bold tracking-tight">
              <span className="shimmer-text">ADZ</span>
            </a>

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

            <div className="flex items-center gap-2.5">
              <button
                onClick={openCustomerPanel}
                className="glass px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70
                  hover:text-white hover:bg-white/8 transition-all duration-200 flex items-center gap-2"
                aria-label="Open customer account"
              >
                <User size={15} className="text-cyan-400" />
                <span className="hidden sm:inline">
                  {currentCustomer ? currentCustomer.name.split(" ")[0] : "Customer"}
                </span>
              </button>

              <button
                onClick={() => setSellerOpen(true)}
                className="glass px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70
                  hover:text-white hover:bg-white/8 transition-all duration-200 flex items-center gap-2"
                aria-label="Open seller or store staff dashboard"
              >
                <Package2 size={15} className="text-cyan-400" />
                <span className="hidden sm:inline">Seller</span>
              </button>

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
                aria-label={`Open cart (${cartItemCount} items)`}
              >
                <ShoppingCart size={17} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-bold
                    w-[18px] h-[18px] rounded-full flex items-center justify-center
                    border-2 border-[#080C14] animate-toast">
                    {cartItemCount}
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

          <div className="absolute top-1/4 right-[28%] w-2 h-2 rounded-full bg-cyan-400/70 animate-float" style={{ animationDelay: "0s" }} aria-hidden />
          <div className="absolute top-[38%] left-[22%] w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-float" style={{ animationDelay: "1.2s" }} aria-hidden />
          <div className="absolute bottom-[32%] right-[35%] w-1 h-1 rounded-full bg-cyan-300/60 animate-float" style={{ animationDelay: "2.1s" }} aria-hidden />

          <div className="relative z-10 text-center max-w-5xl px-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass border border-cyan-500/25 px-4 py-2
              rounded-full text-[11px] font-bold text-cyan-400 mb-8 tracking-widest uppercase">
              <Sparkles size={11} />
              Premium E-Commerce Experience
            </div>

            <h1 className="font-display font-bold leading-tight tracking-normal">
              <span className="block text-6xl md:text-7xl xl:text-8xl text-white">ADZ</span>
              <span className="block text-6xl md:text-7xl xl:text-8xl shimmer-text">STORE</span>
            </h1>

            <p className="text-white/45 text-base md:text-lg mt-8 max-w-sm mx-auto leading-relaxed font-medium">
              Curated premium products for the modern lifestyle. Quality meets style.
            </p>

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
                onClick={openCustomerPanel}
                className="glass border border-white/12 px-8 py-4 rounded-2xl font-semibold text-base
                  hover:bg-white/8 transition-all duration-200 w-full sm:w-auto"
              >
                {currentCustomer ? "My Orders" : "Login / Register"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-10 mt-16">
              {[
                { label: "Products", value: `${activeProducts.length}+` },
                { label: "Customers", value: `${customers.length}+` },
                { label: "Orders", value: `${orders.length}+` },
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
              { icon: <Zap size={19} className="text-cyan-400 flex-shrink-0" />, text: "Fast Delivery" },
              { icon: <Star size={19} className="text-cyan-400 flex-shrink-0" />, text: "Top Rated" },
              { icon: <Package2 size={19} className="text-cyan-400 flex-shrink-0" />, text: "Quality Guaranteed" },
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="text-cyan-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                Our Collection
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug">
                Featured
                <span className="block text-white/35">Products</span>
              </h2>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-2 w-fit">
              <TrendingUp size={15} className="text-cyan-400" />
              <span className="text-sm font-semibold text-white/60">
                <span className="text-cyan-400">{filteredProducts.length}</span> item(s) found
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="glass-card rounded-[28px] p-5 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Search products by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass rounded-2xl py-4 pl-11 pr-4 text-sm outline-none
                    transition placeholder:text-white/20"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass rounded-2xl py-4 px-5 text-sm outline-none transition text-white/80 bg-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-[28px]">
              <Package2 size={52} className="mx-auto text-white/10 mb-5" />
              <h3 className="font-display text-xl font-bold text-white/30 mb-2">No products found</h3>
              <p className="text-white/20 text-sm">Try another search term or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProducts.map((product, idx) => (
                <article
                  key={product.id}
                  className="product-card glass-card rounded-[28px] overflow-hidden group"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="relative h-[280px] overflow-hidden bg-white/[0.03]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-5 inset-x-0 flex justify-center gap-2
                      opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
                      transition-all duration-300">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="glass px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                      >
                        <Eye size={15} />
                        Details
                      </button>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={getAvailableStock(product) <= 0}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                          getAvailableStock(product) <= 0
                            ? "bg-white/10 text-white/30 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus size={15} />
                        {getAvailableStock(product) <= 0 ? "Out" : "Cart"}
                      </button>
                    </div>

                    <span className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white
                      px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase">
                      {product.category}
                    </span>

                    <span
                      className={`absolute top-4 right-4 backdrop-blur-sm text-white
                      px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                        getAvailableStock(product) <= 0
                          ? "bg-red-500/90"
                          : getAvailableStock(product) <= getLowStockThreshold(product)
                          ? "bg-orange-500/90"
                          : "bg-emerald-500/90"
                      }`}
                    >
                      {getAvailableStock(product) <= 0 ? "Out" : `${getAvailableStock(product)} left`}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="#facc15" className="text-yellow-400" />
                      ))}
                      <span className="text-white/30 text-[11px] ml-2">4.9 (128)</span>
                    </div>

                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-cyan-400
                      transition-colors duration-200 leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-white/35 text-xs line-clamp-2 mb-5">
                      {product.description}
                    </p>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-1">
                          Price
                        </p>
                        <p className="font-display text-2xl font-bold">
                          ₱{product.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="glass w-11 h-11 rounded-xl flex items-center justify-center"
                          aria-label={`View details of ${product.name}`}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={getAvailableStock(product) <= 0}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            getAvailableStock(product) <= 0
                              ? "bg-white/10 text-white/25 cursor-not-allowed"
                              : "btn-primary"
                          }`}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
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
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold">Your Cart</h2>
                <p className="text-white/35 text-sm mt-1.5">
                  {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in bag
                </p>
                {!currentCustomer && (
                  <p className="text-orange-400 text-xs mt-2">
                    Please login before checkout.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1">Total</p>
                <p className="font-display text-2xl md:text-3xl font-bold text-cyan-400">
                  ₱{total.toLocaleString()}
                </p>
              </div>
            </div>

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

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="glass rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:border-white/14 transition-all"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-base">{item.product.name}</h3>
                    <span className="text-cyan-400/60 text-xs font-semibold mt-0.5 block">{item.product.category}</span>
                    <p className="text-white/30 text-xs mt-1">
                      Available: {getAvailableStock(products.find((product) => product.id === item.product.id) ?? item.product)} stock(s)
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 glass rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 font-bold"
                        aria-label={`Decrease ${item.product.name} quantity`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 font-bold"
                        aria-label={`Increase ${item.product.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                    <p className="font-display font-semibold text-lg min-w-[110px] text-right">
                      ₱{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-10 h-10 bg-red-500/10 hover:bg-red-500 border border-red-500/20
                        rounded-xl flex items-center justify-center transition-all duration-200
                        text-red-400 hover:text-white"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cartItemCount > 0 && (
              <div className="mt-8 pt-8 border-t border-white/[0.07]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="glass rounded-2xl p-4">
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">
                      Payment Method
                    </p>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                    >
                      <option>Cash on Delivery</option>
                      <option>GCash</option>
                      <option>Credit / Debit Card</option>
                      <option>Bank Transfer</option>
                    </select>

                    {paymentMethod !== "Cash on Delivery" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <input
                          type="text"
                          placeholder="Payment reference number"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Proof of payment link / note"
                          value={proofOfPayment}
                          onChange={(e) => setProofOfPayment(e.target.value)}
                          className="bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="glass rounded-2xl p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-10 text-white/40">
                      <span>Subtotal</span><span>₱{total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-10 text-white/40">
                      <span>Shipping</span>
                      <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                    <div className="flex items-center justify-between gap-10 text-white pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-cyan-400 font-bold">₱{total.toLocaleString()}</span>
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

        {/* ── Customer Order History Section ─────────────────────────────── */}
        {currentCustomer && (
          <section className="max-w-7xl mx-auto px-5 md:px-8 py-16" aria-label="Customer order history">
            <div className="glass-card rounded-[32px] p-7 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-display text-3xl font-bold">My Orders</h2>
                  <p className="text-white/35 text-sm mt-1.5">
                    View order history and track order status
                  </p>
                </div>
                <button
                  onClick={openCustomerPanel}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm w-fit"
                >
                  Open Account
                </button>
              </div>

              {customerOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Clock size={46} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/30 text-sm">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="glass rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="font-bold">Order #{order.id}</p>
                          <p className="text-white/35 text-xs">{order.createdAt}</p>
                          <p className="text-cyan-400 font-bold mt-2">
                            ₱{order.total.toLocaleString()} • {order.paymentMethod}
                          </p>
                        </div>
                        <div className="md:text-right">
                          <p className={`font-bold ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </p>
                          <p className="text-white/35 text-xs">Payment: {order.paymentStatus}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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

        {/* ── Product Details Modal ──────────────────────────────────────── */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0C1120] border border-white/[0.09] rounded-[32px] w-full max-w-4xl
              max-h-[90vh] overflow-hidden animate-modal shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <div className="p-6 border-b border-white/[0.07] flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">Product Details</h2>
                  <p className="text-white/30 text-xs mt-0.5">
                    View product information before adding to cart
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="glass p-2.5 rounded-xl hover:bg-white/8 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-[340px] object-cover rounded-[24px]"
                />

                <div>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase">
                    {selectedProduct.category}
                  </span>

                  <h3 className="font-display text-3xl font-bold mt-5">
                    {selectedProduct.name}
                  </h3>

                  <p className="text-white/45 text-sm mt-4 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="glass rounded-2xl p-4">
                      <p className="text-white/30 text-xs uppercase font-bold">Price</p>
                      <p className="text-2xl font-bold text-cyan-400 mt-1">
                        ₱{selectedProduct.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="glass rounded-2xl p-4">
                      <p className="text-white/30 text-xs uppercase font-bold">Stock</p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          getAvailableStock(selectedProduct) <= 0
                            ? "text-red-400"
                            : getAvailableStock(selectedProduct) <= getLowStockThreshold(selectedProduct)
                            ? "text-orange-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {getAvailableStock(selectedProduct)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={getAvailableStock(selectedProduct) <= 0}
                    className={`w-full py-4 rounded-2xl font-bold mt-6 flex items-center justify-center gap-2 ${
                      getAvailableStock(selectedProduct) <= 0
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "btn-primary"
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {getAvailableStock(selectedProduct) <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
        {cartOpen && (
          <div className="fixed inset-0 z-[100] flex" role="dialog" aria-label="Cart drawer" aria-modal>
            <div
              className="flex-1 bg-black/55 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />

            <div className="w-full max-w-[380px] bg-[#0C1120] border-l border-white/[0.08]
              flex flex-col animate-drawer shadow-2xl">
              <div className="p-6 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-display text-xl font-bold">Cart</h2>
                  <p className="text-white/30 text-xs mt-0.5">{cartItemCount} item{cartItemCount !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="glass p-2.5 rounded-xl hover:bg-white/8 transition"
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart size={44} className="mx-auto text-white/8 mb-4" />
                    <p className="text-white/25 font-semibold text-sm">Nothing here yet</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        <p className="font-display text-cyan-400 font-semibold text-base mt-0.5">
                          ₱{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 glass rounded-lg text-sm font-bold"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold text-white/70">Qty: {item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 glass rounded-lg text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400/60 hover:text-red-400 transition p-1"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cartItemCount > 0 && (
                <div className="p-5 border-t border-white/[0.07] flex-shrink-0">
                  <div className="mb-4">
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">
                      Payment Method
                    </p>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                    >
                      <option>Cash on Delivery</option>
                      <option>GCash</option>
                      <option>Credit / Debit Card</option>
                      <option>Bank Transfer</option>
                    </select>

                    {paymentMethod !== "Cash on Delivery" && (
                      <div className="space-y-2 mt-3">
                        <input
                          type="text"
                          placeholder="Payment reference number"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="w-full bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Proof link / note"
                          value={proofOfPayment}
                          onChange={(e) => setProofOfPayment(e.target.value)}
                          className="w-full bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                    )}
                  </div>

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

        {/* ── Customer Modal ──────────────────────────────────────────────── */}
        {customerOpen && (
          <div
            className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-label="Customer account"
            aria-modal
          >
            <div className="bg-[#0C1120] border border-white/[0.09] rounded-[32px] w-full max-w-3xl
              max-h-[90vh] overflow-hidden flex flex-col animate-modal shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <div className="p-6 md:p-8 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 btn-primary rounded-2xl flex items-center justify-center">
                    <User size={19} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      {customerMode === "account"
                        ? "Customer Account"
                        : customerMode === "login"
                        ? "Customer Login"
                        : "Customer Registration"}
                    </h2>
                    <p className="text-white/30 text-xs mt-0.5">
                      {currentCustomer
                        ? `${customerOrders.length} order(s) found`
                        : "Login or register to checkout and track orders"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCustomerOpen(false)}
                  className="glass p-2.5 rounded-xl hover:bg-white/8 transition"
                  aria-label="Close customer panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 md:p-8">
                {customerMode === "login" && (
                  <div className="max-w-[360px] mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 btn-primary rounded-3xl flex items-center justify-center
                        mx-auto mb-6 animate-pulse-ring">
                        <LogIn size={30} />
                      </div>
                      <h3 className="font-display text-2xl font-bold">Login to Your Account</h3>
                      <p className="text-white/30 text-sm mt-2">
                        Demo customer: <span className="text-cyan-400 font-semibold">juan@example.com / 123456</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={customerForm.email}
                        onChange={(e) =>
                          setCustomerForm({ ...customerForm, email: e.target.value })
                        }
                        className="w-full glass rounded-2xl py-4 px-5 text-sm outline-none
                          transition placeholder:text-white/20"
                      />

                      <input
                        type="password"
                        placeholder="Password"
                        value={customerForm.password}
                        onChange={(e) =>
                          setCustomerForm({ ...customerForm, password: e.target.value })
                        }
                        onKeyDown={(e) => e.key === "Enter" && loginCustomer()}
                        className="w-full glass rounded-2xl py-4 px-5 text-sm outline-none
                          transition placeholder:text-white/20"
                      />

                      <button
                        onClick={loginCustomer}
                        className="w-full btn-primary py-4 rounded-2xl font-bold text-base mt-1"
                      >
                        Login
                      </button>

                      <button
                        onClick={() => {
                          setCustomerMode("register");
                          setCustomerForm({ name: "", email: "", password: "" });
                        }}
                        className="w-full glass py-4 rounded-2xl font-bold text-base text-white/60 hover:text-white"
                      >
                        Create New Account
                      </button>
                    </div>
                  </div>
                )}

                {customerMode === "register" && (
                  <div className="max-w-[360px] mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 btn-primary rounded-3xl flex items-center justify-center
                        mx-auto mb-6 animate-pulse-ring">
                        <UserPlus size={30} />
                      </div>
                      <h3 className="font-display text-2xl font-bold">Register Customer Account</h3>
                      <p className="text-white/30 text-sm mt-2">
                        Create an account to checkout and track orders.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={customerForm.name}
                        onChange={(e) =>
                          setCustomerForm({ ...customerForm, name: e.target.value })
                        }
                        className="w-full glass rounded-2xl py-4 px-5 text-sm outline-none
                          transition placeholder:text-white/20"
                      />

                      <input
                        type="email"
                        placeholder="Email Address"
                        value={customerForm.email}
                        onChange={(e) =>
                          setCustomerForm({ ...customerForm, email: e.target.value })
                        }
                        className="w-full glass rounded-2xl py-4 px-5 text-sm outline-none
                          transition placeholder:text-white/20"
                      />

                      <input
                        type="password"
                        placeholder="Password"
                        value={customerForm.password}
                        onChange={(e) =>
                          setCustomerForm({ ...customerForm, password: e.target.value })
                        }
                        onKeyDown={(e) => e.key === "Enter" && registerCustomer()}
                        className="w-full glass rounded-2xl py-4 px-5 text-sm outline-none
                          transition placeholder:text-white/20"
                      />

                      <button
                        onClick={registerCustomer}
                        className="w-full btn-primary py-4 rounded-2xl font-bold text-base mt-1"
                      >
                        Register
                      </button>

                      <button
                        onClick={() => {
                          setCustomerMode("login");
                          setCustomerForm({ name: "", email: "", password: "" });
                        }}
                        className="w-full glass py-4 rounded-2xl font-bold text-base text-white/60 hover:text-white"
                      >
                        Already have an account? Login
                      </button>
                    </div>
                  </div>
                )}

                {customerMode === "account" && currentCustomer && (
                  <div>
                    <div className="glass-card rounded-3xl p-6 mb-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                          <h3 className="font-display text-2xl font-bold">
                            {currentCustomer.name}
                          </h3>
                          <p className="text-white/35 text-sm mt-1">
                            {currentCustomer.email}
                          </p>
                          <p className="text-emerald-400 text-sm font-bold mt-2">
                            Account Status: {currentCustomer.status}
                          </p>
                        </div>

                        <button
                          onClick={logoutCustomer}
                          className="bg-red-500/10 hover:bg-red-500 border border-red-500/20
                            px-5 py-3 rounded-xl text-red-400 hover:text-white font-bold text-sm transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold mb-5">
                      Order History and Status Tracking
                    </h3>

                    {customerOrders.length === 0 ? (
                      <div className="text-center py-20 glass-card rounded-3xl">
                        <Clock size={44} className="mx-auto text-white/10 mb-4" />
                        <p className="text-white/30 text-sm">No orders found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerOrders.map((order) => (
                          <div key={order.id} className="glass rounded-2xl p-5">
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
                              <div>
                                <p className="font-bold">Order #{order.id}</p>
                                <p className="text-white/35 text-xs">{order.createdAt}</p>
                                <p className="text-white/45 text-sm mt-2">
                                  Payment Method: {order.paymentMethod}
                                </p>
                                <p className="text-cyan-400 font-bold mt-1">
                                  ₱{order.total.toLocaleString()}
                                </p>

                                <div className="mt-3 space-y-1">
                                  {order.items.map((item, idx) => (
                                    <p key={`${item.product.id}-${idx}`} className="text-white/35 text-xs">
                                      • {item.product.name} × {item.quantity} — ₱{(item.product.price * item.quantity).toLocaleString()}
                                    </p>
                                  ))}
                                </div>
                              </div>

                              <div className="lg:text-right">
                                <p className="text-emerald-400 text-sm font-bold">
                                  Payment: {order.paymentStatus}
                                </p>
                                <p className={`text-lg font-bold mt-2 ${getStatusColor(order.orderStatus)}`}>
                                  {order.orderStatus}
                                </p>
                                <p className="text-white/30 text-xs mt-1">
                                  Current order status
                                </p>

                                <div className="mt-4 glass rounded-2xl p-4 text-left">
                                  <p className="text-white/40 text-xs font-bold uppercase mb-3">
                                    Tracking
                                  </p>
                                  <div className="space-y-2 text-xs">
                                    <p className={order.orderStatus === "Pending" ? "text-orange-400 font-bold" : "text-white/30"}>
                                      1. Pending
                                    </p>
                                    <p className={order.orderStatus === "Confirmed" ? "text-blue-400 font-bold" : "text-white/30"}>
                                      2. Availability Confirmed
                                    </p>
                                    <p className={order.orderStatus === "Preparing" ? "text-cyan-400 font-bold" : "text-white/30"}>
                                      3. Preparing
                                    </p>
                                    <p className={order.orderStatus === "Ready for Pickup" || order.orderStatus === "Out for Delivery" ? "text-purple-400 font-bold" : "text-white/30"}>
                                      4. {order.fulfillmentType === "Pickup" ? "Ready for Pickup" : "Out for Delivery"}
                                    </p>
                                    <p className={order.orderStatus === "Completed" ? "text-emerald-400 font-bold" : "text-white/30"}>
                                      5. Completed
                                    </p>
                                    <p className={order.orderStatus === "Cancelled" ? "text-red-400 font-bold" : "text-white/30"}>
                                      Cancelled
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Seller / Store Staff Modal ───────────────────────────────────── */}
        {sellerOpen && (
          <div
            className="fixed inset-0 z-[105] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-label="Seller or store staff dashboard"
            aria-modal
          >
            <div className="bg-[#0C1120] border border-white/[0.09] rounded-[32px] w-full max-w-6xl
              max-h-[90vh] overflow-hidden flex flex-col animate-modal shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <div className="p-6 md:p-8 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 btn-primary rounded-2xl flex items-center justify-center">
                    <Package2 size={19} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">Seller / Store Staff Dashboard</h2>
                    <p className="text-white/30 text-xs mt-0.5">
                      {currentSeller
                        ? `${pendingOrders.length} pending order(s) • ${assignedSellerOrders.length} assigned transaction(s)`
                        : "Login to process customer orders"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSellerOpen(false);
                    setCurrentSeller(null);
                    setSellerLogin({ email: "", password: "" });
                    setSellerTab("pending");
                  }}
                  className="glass p-2.5 rounded-xl border border-transparent
                    hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                  aria-label="Close seller panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {!currentSeller ? (
                  <div className="p-8 md:p-12">
                    <div className="max-w-[360px] mx-auto">
                      <div className="text-center mb-10">
                        <div className="w-20 h-20 btn-primary rounded-3xl flex items-center justify-center
                          mx-auto mb-6 animate-pulse-ring">
                          <LogIn size={30} />
                        </div>
                        <h3 className="font-display text-2xl font-bold">Seller Login</h3>
                        <p className="text-white/30 text-sm mt-2">
                          Demo seller: <span className="text-cyan-400 font-semibold">carlo@adzstore.com / seller123</span>
                        </p>
                        <p className="text-white/25 text-xs mt-1">
                          Demo staff: ana@adzstore.com / staff123
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                          <input
                            type="email"
                            placeholder="Seller Email"
                            value={sellerLogin.email}
                            onChange={(e) => setSellerLogin({ ...sellerLogin, email: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && sellerStaffLogin()}
                            className="w-full glass rounded-2xl py-4 pl-11 pr-4 text-sm outline-none
                              transition placeholder:text-white/20"
                          />
                        </div>

                        <div className="relative">
                          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                          <input
                            type="password"
                            placeholder="Password"
                            value={sellerLogin.password}
                            onChange={(e) => setSellerLogin({ ...sellerLogin, password: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && sellerStaffLogin()}
                            className="w-full glass rounded-2xl py-4 pl-11 pr-4 text-sm outline-none
                              transition placeholder:text-white/20"
                          />
                        </div>

                        <button
                          onClick={sellerStaffLogin}
                          className="w-full btn-primary py-4 rounded-2xl font-bold text-base"
                        >
                          Login as Seller / Staff
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 md:p-8">
                    <div className="glass-card rounded-3xl p-6 mb-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                          <h3 className="font-display text-2xl font-bold">{currentSeller.name}</h3>
                          <p className="text-white/35 text-sm mt-1">
                            {currentSeller.email} • {currentSeller.role}
                          </p>
                          <p className="text-emerald-400 text-sm font-bold mt-2">
                            Account Status: {currentSeller.status}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="glass rounded-2xl px-4 py-3">
                            <p className="text-2xl font-bold text-orange-400">{pendingOrders.length}</p>
                            <p className="text-white/35 text-[10px] uppercase font-bold">Pending</p>
                          </div>
                          <div className="glass rounded-2xl px-4 py-3">
                            <p className="text-2xl font-bold text-cyan-400">{assignedSellerOrders.length}</p>
                            <p className="text-white/35 text-[10px] uppercase font-bold">Assigned</p>
                          </div>
                          <div className="glass rounded-2xl px-4 py-3">
                            <p className="text-2xl font-bold text-emerald-400">{sellerCompletedOrders}</p>
                            <p className="text-white/35 text-[10px] uppercase font-bold">Completed</p>
                          </div>
                        </div>

                        <button
                          onClick={logoutSeller}
                          className="bg-red-500/10 hover:bg-red-500 border border-red-500/20
                            px-5 py-3 rounded-xl text-red-400 hover:text-white font-bold text-sm transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {sellerTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setSellerTab(tab.key)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                            sellerTab === tab.key
                              ? "btn-primary"
                              : "glass text-white/55 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {sellerTab === "pending" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">Pending Orders</h3>

                        {pendingOrders.length === 0 ? (
                          <div className="text-center py-20 glass-card rounded-3xl">
                            <Package2 size={44} className="mx-auto text-white/10 mb-4" />
                            <p className="text-white/30 text-sm">No pending orders.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {pendingOrders.map((order) => (
                              <div key={order.id} className="glass rounded-2xl p-5">
                                <div className="flex flex-col xl:flex-row xl:justify-between gap-5">
                                  <div>
                                    <p className="font-bold">Order #{order.id}</p>
                                    <p className="text-white/35 text-xs">{order.createdAt}</p>
                                    <p className="text-white/45 text-sm mt-2">
                                      Customer: {order.customerName}
                                    </p>
                                    <p className="text-white/35 text-xs">{order.customerEmail}</p>
                                    <p className="text-cyan-400 font-bold mt-1">
                                      ₱{order.total.toLocaleString()}
                                    </p>
                                    <p className="text-white/35 text-xs mt-1">
                                      Assigned: {order.assignedStaffName ?? "Unassigned"}
                                    </p>

                                    <div className="mt-3 space-y-1">
                                      {order.items.map((item, idx) => (
                                        <p key={`${item.product.id}-${idx}`} className="text-white/35 text-xs">
                                          • {item.product.name} × {item.quantity} — ₱{(item.product.price * item.quantity).toLocaleString()}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="xl:text-right space-y-2 min-w-[240px]">
                                    <p className={`text-lg font-bold ${getStatusColor(order.orderStatus)}`}>
                                      {order.orderStatus}
                                    </p>
                                    <p className="text-white/35 text-xs">
                                      Availability: {order.availabilityConfirmed ? "Confirmed" : "Needs checking"}
                                    </p>
                                    <button
                                      onClick={() => confirmOrderAvailability(order)}
                                      className="w-full btn-primary px-4 py-3 rounded-xl text-xs font-bold"
                                    >
                                      Confirm Availability
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateSellerOrder(
                                          order.id,
                                          { orderStatus: "Preparing", sellerNotes: "Products are being prepared by store staff." },
                                          "Order moved to preparing"
                                        )
                                      }
                                      className="w-full glass px-4 py-3 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                                    >
                                      Update to Preparing
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {sellerTab === "assigned" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">Assigned Transactions</h3>

                        {assignedSellerOrders.length === 0 ? (
                          <div className="text-center py-20 glass-card rounded-3xl">
                            <Clock size={44} className="mx-auto text-white/10 mb-4" />
                            <p className="text-white/30 text-sm">No assigned transactions yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {assignedSellerOrders.map((order) => (
                              <div key={order.id} className="glass rounded-2xl p-5">
                                <div className="flex flex-col xl:flex-row xl:justify-between gap-5">
                                  <div>
                                    <p className="font-bold">Order #{order.id}</p>
                                    <p className="text-white/35 text-xs">{order.createdAt}</p>
                                    <p className="text-white/45 text-sm mt-2">
                                      Customer: {order.customerName}
                                    </p>
                                    <p className="text-cyan-400 font-bold mt-1">
                                      ₱{order.total.toLocaleString()}
                                    </p>
                                    <p className="text-white/35 text-xs mt-1">
                                      Payment: {order.paymentStatus} • {order.paymentMethod}
                                    </p>
                                    <p className="text-white/35 text-xs mt-1">
                                      Fulfillment: {order.fulfillmentType}
                                    </p>
                                    {order.sellerNotes && (
                                      <p className="text-white/35 text-xs mt-2">
                                        Note: {order.sellerNotes}
                                      </p>
                                    )}
                                  </div>

                                  <div className="xl:text-right space-y-2 min-w-[250px]">
                                    <p className={`text-lg font-bold ${getStatusColor(order.orderStatus)}`}>
                                      {order.orderStatus}
                                    </p>
                                    <select
                                      value={order.orderStatus}
                                      onChange={(e) =>
                                        updateSellerOrder(
                                          order.id,
                                          { orderStatus: e.target.value as OrderStatus },
                                          "Order status updated"
                                        )
                                      }
                                      className="w-full bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                                    >
                                      <option>Pending</option>
                                      <option>Confirmed</option>
                                      <option>Preparing</option>
                                      <option>Ready for Pickup</option>
                                      <option>Out for Delivery</option>
                                      <option>Completed</option>
                                      <option>Cancelled</option>
                                    </select>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                                      <button
                                        onClick={() => prepareOrderForFulfillment(order, "Pickup")}
                                        className="glass px-4 py-3 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                                      >
                                        Prepare for Pickup
                                      </button>
                                      <button
                                        onClick={() => prepareOrderForFulfillment(order, "Delivery")}
                                        className="glass px-4 py-3 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                                      >
                                        Prepare for Delivery
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => markOrderCompleted(order.id)}
                                      disabled={order.orderStatus === "Completed"}
                                      className={`w-full px-4 py-3 rounded-xl text-xs font-bold ${
                                        order.orderStatus === "Completed"
                                          ? "bg-white/10 text-white/25 cursor-not-allowed"
                                          : "btn-primary"
                                      }`}
                                    >
                                      Mark as Completed
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {sellerTab === "lowStock" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">Report Low-Stock Products</h3>

                        {lowStockProducts.length === 0 ? (
                          <div className="text-center py-20 glass-card rounded-3xl">
                            <Check size={44} className="mx-auto text-emerald-400/30 mb-4" />
                            <p className="text-white/30 text-sm">No low-stock products right now.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {lowStockProducts.map((product) => (
                              <div key={product.id} className="glass rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                                  />
                                  <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-white/35 text-xs">{product.category}</p>
                                  </div>
                                </div>
                                <div className="md:text-right">
                                  <p className={getAvailableStock(product) <= 0 ? "text-red-400 font-bold" : "text-orange-400 font-bold"}>
                                    {getAvailableStock(product)} stock(s) left
                                  </p>
                                  <button
                                    onClick={() => reportLowStockProduct(product)}
                                    className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold mt-2"
                                  >
                                    Report Low Stock
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Admin Modal ─────────────────────────────────────────────────── */}
        {adminOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-label="Admin dashboard"
            aria-modal
          >
            <div className="bg-[#0C1120] border border-white/[0.09] rounded-[32px] w-full max-w-5xl
              max-h-[90vh] overflow-hidden flex flex-col animate-modal shadow-[0_40px_100px_rgba(0,0,0,0.6)]">

              <div className="p-6 md:p-8 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 btn-primary rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">Admin Dashboard</h2>
                    <p className="text-white/30 text-xs mt-0.5">
                      {activeProducts.length} active products • {orders.length} orders
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdminOpen(false);
                    setIsAdmin(false);
                    setLogin({ username: "", password: "" });
                    setEditingProductId(null);
                    setNewProduct({
                      name: "",
                      price: "",
                      image: "",
                      category: "",
                      stock: "",
                      description: "",
                    });
                  }}
                  className="glass p-2.5 rounded-xl border border-transparent
                    hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                  aria-label="Close admin panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {!isAdmin ? (
                  <div className="p-8 md:p-12">
                    <div className="max-w-[320px] mx-auto">
                      <div className="text-center mb-10">
                        <div className="w-20 h-20 btn-primary rounded-3xl flex items-center justify-center
                          mx-auto mb-6 animate-pulse-ring">
                          <Lock size={30} />
                        </div>
                        <h3 className="font-display text-2xl font-bold">Admin Login</h3>
                        <p className="text-white/30 text-sm mt-2">
                          Demo: <span className="text-cyan-400 font-semibold">admin </span>
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
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-8">
                      {adminTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setAdminTab(tab.key)}
                          className={`px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition ${
                            adminTab === tab.key
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                              : "glass text-white/45 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {adminTab === "dashboard" && (
                      <div>
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                          <div>
                            <h3 className="font-display text-xl font-bold">Admin Analytics Dashboard</h3>
                            <p className="text-white/35 text-sm mt-1">
                              Monitor sales, orders, payments, inventory, and staff performance in one view.
                            </p>
                          </div>
                          <div className="glass px-4 py-3 rounded-2xl text-xs text-white/45">
                            Updated: {new Date().toLocaleString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                          {[
                            { label: "Verified Sales", value: `₱${totalSales.toLocaleString()}`, sub: `${verifiedPaymentOrders.length} paid order(s)` },
                            { label: "Average Order", value: `₱${Math.round(averageOrderValue).toLocaleString()}`, sub: `${orders.length} total order(s)` },
                            { label: "Pending Payments", value: pendingPaymentOrders.length, sub: "Need admin verification" },
                            { label: "Inventory Value", value: `₱${inventoryValue.toLocaleString()}`, sub: `${totalStockUnits} stock units` },
                            { label: "Reserved Stock", value: totalReservedUnits, sub: `₱${reservedInventoryValue.toLocaleString()} reserved` },
                          ].map((card) => (
                            <div key={card.label} className="glass-card rounded-2xl p-5">
                              <p className="text-white/40 text-[11px] uppercase font-bold tracking-wider">{card.label}</p>
                              <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                              <p className="text-white/30 text-xs mt-2">{card.sub}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Order Status Breakdown</h4>
                            <div className="space-y-4">
                              {orderStatusSummary.map((item) => {
                                const maxCount = Math.max(...orderStatusSummary.map((status) => status.count), 1);
                                return (
                                  <div key={item.status}>
                                    <div className="flex justify-between text-xs mb-2">
                                      <span className="text-white/60">{item.status}</span>
                                      <span className="font-bold text-cyan-400">{item.count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                                      <div
                                        className="h-full bg-cyan-500 rounded-full"
                                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Payment Method Analytics</h4>
                            <div className="space-y-3">
                              {paymentMethodSummary.map((item) => (
                                <div key={item.method} className="glass rounded-2xl p-4 flex justify-between gap-4">
                                  <div>
                                    <p className="font-semibold">{item.method}</p>
                                    <p className="text-white/35 text-xs">{item.count} order(s)</p>
                                  </div>
                                  <p className="text-cyan-400 font-bold">₱{item.sales.toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Revenue by Category</h4>
                            {revenueByCategory.length === 0 ? (
                              <p className="text-white/30 text-sm">No paid revenue yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {revenueByCategory.map((item) => (
                                  <div key={item.category} className="glass rounded-2xl p-4 flex justify-between">
                                    <span className="font-semibold">{item.category}</span>
                                    <span className="text-cyan-400 font-bold">₱{item.sales.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Top-Selling Products</h4>
                            {topSellingProducts.length === 0 ? (
                              <p className="text-white/30 text-sm">No product sales yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {topSellingProducts.map((item) => (
                                  <div key={item.product.id} className="glass rounded-2xl p-4">
                                    <div className="flex justify-between gap-3">
                                      <p className="font-semibold">{item.product.name}</p>
                                      <p className="text-cyan-400 font-bold">x{item.quantity}</p>
                                    </div>
                                    <p className="text-white/35 text-xs mt-1">₱{item.sales.toLocaleString()} revenue</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Staff Workload</h4>
                            <div className="space-y-3">
                              {staffPerformance.map((item) => (
                                <div key={item.staff.id} className="glass rounded-2xl p-4">
                                  <div className="flex justify-between gap-3">
                                    <p className="font-semibold">{item.staff.name}</p>
                                    <p className="text-cyan-400 font-bold">{item.completed}/{item.assigned}</p>
                                  </div>
                                  <p className="text-white/35 text-xs mt-1">
                                    {item.staff.role} • ₱{item.sales.toLocaleString()} completed sales
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {adminTab === "products" && (
                      <div>
                        <section className="glass-card rounded-3xl p-6 mb-8" aria-label="Add or edit product">
                          <h3 className="font-display text-base font-bold mb-5 flex items-center gap-2">
                            <Plus size={18} className="text-cyan-400" />
                            {editingProductId ? "Edit Product" : "Add New Product"}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <input
                              type="text"
                              placeholder="Product Name"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition placeholder:text-white/20"
                            />

                            <input
                              type="number"
                              placeholder="Price (₱)"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition placeholder:text-white/20"
                            />

                            <select
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition text-white/80 bg-transparent"
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              placeholder="Stock Quantity"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition placeholder:text-white/20"
                            />

                            <input
                              type="text"
                              placeholder="Image URL"
                              value={newProduct.image}
                              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition placeholder:text-white/20 sm:col-span-2"
                            />

                            <textarea
                              placeholder="Product Description"
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none
                                transition placeholder:text-white/20 sm:col-span-2 min-h-[100px]"
                            />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={editingProductId ? updateProduct : addProduct}
                              className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
                            >
                              <Plus size={15} />
                              {editingProductId ? "Update Product" : "Add Product"}
                            </button>

                            {editingProductId && (
                              <button
                                onClick={cancelEditProduct}
                                className="glass px-6 py-3 rounded-xl font-semibold text-sm text-white/60 hover:text-white"
                              >
                                Cancel Edit
                              </button>
                            )}
                          </div>
                        </section>

                        <div>
                          <h3 className="font-display text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                            All Products ({products.length})
                          </h3>
                          <div className="space-y-3">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className={`glass rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4
                                  hover:border-white/14 transition-all duration-200 ${
                                    product.archived ? "opacity-60" : ""
                                  }`}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-semibold text-sm truncate">{product.name}</p>
                                      {product.archived && (
                                        <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                          Archived
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-cyan-400/55 text-xs font-semibold">
                                      {product.category} • {getAvailableStock(product)} stock
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 md:flex-shrink-0">
                                  <p className="font-display font-semibold text-base mr-2">
                                    ₱{product.price.toLocaleString()}
                                  </p>

                                  <button
                                    onClick={() => startEditProduct(product)}
                                    className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/20
                                      rounded-xl transition-all duration-200 text-cyan-400 hover:text-white text-xs font-bold"
                                  >
                                    Edit
                                  </button>

                                  {product.archived ? (
                                    <button
                                      onClick={() => restoreProduct(product.id)}
                                      className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20
                                        rounded-xl transition-all duration-200 text-emerald-400 hover:text-white text-xs font-bold"
                                    >
                                      Restore
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => archiveProduct(product.id)}
                                      className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500 border border-orange-500/20
                                        rounded-xl transition-all duration-200 text-orange-400 hover:text-white text-xs font-bold"
                                    >
                                      Archive
                                    </button>
                                  )}

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

                    {adminTab === "categories" && (
                      <div className="glass-card rounded-3xl p-6">
                        <h3 className="font-display text-lg font-bold mb-5">
                          Manage Product Categories
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                          <input
                            type="text"
                            placeholder="New category"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCategory()}
                            className="glass rounded-2xl py-3 px-5 text-sm outline-none flex-1 placeholder:text-white/20"
                          />
                          <button
                            onClick={addCategory}
                            className="btn-primary px-6 py-3 rounded-xl font-bold"
                          >
                            Add Category
                          </button>
                        </div>

                        <div className="space-y-3">
                          {categories.map((category) => (
                            <div key={category} className="glass rounded-2xl p-4 flex justify-between items-center">
                              <div>
                                <span className="font-semibold">{category}</span>
                                <p className="text-white/35 text-xs mt-1">
                                  {products.filter((p) => p.category === category).length} product(s)
                                </p>
                              </div>
                              <button
                                onClick={() => deleteCategory(category)}
                                className="text-red-400 text-sm font-semibold hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {adminTab === "inventory" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">
                          Inventory Stock Monitoring
                        </h3>

                        <div className="glass-card rounded-3xl p-6 mb-8">
                          <h4 className="font-bold mb-4">Restock / Manual Stock Adjustment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={restockForm.productId}
                              onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none bg-transparent"
                            >
                              <option value="">Select Product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={restockForm.quantity}
                              onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Reason / supplier note"
                              value={restockForm.reason}
                              onChange={(e) => setRestockForm({ ...restockForm, reason: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <button onClick={restockProduct} className="btn-primary py-3.5 rounded-2xl font-bold text-sm">
                              Restock Product
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="glass rounded-2xl p-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                                />
                                <div>
                                  <p className="font-semibold">{product.name}</p>
                                  <p className="text-white/35 text-xs">
                                    {product.category} {product.archived ? "• Archived" : ""}
                                  </p>
                                  <p className="text-white/25 text-xs mt-1">
                                    Inventory value: ₱{(product.price * product.stock).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm xl:min-w-[520px]">
                                <div className="glass rounded-xl p-3">
                                  <p className="text-white/30 text-[10px] uppercase font-bold">On Hand</p>
                                  <p className="font-bold">{product.stock}</p>
                                </div>
                                <div className="glass rounded-xl p-3">
                                  <p className="text-white/30 text-[10px] uppercase font-bold">Reserved</p>
                                  <p className="font-bold text-orange-400">{getReservedStock(product)}</p>
                                </div>
                                <div className="glass rounded-xl p-3">
                                  <p className="text-white/30 text-[10px] uppercase font-bold">Available</p>
                                  <p className={`font-bold ${getAvailableStock(product) <= 0 ? "text-red-400" : getAvailableStock(product) <= getLowStockThreshold(product) ? "text-orange-400" : "text-emerald-400"}`}>
                                    {getAvailableStock(product)}
                                  </p>
                                </div>
                                <div className="glass rounded-xl p-3">
                                  <p className="text-white/30 text-[10px] uppercase font-bold">Low Limit</p>
                                  <input
                                    type="number"
                                    value={getLowStockThreshold(product)}
                                    onChange={(e) =>
                                      setProducts((prev) =>
                                        prev.map((item) =>
                                          item.id === product.id
                                            ? { ...item, lowStockThreshold: Number(e.target.value) }
                                            : item
                                        )
                                      )
                                    }
                                    className="w-full bg-transparent outline-none font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Seller Low-Stock Reports</h4>
                            {lowStockReports.length === 0 ? (
                              <p className="text-white/30 text-sm">No low-stock reports submitted yet.</p>
                            ) : (
                              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {lowStockReports.map((report) => (
                                  <div key={report.id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{report.productName}</p>
                                      <p className="text-white/35 text-xs">Reported by {report.reportedBy}</p>
                                    </div>
                                    <div className="sm:text-right">
                                      <p className="text-orange-400 font-bold">{report.stock} available stock(s)</p>
                                      <p className="text-white/35 text-xs">{report.createdAt}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="glass-card rounded-3xl p-6">
                            <h4 className="font-bold mb-4">Stock Adjustment History</h4>
                            {stockAdjustments.length === 0 ? (
                              <p className="text-white/30 text-sm">No stock adjustments yet.</p>
                            ) : (
                              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {stockAdjustments.slice(0, 12).map((log) => (
                                  <div key={log.id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{log.productName}</p>
                                      <p className="text-white/35 text-xs">{log.type} • {log.reason}</p>
                                      <p className="text-white/25 text-xs mt-1">By {log.createdBy}</p>
                                    </div>
                                    <div className="sm:text-right">
                                      <p className={`font-bold ${log.quantity >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {log.quantity >= 0 ? "+" : ""}{log.quantity}
                                      </p>
                                      <p className="text-white/35 text-xs">{log.createdAt}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {adminTab === "customers" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">
                          Customer Accounts
                        </h3>

                        <div className="space-y-3">
                          {customers.map((customer) => (
                            <div key={customer.id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              <div>
                                <p className="font-semibold">{customer.name}</p>
                                <p className="text-white/35 text-xs">{customer.email}</p>
                                <p className="text-white/25 text-xs mt-1">
                                  Orders: {orders.filter((order) => order.customerId === customer.id).length}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-sm font-bold ${
                                    customer.status === "Active"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {customer.status}
                                </span>
                                <button
                                  onClick={() => toggleCustomerStatus(customer.id)}
                                  className="glass px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                                >
                                  {customer.status === "Active" ? "Block" : "Activate"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {adminTab === "staff" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">
                          Seller / Store Staff Management
                        </h3>

                        <div className="glass-card rounded-3xl p-6 mb-8">
                          <h4 className="font-bold mb-4">{editingStaffId ? "Edit Staff Account" : "Add Staff Account"}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={staffForm.name}
                              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={staffForm.email}
                              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Password"
                              value={staffForm.password}
                              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <select
                              value={staffForm.role}
                              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as StaffAccount["role"] })}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none bg-transparent"
                            >
                              <option>Seller</option>
                              <option>Store Staff</option>
                            </select>
                            <button onClick={saveStaffAccount} className="btn-primary py-3.5 rounded-2xl font-bold text-sm">
                              {editingStaffId ? "Update" : "Add Staff"}
                            </button>
                          </div>
                          {editingStaffId && (
                            <button onClick={cancelEditStaff} className="glass px-5 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white mt-3">
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {staffAccounts.map((staff) => {
                            const performance = staffPerformance.find((item) => item.staff.id === staff.id);
                            return (
                              <div key={staff.id} className="glass rounded-2xl p-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                                <div>
                                  <p className="font-semibold">{staff.name}</p>
                                  <p className="text-white/35 text-xs">{staff.email}</p>
                                  <p className="text-white/25 text-xs mt-1">Password: {staff.password}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm lg:min-w-[520px]">
                                  <div className="glass rounded-xl p-3">
                                    <p className="text-white/30 text-[10px] uppercase font-bold">Role</p>
                                    <p className="text-cyan-400 font-bold">{staff.role}</p>
                                  </div>
                                  <div className="glass rounded-xl p-3">
                                    <p className="text-white/30 text-[10px] uppercase font-bold">Status</p>
                                    <p className={staff.status === "Active" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{staff.status}</p>
                                  </div>
                                  <div className="glass rounded-xl p-3">
                                    <p className="text-white/30 text-[10px] uppercase font-bold">Assigned</p>
                                    <p className="font-bold">{performance?.assigned ?? 0}</p>
                                  </div>
                                  <div className="glass rounded-xl p-3">
                                    <p className="text-white/30 text-[10px] uppercase font-bold">Completed</p>
                                    <p className="font-bold text-emerald-400">{performance?.completed ?? 0}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                  <button onClick={() => startEditStaff(staff)} className="glass px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white">
                                    Edit
                                  </button>
                                  <button onClick={() => toggleStaffStatus(staff.id)} className="glass px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white">
                                    {staff.status === "Active" ? "Deactivate" : "Activate"}
                                  </button>
                                  <button onClick={() => deleteStaffAccount(staff.id)} className="bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white">
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {adminTab === "orders" && (
                      <div>
                        <h3 className="font-display text-lg font-bold mb-5">
                          Orders, Assignments, and Payment Verification
                        </h3>

                        {orders.length === 0 ? (
                          <div className="text-center py-20 glass-card rounded-3xl">
                            <Package2 size={44} className="mx-auto text-white/10 mb-4" />
                            <p className="text-white/30 text-sm">No orders yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <div key={order.id} className="glass rounded-2xl p-5">
                                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-5">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <p className="font-bold">Order #{order.id}</p>
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusColor(order.orderStatus)} bg-white/5`}>
                                        {order.orderStatus}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-white/50">
                                        {getOrderItemCount(order)} item(s)
                                      </span>
                                    </div>
                                    <p className="text-white/35 text-xs">Created: {order.createdAt}</p>
                                    <p className="text-white/35 text-xs">Updated: {order.updatedAt ?? order.createdAt}</p>
                                    <p className="text-white/45 text-sm mt-2">
                                      Customer: {order.customerName}
                                    </p>
                                    <p className="text-white/35 text-xs">
                                      Email: {order.customerEmail}
                                    </p>
                                    <p className="text-cyan-400 font-bold mt-1">
                                      ₱{order.total.toLocaleString()}
                                    </p>

                                    <div className="mt-3 space-y-1">
                                      {order.items.map((item, idx) => (
                                        <p key={`${item.product.id}-${idx}`} className="text-white/35 text-xs">
                                          • {item.product.name} × {item.quantity} — ₱{(item.product.price * item.quantity).toLocaleString()}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="glass rounded-xl p-3">
                                        <p className="text-white/30 text-[10px] uppercase font-bold">Payment</p>
                                        <p className={order.paymentStatus === "Paid" ? "text-emerald-400 font-bold" : order.paymentStatus === "Pending Verification" ? "text-orange-400 font-bold" : "text-white/60 font-bold"}>
                                          {order.paymentStatus}
                                        </p>
                                        <p className="text-white/35 text-xs">{order.paymentMethod}</p>
                                        {order.paymentReference && (
                                          <p className="text-white/35 text-xs mt-1">Ref: {order.paymentReference}</p>
                                        )}
                                        {order.proofOfPayment && (
                                          <p className="text-white/35 text-xs mt-1">Proof: {order.proofOfPayment}</p>
                                        )}
                                      </div>

                                      <div className="glass rounded-xl p-3">
                                        <p className="text-white/30 text-[10px] uppercase font-bold">Fulfillment</p>
                                        <p className="font-bold text-cyan-400">{order.fulfillmentType ?? "Delivery"}</p>
                                        <p className="text-white/35 text-xs">Assigned: {order.assignedStaffName ?? "Unassigned"}</p>
                                        <p className="text-white/35 text-xs">Stock deducted: {order.stockDeducted ? "Yes" : "No"}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <select
                                        value={order.assignedStaffId ?? ""}
                                        onChange={(e) => assignOrderToStaff(order.id, Number(e.target.value))}
                                        className="bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                                      >
                                        <option value="">Assign Staff</option>
                                        {staffAccounts.map((staff) => (
                                          <option key={staff.id} value={staff.id}>{staff.name} — {staff.role}</option>
                                        ))}
                                      </select>

                                      <select
                                        value={order.orderStatus}
                                        onChange={(e) =>
                                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                                        }
                                        className="bg-[#0C1120] border border-white/10 rounded-xl p-3 text-sm outline-none"
                                      >
                                        {orderStatusOptions.map((status) => (
                                          <option key={status}>{status}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {order.paymentStatus !== "Paid" && (
                                        <button
                                          onClick={() => verifyPayment(order.id)}
                                          className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold"
                                        >
                                          Verify Payment
                                        </button>
                                      )}
                                      {order.paymentStatus === "Paid" && (
                                        <button
                                          onClick={() => markPaymentUnpaid(order.id)}
                                          className="glass px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                                        >
                                          Mark Unpaid
                                        </button>
                                      )}
                                      {order.orderStatus !== "Cancelled" && (
                                        <button
                                          onClick={() => updateOrderStatus(order.id, "Cancelled")}
                                          className="bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white"
                                        >
                                          Cancel Order
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {adminTab === "reports" && (
                      <div>
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                          <div>
                            <h3 className="font-display text-lg font-bold">Sales Report Generation</h3>
                            <p className="text-white/35 text-sm mt-1">
                              Filter, print, or export sales reports based on order and payment records.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={printSalesReport} className="glass px-5 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white">
                              Print Report
                            </button>
                            <button onClick={exportSalesReportCsv} className="btn-primary px-5 py-3 rounded-xl text-xs font-bold">
                              Export CSV
                            </button>
                          </div>
                        </div>

                        <div className="glass-card rounded-3xl p-5 mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={reportStatusFilter}
                              onChange={(e) => setReportStatusFilter(e.target.value as ReportStatusFilter)}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none bg-transparent"
                            >
                              <option value="All">All Order Statuses</option>
                              {orderStatusOptions.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                            <select
                              value={reportPaymentFilter}
                              onChange={(e) => setReportPaymentFilter(e.target.value as ReportPaymentFilter)}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none bg-transparent"
                            >
                              <option value="All">All Payment Statuses</option>
                              {paymentStatusOptions.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={reportDateFrom}
                              onChange={(e) => setReportDateFrom(e.target.value)}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                            <input
                              type="date"
                              value={reportDateTo}
                              onChange={(e) => setReportDateTo(e.target.value)}
                              className="glass rounded-2xl py-3.5 px-5 text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          <div className="glass-card rounded-2xl p-5">
                            <p className="text-white/40 text-xs uppercase font-bold">Filtered Sales</p>
                            <h3 className="text-3xl font-bold mt-2">₱{filteredReportSales.toLocaleString()}</h3>
                          </div>

                          <div className="glass-card rounded-2xl p-5">
                            <p className="text-white/40 text-xs uppercase font-bold">Filtered Orders</p>
                            <h3 className="text-3xl font-bold mt-2">{filteredReportOrders.length}</h3>
                          </div>

                          <div className="glass-card rounded-2xl p-5">
                            <p className="text-white/40 text-xs uppercase font-bold">Items in Report</p>
                            <h3 className="text-3xl font-bold mt-2">{filteredReportItemsSold}</h3>
                          </div>

                          <div className="glass-card rounded-2xl p-5">
                            <p className="text-white/40 text-xs uppercase font-bold">All-Time Sales</p>
                            <h3 className="text-3xl font-bold mt-2">₱{totalSales.toLocaleString()}</h3>
                          </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6">
                          <h4 className="font-bold mb-4">Generated Sales Summary</h4>

                          {filteredReportOrders.length === 0 ? (
                            <p className="text-white/30 text-sm">No records match the selected filters.</p>
                          ) : (
                            <div className="space-y-3">
                              {filteredReportOrders.map((order) => (
                                <div key={order.id} className="glass rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                                  <div>
                                    <p className="font-semibold">Order #{order.id}</p>
                                    <p className="text-white/35 text-xs">{order.customerName} • {order.createdAt}</p>
                                    <p className="text-white/35 text-xs mt-1">
                                      {order.items.map((item) => `${item.product.name} x${item.quantity}`).join(" • ")}
                                    </p>
                                  </div>
                                  <div className="lg:text-right">
                                    <p className="text-cyan-400 font-bold">
                                      ₱{order.total.toLocaleString()}
                                    </p>
                                    <p className="text-white/35 text-xs">
                                      {order.paymentMethod} • {order.paymentStatus} • {order.orderStatus}
                                    </p>
                                    <p className="text-white/25 text-xs mt-1">
                                      Staff: {order.assignedStaffName ?? "Unassigned"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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