"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { login, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Login yoki parol noto'g'ri");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Sparkles size={16} />
          </div>
          <span className="text-lg font-semibold">Coursue</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-semibold">Tizimga kirish</h1>
          <p className="mt-1 text-sm text-muted-foreground">Email yoki telefon raqamingiz bilan kiring</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email yoki telefon</label>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input mt-1"
                placeholder="email@example.com yoki +998..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1"
                required
              />
            </div>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hisobingiz yo'qmi?{" "}
            <Link href="/register" className="text-brand-600">Ro'yxatdan o'tish</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
