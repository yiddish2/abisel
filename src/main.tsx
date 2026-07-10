import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient, type Session } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Gift,
  LogOut,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  Wine,
  X,
} from "lucide-react";
import "./styles.css";

type Category = "all" | "wine" | "gifts";
type ProductCategory = Exclude<Category, "all">;
type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  detail: string;
  badge: string;
  image: string;
};
type CartItem = Product & { quantity: number };
type FulfillmentMethod = "pickup" | "delivery";
type OrderRequest = {
  id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  fulfillment_method: FulfillmentMethod;
  address: string;
  notes: string;
  items: Array<{ name: string; quantity: number; price: number; lineTotal: number }>;
  total_amount: number;
  status: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;
const supabase =
  supabaseUrl && supabasePublishableKey ? createClient(supabaseUrl, supabasePublishableKey) : null;

const fallbackProducts: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Reserve Cabernet",
    category: "wine",
    price: 42,
    detail: "A rich red with dark fruit notes for Shabbos tables and hosted dinners.",
    badge: "Dry red",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Celebration Moscato",
    category: "wine",
    price: 28,
    detail: "Light, sweet, and easy to gift for birthdays, engagements, and thank-yous.",
    badge: "Sweet white",
    image: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Premium Kiddush Set",
    category: "gifts",
    price: 96,
    detail: "A polished cup, tray, and presentation box ready for a meaningful gift.",
    badge: "Gift boxed",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Wine & Chocolate Basket",
    category: "gifts",
    price: 74,
    detail: "A ready-to-send basket with wine, chocolates, and a handwritten note.",
    badge: "Best seller",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Sparkling Rose",
    category: "wine",
    price: 36,
    detail: "Bright bubbles for lchaims, parties, and elegant dinner pairings.",
    badge: "Sparkling",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Host Gift Bundle",
    category: "gifts",
    price: 58,
    detail: "Candles, sweets, and a small bottle arranged for a simple host gift.",
    badge: "Quick gift",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80",
  },
];

function App() {
  if (window.location.pathname === "/admin") {
    return <AdminPage />;
  }

  return <Storefront />;
}

