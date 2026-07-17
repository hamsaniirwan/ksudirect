import Image from "next/image";

export default async function Home() {
  // 1. Buat panggilan ke Laravel API
  let apiMessage = "Sedang menyambung ke API...";
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hello`, {
      cache: "no-store", // Next.js tak akan simpan cache lama masa kita tengah test
    });
    
    if (res.ok) {
      const data = await res.json();
      apiMessage = data.message;
    } else {
      apiMessage = `Ralat: API memulangkan kod ${res.status}`;
    }
  } catch (error) {
    console.error(error);
    apiMessage = "Gagal menyambung. Pastikan server Laravel sedang berjalan (php artisan serve).";
  }

  // 2. Paparkan di UI menggunakan JSX
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-zinc-950">
      <Image
        className="dark:invert mb-12"
        src="/next.svg"
        alt="Next.js logo"
        width={150}
        height={30}
        priority
      />
      
      {/* INI KOTAK UNTUK PAPARAN DATA API */}
      <div className="w-full max-w-md p-6 bg-blue-50 border border-blue-200 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 text-center shadow-sm">
        <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest">
          Status Sambungan API
        </h2>
        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
          {apiMessage}
        </p>
      </div>

      <div className="mt-12 text-center">
        <h1 className="text-xl font-semibold text-black dark:text-white mb-4">
          Langkah Seterusnya
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
          Edit fail <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">page.tsx</code> ini untuk mula membina antaramuka sistem ksudirect.
        </p>
      </div>
    </main>
  );
}