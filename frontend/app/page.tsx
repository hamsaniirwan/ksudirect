"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Gagal log masuk. Sila cuba lagi.");
      } else {
        setSuccessMessage("Log masuk berjaya! Mengalihkan halaman...");

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Semak jika ada parameter redirect dari pautan e-mel
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");

        setTimeout(() => {
          if (redirectUrl) {
            router.push(redirectUrl); // Halakan ke halaman cadangan tadi
          } else {
            router.push("/dashboard"); // Halakan ke dashboard utama
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Ralat sistem. Tidak dapat menyambung ke pangkalan pelayan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#F2EEE4] lg:grid lg:grid-cols-2">
      {/* Google Fonts: institutional serif for headings, technical sans for UI */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Fraunces", ui-serif, Georgia, serif;
          font-optical-sizing: auto;
        }
        .font-body {
          font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* ===== Left: institutional panel (hidden on mobile) ===== */}
      <div className="relative hidden h-full overflow-hidden bg-[#0A1F3D] px-14 py-16 lg:flex lg:flex-col lg:justify-between">
        {/* Guilloché-style security pattern, echoing official document watermarks */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 400 800"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="guilloche"
              width="100"
              height="46"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,23 C25,0 25,46 50,23 C75,0 75,46 100,23"
                fill="none"
                stroke="#C6A15B"
                strokeWidth="1"
              />
              <path
                d="M0,10 C25,-13 25,33 50,10 C75,-13 75,33 100,10"
                fill="none"
                stroke="#C6A15B"
                strokeWidth="0.6"
              />
              <path
                d="M0,36 C25,13 25,59 50,36 C75,13 75,59 100,36"
                fill="none"
                stroke="#C6A15B"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="400" height="800" fill="url(#guilloche)" />
        </svg>

        {/* Faint radial glow behind crest */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#C6A15B] opacity-[0.07] blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <Image
              src="/logo/jata_negara.png"
              alt="Logo Jata Negara"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="h-8 w-px bg-[#C6A15B]/30" />
          <span className="font-body text-xs font-medium uppercase tracking-[0.25em] text-[#C6A15B]">
            KSU Direct
          </span>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-[#C6A15B]">
            Kementerian Pengangkutan Malaysia
          </p>
          <h2 className="font-display mt-5 text-[2.4rem] font-medium leading-[1.15] text-[#F7F5EF]">
            Platform Rasmi Cadangan Penambahbaikan
          </h2>
          <p className="mt-5 font-body text-[15px] leading-relaxed text-[#B9C4D6]">
            Ruang untuk kakitangan kementerian menyalurkan cadangan,
            memantau status semasa, dan menyumbang ke arah penambahbaikan
            perkhidmatan Kementerian Pengangkutan Malaysia.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 border-t border-white/10 pt-6 font-body text-xs text-[#8CA0BE]">
          <svg
            className="h-3.5 w-3.5 flex-shrink-0 text-[#C6A15B]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            Akses terhad kepada e-mel rasmi{" "}
            <span className="text-[#C6A15B]">@mot.gov.my</span>
          </span>
        </div>
      </div>

      {/* ===== Right: form panel ===== */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-10 sm:py-20">
        <div className="flex min-h-full items-center justify-center">
          <div className="w-full max-w-md font-body">
            {/* Mobile-only header (crest + title), mirrors the left panel on small screens */}
            <div className="mb-10 flex flex-col items-center text-center lg:hidden">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A1F3D]/5 ring-1 ring-[#0A1F3D]/10">
                <Image
                  src="/logo/jata_negara.png"
                  alt="Logo Jata Negara"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[#0A1F3D]">
                KSU Direct
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                Platform Rasmi Cadangan Penambahbaikan Kementerian Pengangkutan
                Malaysia
              </p>
            </div>

            {/* Desktop heading */}
            <div className="mb-9 hidden lg:block">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#B08B3E]">
                Log Masuk
              </p>
              <h1 className="font-display mt-3 text-3xl font-medium text-[#0A1F3D]">
                Selamat kembali
              </h1>
              <p className="mt-2 text-sm text-[#64748B]">
                Masukkan kelayakan rasmi anda untuk meneruskan.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#A6F4C5] bg-[#ECFDF3] px-4 py-3 text-sm text-[#087443]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75l1.5 1.5 4-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  E-mel Rasmi (@mot.gov.my)
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cth: pegawai@mot.gov.my"
                    required
                    className="w-full rounded-lg border border-[#DDD7C7] bg-white py-3 pl-10 pr-4 text-[#1F2937] placeholder-[#9CA3AF] transition-colors focus:border-[#0A1F3D] focus:outline-none focus:ring-1 focus:ring-[#0A1F3D]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  Kata Laluan
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-[#DDD7C7] bg-white py-3 pl-10 pr-4 text-[#1F2937] placeholder-[#9CA3AF] transition-colors focus:border-[#0A1F3D] focus:outline-none focus:ring-1 focus:ring-[#0A1F3D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A1F3D] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0F2A4D] focus:outline-none focus:ring-2 focus:ring-[#0A1F3D] focus:ring-offset-2 disabled:opacity-70"
              >
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin text-[#C6A15B]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {loading ? "Sedang Log Masuk..." : "Log Masuk"}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-2 border-t border-[#E5E0D3] pt-6 text-center text-xs leading-relaxed text-[#94A3B8]">
              <svg
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B08B3E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p>
                Hanya kakitangan kementerian dengan e-mel rasmi @mot.gov.my
                dibenarkan mengakses sistem ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}