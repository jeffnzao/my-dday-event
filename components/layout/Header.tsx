"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/lib/data";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="MY DDAY EVENT — accueil" onClick={() => setMenuOpen(false)}>
          MY DDAY EVENT
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="button button-dark header-quote" href="/devis">
            Préparer mon devis <ArrowRight aria-hidden="true" size={16} />
          </Link>
          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" id="mobile-menu" aria-label="Navigation mobile">
          {navigation.map((item, index) => (
            <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              <span className="mobile-nav-number">0{index + 1}</span>
              {item.label}
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          ))}
          <Link className="mobile-nav-quote" href="/devis" onClick={() => setMenuOpen(false)}>
            Préparer mon devis <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </nav>
      )}
    </header>
  );
}
