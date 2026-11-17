import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions de location", href: "/conditions-location" },
  { label: "Données personnelles", href: "/gestion-donnees-personnelles" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link className="footer-wordmark" href="/">DDAY EVENT</Link>
          <p>Les détails qui rendent votre journée inoubliable.</p>
        </div>
        <div className="footer-links">
          <div className="footer-link-column">
            <span className="footer-label">Découvrir</span>
            <Link href="/collection">La collection</Link>
            <Link href="/mariages">Nos mariages</Link>
            <Link href="/comment-louer">Comment louer</Link>
          </div>
          <div className="footer-link-column">
            <span className="footer-label">Informations</span>
            {legalLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </div>
        </div>
        <Link className="footer-contact" href="/devis">
          Imaginer votre décor <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} DDAY EVENT</span>
        <span>Location de décoration de mariage & d’événements</span>
        <Link href="/espace-proprietaire">Espace propriétaire</Link>
      </div>
    </footer>
  );
}
