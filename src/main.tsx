import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Box,
  BriefcaseBusiness,
  File,
  Folder,
  FolderPlus,
  Grid3X3,
  HardDrive,
  List,
  LogOut,
  Package,
  Search,
  ShoppingBag,
  Upload,
} from "lucide-react";
import "./styles.css";

type Page = "drive" | "products" | "services";
type ViewMode = "grid" | "list";
type DriveItem = {
  id: number;
  name: string;
  type: "folder" | "file";
  meta: string;
};

const initialItems: DriveItem[] = [
  { id: 1, name: "Customer Artwork", type: "folder", meta: "12 files" },
  { id: 2, name: "Invoices", type: "folder", meta: "8 files" },
  { id: 3, name: "Catalog Draft.pdf", type: "file", meta: "2.4 MB" },
  { id: 4, name: "Product Photos.zip", type: "file", meta: "18.8 MB" },
  { id: 5, name: "Service Notes.docx", type: "file", meta: "432 KB" },
];

const products = [
  { name: "Printed Booklet", price: "$18", detail: "Stapled, full color, ready for pickup." },
  { name: "Custom Label Pack", price: "$12", detail: "Durable labels for products and shipping." },
  { name: "Photo Retouch Bundle", price: "$35", detail: "Clean images for shops, catalogs, and ads." },
];

const services = [
  { name: "Document Setup", detail: "Prepare files for print, upload, or sharing." },
  { name: "Product Listing Help", detail: "Turn raw product info into clean listings." },
  { name: "File Organization", detail: "Sort, name, and structure your digital files." },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>("drive");

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <p>Abisel</p>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="nav">
          <button className={page === "drive" ? "active" : ""} onClick={() => setPage("drive")}>
            <HardDrive size={18} />
            My Drive
          </button>
          <button className={page === "products" ? "active" : ""} onClick={() => setPage("products")}>
            <ShoppingBag size={18} />
            Products
          </button>
          <button className={page === "services" ? "active" : ""} onClick={() => setPage("services")}>
            <BriefcaseBusiness size={18} />
            Services
          </button>
        </nav>

        <button className="logout" onClick={() => setIsLoggedIn(false)}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="content">
        {page === "drive" && <DrivePage />}
        {page === "products" && <ProductsPage />}
        {page === "services" && <ServicesPage />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand brand-large">
          <div className="brand-mark">A</div>
          <div>
            <p>Abisel</p>
            <span>Files, products, and services in one place</span>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" required />
          </label>
          <button className="primary-action" type="submit">
            Log in
          </button>
        </form>
      </section>
    </main>
  );
}

function DrivePage() {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  function createFolder() {
    const folderNumber = items.filter((item) => item.type === "folder").length + 1;
    setItems([{ id: Date.now(), name: `New Folder ${folderNumber}`, type: "folder", meta: "0 files" }, ...items]);
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">My Drive</p>
          <h1>Your files</h1>
        </div>
        <div className="toolbar">
          <button className="secondary-action" type="button" onClick={createFolder}>
            <FolderPlus size={18} />
            New folder
          </button>
          <button className="primary-action" type="button">
            <Upload size={18} />
            Upload
          </button>
        </div>
      </header>

      <div className="drive-controls">
        <label className="search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" />
        </label>
        <div className="segmented">
          <button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="Grid view">
            <Grid3X3 size={18} />
          </button>
          <button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="List view">
            <List size={18} />
          </button>
        </div>
      </div>

      <div className={view === "grid" ? "file-grid" : "file-list"}>
        {filteredItems.map((item) => (
          <article className="file-card" key={item.id}>
            <div className={item.type === "folder" ? "file-icon folder" : "file-icon"}>
              {item.type === "folder" ? <Folder size={24} /> : <File size={24} />}
            </div>
            <div>
              <h2>{item.name}</h2>
              <p>{item.meta}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductsPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Products</p>
          <h1>Buy products</h1>
        </div>
      </header>
      <div className="catalog-grid">
        {products.map((product) => (
          <article className="catalog-card" key={product.name}>
            <div className="catalog-icon">
              <Package size={24} />
            </div>
            <h2>{product.name}</h2>
            <p>{product.detail}</p>
            <div className="catalog-footer">
              <strong>{product.price}</strong>
              <button className="primary-action" type="button">
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h1>Order services</h1>
        </div>
      </header>
      <div className="catalog-grid">
        {services.map((service) => (
          <article className="catalog-card" key={service.name}>
            <div className="catalog-icon">
              <Box size={24} />
            </div>
            <h2>{service.name}</h2>
            <p>{service.detail}</p>
            <button className="primary-action full-width" type="button">
              Request service
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