function Storefront() {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("abisel_products")
      .select("id,name,category,price,detail,badge,image_url")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data?.length) {
      setProducts(
        data.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          detail: product.detail,
          badge: product.badge,
          image: product.image_url,
        })),
      );
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesQuery = `${product.name} ${product.detail} ${product.badge}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  }

  function completeOrder() {
    setCart([]);
    setIsCartOpen(false);
  }

  if (!isAgeConfirmed) {
    return <AgeGate onConfirm={() => setIsAgeConfirmed(true)} />;
  }

  return (
    <main className="shop-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">A</span>
          <span>Abisel Wine & Gifts</span>
        </a>
        <nav className="topnav">
          <a href="#wines">Wines</a>
          <a href="#gifts">Gifts</a>
          <a href="/admin">Admin</a>
        </nav>
        <button className="cart-button" type="button" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={19} />
          <span>{cartCount}</span>
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-content">
          <p className="eyebrow">Wines, gifts, and ready-to-send bundles</p>
          <h1>Thoughtful bottles and gift sets for every table.</h1>
          <p>Browse curated wines, host gifts, and celebration bundles with simple local order requests.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#shop">
              <ShoppingBag size={18} />
              Shop collection
            </a>
            <a className="secondary-action" href="#delivery">
              <Truck size={18} />
              Delivery notes
            </a>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="delivery">
        <div>
          <ShieldCheck size={22} />
          <span>21+ required for wine orders</span>
        </div>
        <div>
          <Gift size={22} />
          <span>Gift wrapping available</span>
        </div>
        <div>
          <Truck size={22} />
          <span>Local delivery and pickup requests</span>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-header">
          <div>
            <p className="eyebrow">Collection</p>
            <h2>Shop wines and gifts</h2>
          </div>
          <label className="search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bottles, baskets..." />
          </label>
        </div>

        <div className="filters">
          <button className={category === "all" ? "active" : ""} type="button" onClick={() => setCategory("all")}>
            All
          </button>
          <button className={category === "wine" ? "active" : ""} type="button" onClick={() => setCategory("wine")}>
            <Wine size={17} />
            Wines
          </button>
          <button className={category === "gifts" ? "active" : ""} type="button" onClick={() => setCategory("gifts")}>
            <Gift size={17} />
            Gifts
          </button>
        </div>

        <div className="product-grid" id="wines">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id} id={product.category === "gifts" ? "gifts" : undefined}>
              <img src={product.image} alt="" />
              <div className="product-body">
                <div className="product-meta">
                  <span>{product.badge}</span>
                  <strong>${product.price}</strong>
                </div>
                <h3>{product.name}</h3>
                <p>{product.detail}</p>
                <button className="primary-action full-width" type="button" onClick={() => addToCart(product)}>
                  <Plus size={18} />
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="order-note">
        <Sparkles size={22} />
        <div>
          <h2>Need a custom gift?</h2>
          <p>Use the cart as an order request. Payment can be connected next with Stripe.</p>
        </div>
      </section>

      {isCartOpen && (
        <CartPanel
          cart={cart}
          cartTotal={cartTotal}
          onClose={() => setIsCartOpen(false)}
          onOrderSubmitted={completeOrder}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </main>
  );
}

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <main className="age-gate">
      <section className="age-panel">
        <div className="brand age-brand">
          <span className="brand-mark">A</span>
          <span>Abisel Wine & Gifts</span>
        </div>
        <h1>Are you 21 or older?</h1>
        <p>Wine products are intended only for adults of legal drinking age.</p>
        <button className="primary-action" type="button" onClick={onConfirm}>
          <CheckCircle2 size={18} />
          Yes, enter shop
        </button>
      </section>
    </main>
  );
}

function CartPanel({
  cart,
  cartTotal,
  onClose,
  onOrderSubmitted,
  onUpdateQuantity,
}: {
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onOrderSubmitted: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatusMessage("Order backend is not configured yet.");
      return;
    }

    if (cart.length === 0) {
      setStatusMessage("Add at least one item before sending an order request.");
      return;
    }

    if (!isAgeConfirmed) {
      setStatusMessage("Please confirm you are 21 or older before requesting wine products.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    const orderId = crypto.randomUUID();
    const { error } = await supabase.from("abisel_order_requests").insert({
      id: orderId,
      customer_name: customerName,
      email,
      phone,
      fulfillment_method: fulfillmentMethod,
      address: fulfillmentMethod === "delivery" ? address : "",
      notes,
      age_confirmed: isAgeConfirmed,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      })),
      total_amount: cartTotal,
    });

    setIsSubmitting(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage(`Order request sent. Reference: ${orderId.slice(0, 8)}`);
    window.setTimeout(onOrderSubmitted, 1400);
  }

  return (
    <aside className="cart-panel" aria-label="Shopping cart">
      <div className="cart-header">
        <div>
          <p className="eyebrow">Order request</p>
          <h2>Your cart</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close cart">
          <X size={20} />
        </button>
      </div>

      <form className="order-form" onSubmit={submitOrder}>
        {cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty.</div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt="" />
                <div>
                  <h3>{item.name}</h3>
                  <p>${item.price}</p>
                  <div className="quantity">
                    <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                      <Plus size={16} />
                    </button>
                    <button type="button" onClick={() => onUpdateQuantity(item.id, 0)} aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="customer-fields">
          <label>
            Name
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Pickup or delivery
            <select value={fulfillmentMethod} onChange={(event) => setFulfillmentMethod(event.target.value as FulfillmentMethod)}>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>
          {fulfillmentMethod === "delivery" && (
            <label>
              Delivery address
              <input value={address} onChange={(event) => setAddress(event.target.value)} required />
            </label>
          )}
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </label>
          <label className="checkbox-row">
            <input checked={isAgeConfirmed} onChange={(event) => setIsAgeConfirmed(event.target.checked)} type="checkbox" required />
            I confirm I am 21 or older.
          </label>
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <div className="cart-footer">
          <div>
            <span>Estimated total</span>
            <strong>${cartTotal}</strong>
          </div>
          <button className="primary-action full-width" type="submit" disabled={cart.length === 0 || isSubmitting}>
            {isSubmitting ? "Sending..." : "Send order request"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));

    return () => data.subscription.unsubscribe();
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    }
  }

  if (!session) {
    return (
      <main className="admin-login">
        <form className="admin-login-panel" onSubmit={login}>
          <a className="brand" href="/">
            <span className="brand-mark">A</span>
            <span>Abisel Admin</span>
          </a>
          <h1>Admin login</h1>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          {message && <div className="status-message">{message}</div>}
          <button className="primary-action full-width" type="submit">
            Log in
          </button>
        </form>
      </main>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "wine" as ProductCategory,
    price: "",
    detail: "",
    badge: "",
    image: "",
  });

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function loadAdminData() {
    if (!supabase) return;

    const [ordersResult, productsResult] = await Promise.all([
      supabase.from("abisel_order_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("abisel_products").select("id,name,category,price,detail,badge,image_url").order("created_at", { ascending: true }),
    ]);

    if (ordersResult.error) {
      setMessage(ordersResult.error.message);
    } else {
      setOrders((ordersResult.data ?? []) as OrderRequest[]);
    }

    if (productsResult.error) {
      setMessage(productsResult.error.message);
    } else {
      setProducts(
        (productsResult.data ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          detail: product.detail,
          badge: product.badge,
          image: product.image_url,
        })),
      );
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    if (!supabase) return;

    const { error } = await supabase.from("abisel_order_requests").update({ status }).eq("id", orderId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? { ...order, status } : order)));
  }

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) return;

    const { error } = await supabase.from("abisel_products").insert({
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      detail: newProduct.detail,
      badge: newProduct.badge,
      image_url: newProduct.image,
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewProduct({ name: "", category: "wine", price: "", detail: "", badge: "", image: "" });
    await loadAdminData();
  }

  async function deleteProduct(productId: string) {
    if (!supabase || !window.confirm("Delete this item from the storefront?")) return;

    const { error } = await supabase.from("abisel_products").delete().eq("id", productId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>Abisel Admin</span>
        </a>
        <button className="secondary-admin-action" type="button" onClick={() => void supabase?.auth.signOut()}>
          <LogOut size={18} />
          Log out
        </button>
      </header>

      {message && <div className="admin-message">{message}</div>}

      <section className="admin-grid">
        <div className="admin-section">
          <div className="admin-section-header">
            <p className="eyebrow">Orders</p>
            <h1>Order requests</h1>
          </div>
          <div className="admin-list">
            {orders.map((order) => (
              <article className="admin-card" key={order.id}>
                <div className="admin-card-head">
                  <div>
                    <h2>{order.customer_name}</h2>
                    <p>{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <select value={order.status} onChange={(event) => void updateOrderStatus(order.id, event.target.value)}>
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready">Ready</option>
                    <option value="done">Done</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <p>{order.phone} · {order.email}</p>
                <p>{order.fulfillment_method === "delivery" ? `Delivery: ${order.address}` : "Pickup"}</p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${order.id}-${index}`}>
                      {item.quantity} x {item.name} (${item.lineTotal})
                    </li>
                  ))}
                </ul>
                <strong>Total: ${Number(order.total_amount)}</strong>
                {order.notes && <p>Notes: {order.notes}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <p className="eyebrow">Products</p>
            <h1>Store items</h1>
          </div>
          <form className="product-form" onSubmit={addProduct}>
            <label>
              Name
              <input value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} required />
            </label>
            <label>
              Category
              <select
                value={newProduct.category}
                onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value as ProductCategory })}
              >
                <option value="wine">Wine</option>
                <option value="gifts">Gift</option>
              </select>
            </label>
            <label>
              Price
              <input
                value={newProduct.price}
                onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })}
                min="0"
                step="0.01"
                type="number"
                required
              />
            </label>
            <label>
              Badge
              <input value={newProduct.badge} onChange={(event) => setNewProduct({ ...newProduct, badge: event.target.value })} required />
            </label>
            <label>
              Image URL
              <input value={newProduct.image} onChange={(event) => setNewProduct({ ...newProduct, image: event.target.value })} required />
            </label>
            <label>
              Detail
              <textarea
                value={newProduct.detail}
                onChange={(event) => setNewProduct({ ...newProduct, detail: event.target.value })}
                rows={3}
                required
              />
            </label>
            <button className="primary-action full-width" type="submit">
              Add item
            </button>
          </form>

          <div className="admin-list product-admin-list">
            {products.map((product) => (
              <article className="admin-card product-admin-card" key={product.id}>
                <img src={product.image} alt="" />
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.category} · ${product.price}</p>
                </div>
                <button className="danger-button" type="button" onClick={() => void deleteProduct(product.id)}>
                  <Trash2 size={17} />
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
