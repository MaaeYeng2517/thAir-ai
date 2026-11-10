"use client";

import { useMemo, useState } from "react";
import type { Item, Kind } from "@/types";
import { CATEGORIES, CATEGORY_LABEL, KIND_META } from "@/lib/data";

const pricingLabel: Record<string,string> = { free:"Free", freemium:"Freemium", paid:"Paid" };
const pricingClass: Record<string,string> = {
  free:"bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  freemium:"bg-sky-500/15 text-sky-300 border-sky-400/20",
  paid:"bg-amber-500/15 text-amber-300 border-amber-400/20",
};

function matches(item: Item, q: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return [item.name,item.company,item.desc,item.kind,item.category,...item.tags].some(v => String(v ?? "").toLowerCase().includes(s));
}

export default function DirectoryClient({ items }: { items: Item[] }) {
  const [kind, setKind] = useState<Kind | "all">("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [pricing, setPricing] = useState("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, agent:0, model:0, tool:0, ide:0 };
    for (const it of items) c[it.kind] = (c[it.kind]||0)+1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter(it => (kind === "all" || it.kind === kind));
    if (category !== "all") list = list.filter(it => it.category === category || it.kind === category);
    if (pricing !== "all") list = list.filter(it => it.pricing === pricing);
    list = list.filter(it => matches(it, query));
    list = [...list].sort((a,b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rating") return b.rating - a.rating || b.votes - a.votes;
      if (sort === "newest") return (b.date||"").localeCompare(a.date||"");
      return b.votes - a.votes || b.rating - a.rating;
    });
    return list;
  }, [items, kind, category, pricing, query, sort]);

  const trending = useMemo(() => items.filter(i => i.trending || i.isHot).sort((a,b)=>b.votes-a.votes).slice(0,6), [items]);

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07071a]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/20 text-lg">⬡</span>
            <span>AI<span className="gradient-text">verse</span> Directory</span>
          </a>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
            <a href="#browse" className="hover:text-white">Browse</a>
            <a href="#trending" className="hover:text-white">Trending</a>
            <a href="#deploy" className="hover:text-white">Deploy</a>
          </nav>
          <a href="#deploy" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">Deploy on Vercel</a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:url('/hero_bg.png')] [background-size:cover] [background-position:center]" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">Next.js · Vercel-ready · อัปเดตข้อมูลตัวอย่าง</div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            รวม <span className="gradient-text">AI Agent · AI Model · AI Tool · AI IDE</span> ไว้ที่เดียว
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">ค้นหา กรอง และเปิดใช้งานเครื่องมือ AI ตามงานของคุณ — หน้าเว็บสร้างด้วย Next.js (App Router) พร้อมดีพลอยบน Vercel</p>
          <div className="mt-8 grid gap-3 rounded-2xl glass p-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
              <span className="text-slate-400">⌕</span>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหา เช่น agent, RAG, coding, image, Cursor..." className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500" />
            </label>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-200 outline-none">
              <option value="popular">ยอดนิยม</option><option value="rating">คะแนนสูง</option><option value="newest">ล่าสุด</option><option value="name">ชื่อ A-Z</option>
            </select>
            <select value={pricing} onChange={e=>setPricing(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-200 outline-none">
              <option value="all">ทุกราคา</option><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option>
            </select>
            <a href="#browse" className="grid place-items-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white hover:bg-violet-400">ดูรายการ</a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["agent","model","tool","ide"] as Kind[]).map(k => (
              <button key={k} onClick={()=>{setKind(k); setCategory("all"); document.getElementById("browse")?.scrollIntoView({behavior:"smooth"});}} className={`glass rounded-2xl p-4 text-left transition hover:border-violet-400/40 ${kind===k?"border-violet-400/50 bg-violet-500/10":""}`}>
                <div className="text-2xl">{KIND_META[k].emoji}</div>
                <div className="mt-1 font-medium">{KIND_META[k].label}</div>
                <div className="text-sm text-slate-400">{counts[k]} รายการ</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="trending" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-end justify-between"><h2 className="text-2xl font-semibold">กำลังนิยม</h2><span className="text-sm text-slate-400">คัดจาก trending/hot</span></div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trending.map(it => (
            <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="glass group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-violet-400/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-xl">{it.icon}</span><div><div className="font-medium group-hover:text-violet-200">{it.name}</div><div className="text-xs text-slate-400">{it.company} · {KIND_META[it.kind].label}</div></div></div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${pricingClass[it.pricing]}`}>{pricingLabel[it.pricing]}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-300">{it.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="browse" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Browse</h2>
          <div className="text-sm text-slate-400">พบ <strong className="text-slate-200">{filtered.length}</strong> รายการ</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={()=>{setKind("all"); setCategory("all");}} className={`rounded-full border px-3 py-1.5 text-sm ${kind==="all"&&category==="all"?"border-violet-400/50 bg-violet-500/15 text-violet-100":"border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>ทั้งหมด ({counts.all})</button>
          {(["agent","model","tool","ide"] as Kind[]).map(k => (
            <button key={k} onClick={()=>{setKind(k); setCategory("all");}} className={`rounded-full border px-3 py-1.5 text-sm ${kind===k?"border-violet-400/50 bg-violet-500/15 text-violet-100":"border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{KIND_META[k].emoji} {KIND_META[k].label} ({counts[k]})</button>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.filter(c=>!["agent","model","ide"].includes(c)).map(c => (
            <button key={c} onClick={()=>setCategory(c)} className={`rounded-full border px-3 py-1 text-xs ${category===c?"border-cyan-400/50 bg-cyan-500/15 text-cyan-100":"border-white/10 text-slate-400 hover:bg-white/5"}`}>{CATEGORY_LABEL[c]||c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-slate-400">ไม่พบผลลัพธ์ — ลองเปลี่ยนคำค้นหรือฟิลเตอร์</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(it => (
              <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="glass group flex flex-col rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-violet-400/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">{it.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate font-medium group-hover:text-violet-200">{it.name}</div>
                      <div className="truncate text-xs text-slate-400">{it.company} · {KIND_META[it.kind].label}</div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${pricingClass[it.pricing]}`}>{pricingLabel[it.pricing]}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-300">{it.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {it.tags.slice(0,4).map(t => <span key={t} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">{t}</span>)}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>★ {it.rating.toFixed(1)} · {it.votes.toLocaleString()} votes</span>
                  <span className="text-violet-300 opacity-0 transition group-hover:opacity-100">เปิดเว็บไซต์ ↗</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section id="deploy" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Deploy บน Vercel</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">โปรเจกต์นี้เป็น Next.js (App Router) ใน <code className="rounded bg-white/10 px-1">apps/directory</code>. ตั้งค่า Root Directory เป็น <code className="rounded bg-white/10 px-1">apps/directory</code> (หรือ deploy จากโฟลเดอร์นี้), Framework = Next.js, Build = <code className="rounded bg-white/10 px-1">npm run build</code>. ไม่ต้องใช้ secret keys สำหรับหน้า directory แบบ static data นี้.</p>
          <div className="mt-4 whitespace-pre rounded-xl border border-white/10 bg-black/25 p-4 font-mono text-xs text-slate-300">
            cd apps/directory{"\n"}npm install{"\n"}npm run build{"\n"}# แล้ว import repo เข้า Vercel และตั้ง Root Directory = apps/directory
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <div>AIverse Directory · Next.js · ข้อมูลบางส่วนเป็นตัวอย่างคัดเลือก ควรตรวจสอบราคาล่าสุดที่เว็บไซต์ทางการ</div>
      </footer>
    </main>
  );
}
