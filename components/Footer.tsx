"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <p className="font-bold text-lg text-gray-900">Ethereal Beauty</p>
              <p className="italic text-sm text-[#b8862d]" style={{fontFamily:"Georgia,serif"}}>Aryan Zealot</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">AI-powered styling meets handcrafted luxury.</p>
          </div>
          {[
            { heading: "Shop", links: [["All Products","/shop"],["New Arrivals","/shop?sort=new"],["Sale","/shop?filter=sale"],["Jewellery","/shop?category=jewellery"]] },
            { heading: "Tools", links: [["Style Me","/style-me"],["Find This","/find-this"],["Size Guide","/help"],["AI Lookbook","/style-me"]] },
            { heading: "Help", links: [["Contact Us","/contact"],["Shipping Info","/help"],["Returns","/settings/returns"],["Settings","/settings"]] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{col.heading}</p>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-[#1a6b8a] transition">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 Ethereal Beauty. All rights reserved.</p>
          <div className="flex gap-6">
            {[["Privacy","/policies"],["Terms","/policies"],["Settings","/settings"]].map(([l,h]) => (
              <Link key={h} href={h} className="text-xs text-gray-400 hover:text-gray-600 transition">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
