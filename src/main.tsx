import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import {
  Box,
  BriefcaseBusiness,
  ChevronLeft,
  Download,
  File as FileIcon,
  Folder,
  FolderPlus,
  Grid3X3,
  HardDrive,
  List,
  Loader2,
  LogOut,
  Package,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
} from "lucide-react";
import "./styles.css";

type Page = "drive" | "products" | "services";
type ViewMode = "grid" | "list";
type AuthMode = "login" | "signup";
type DriveItem = {
  id: string;
  name: string;
  storageName: string;
  type: "folder" | "file";
  meta: string;
  path: string;
};

const BUCKET_NAME = "user-files";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [page, setPage] = useState<Page>("drive");

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsCheckingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return <SetupScreen />;
  }

  if (isCheckingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginScreen supabase={supabase} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <p>Abisel</p>
            <span>{session.user.email}</span>
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

        <button className="logout" onClick={() => void supabase.auth.signOut()}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="content">
        {page === "drive" && <DrivePage supabase={supabase} user={session.user} />}
        {page === "products" && <ProductsPage />}
        {page === "services" && <ServicesPage />}
      </main>
    </div>
  );
}

function SetupScreen() {
  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand brand-large">
          <div className="brand-mark">A</div>
          <div>
            <p>Abisel</p>
            <span>Backend setup needed</span>
          </div>
        </div>
        <div className="notice">
          Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your environment, then run the SQL in
          `supabase-storage-setup.sql`.
        </div>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="login-screen">
      <section className="login-panel compact-panel">
        <Loader2 className="spin" size={28} />
        <p>Loading Abisel...</p>
      </section>
    </main>
  );
}

function LoginScreen({ supabase }: { supabase: SupabaseClient }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your login.");
    }

    setIsSubmitting(false);
  }

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
        <div className="auth-tabs">
          <button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")} type="button">
            Log in
          </button>
          <button className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")} type="button">
            Sign up
          </button>
        </div>
        <form onSubmit={submitAuth}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          {message && <div className="notice">{message}</div>}
          <button className="primary-action" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="spin" size={18} /> : null}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function DrivePage({ supabase, user }: { supabase: SupabaseClient; user: User }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  const storagePrefix = `${user.id}/${currentPath}`;

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  useEffect(() => {
    void loadItems();
  }, [currentPath]);

  async function loadItems() {
    setIsLoading(true);

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(storagePrefix, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      setMessage(error.message);
      setItems([]);
    } else {
      setItems(
        data
          .filter((entry) => entry.name !== ".keep")
          .map((entry) => ({
            id: `${storagePrefix}/${entry.name}`,
            name: getDisplayName(entry.name, entry.metadata),
            storageName: entry.name,
            type: entry.id ? "file" : "folder",
            meta: entry.id ? formatBytes(entry.metadata?.size ?? 0) : "Folder",
            path: `${currentPath}${entry.name}`,
          })),
      );
    }

    setIsLoading(false);
  }

  async function createFolder() {
    const folderName = window.prompt("Folder name");
    const cleanedName = folderName?.trim().replace(/\//g, "-");

    if (!cleanedName) return;

    setIsWorking(true);
    setMessage("");

    const keepFile = new File([""], ".keep", { type: "text/plain" });
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${storagePrefix}${cleanedName}/.keep`, keepFile, { upsert: true });

    if (error) {
      setMessage(error.message);
    } else {
      await loadItems();
      setMessage(`Created folder "${cleanedName}".`);
    }

    setIsWorking(false);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    setIsWorking(true);
    setMessage("");
    let uploadedCount = 0;
    let failedUpload = false;

    for (const file of Array.from(files)) {
      const storageName = createStorageFileName(file.name);
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(`${storagePrefix}${storageName}`, file, {
        contentType: file.type || undefined,
        metadata: { originalName: file.name },
        upsert: true,
      });

      if (error) {
        failedUpload = true;
        setMessage(`Upload failed for "${file.name}": ${error.message}`);
        setIsWorking(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        break;
      }

      uploadedCount += 1;
    }

    await loadItems();
    if (!failedUpload && uploadedCount > 0) {
      setMessage(uploadedCount === 1 ? "Uploaded 1 file." : `Uploaded ${uploadedCount} files.`);
    }

    setIsWorking(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function downloadItem(item: DriveItem) {
    if (item.type === "folder") {
      setCurrentPath(`${item.path}/`);
      return;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`${storagePrefix}${item.storageName}`, 60, {
        download: item.name,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteItem(item: DriveItem) {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setIsWorking(true);
    setMessage("");

    const removePath =
      item.type === "folder" ? `${storagePrefix}${item.storageName}/.keep` : `${storagePrefix}${item.storageName}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([removePath]);

    if (error) {
      setMessage(error.message);
    } else {
      await loadItems();
    }

    setIsWorking(false);
  }

  function goBack() {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length ? `${parts.join("/")}/` : "");
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">My Drive</p>
          <h1>{currentPath || "Your files"}</h1>
        </div>
        <div className="toolbar">
          {currentPath && (
            <button className="secondary-action" type="button" onClick={goBack}>
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          <button className="secondary-action" disabled={isWorking} type="button" onClick={createFolder}>
            <FolderPlus size={18} />
            New folder
          </button>
          <button className="primary-action" disabled={isWorking} type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            Upload
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            multiple
            onChange={(event) => void uploadFiles(event.target.files)}
            type="file"
          />
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

      {message && <div className="notice page-notice">{message}</div>}

      {isLoading ? (
        <div className="empty-state">
          <Loader2 className="spin" size={30} />
          Loading files...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">No files here yet.</div>
      ) : (
        <div className={view === "grid" ? "file-grid" : "file-list"}>
          {filteredItems.map((item) => (
            <article className="file-card" key={item.id} onDoubleClick={() => void downloadItem(item)}>
              <div className={item.type === "folder" ? "file-icon folder" : "file-icon"}>
                {item.type === "folder" ? <Folder size={24} /> : <FileIcon size={24} />}
              </div>
              <div className="file-info">
                <h2>{item.name}</h2>
                <p>{item.meta}</p>
              </div>
              <div className="file-actions">
                <button onClick={() => void downloadItem(item)} aria-label={item.type === "folder" ? "Open folder" : "Download file"}>
                  {item.type === "folder" ? <Folder size={17} /> : <Download size={17} />}
                </button>
                <button onClick={() => void deleteItem(item)} aria-label="Delete">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
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

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function createStorageFileName(fileName: string) {
  const extensionMatch = fileName.match(/(\.[a-zA-Z0-9]{1,12})$/);
  const extension = extensionMatch?.[1] ?? "";
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  const safeBaseName = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const finalBaseName = safeBaseName || "file";

  return `${Date.now()}-${finalBaseName}${extension.toLowerCase()}`;
}

function getDisplayName(storageName: string, metadata: unknown) {
  if (
    metadata &&
    typeof metadata === "object" &&
    "originalName" in metadata &&
    typeof metadata.originalName === "string"
  ) {
    return metadata.originalName;
  }

  return storageName.replace(/^\d+-/, "");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
