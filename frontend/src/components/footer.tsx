import Link from "next/link"
import { Github, Instagram, Linkedin, Twitter } from "lucide-react"

const footerLinks = {
  forBusinesses: {
    title: "For Businesses",
    links: [
      { label: "Post a Gig", href: "/post-a-gig" },
      { label: "Browse Talent", href: "/browse-talent" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  forFreelancers: {
    title: "For Freelancers",
    links: [
      { label: "Find Gigs", href: "/find-gigs" },
      { label: "Create Profile", href: "/create-profile" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Resources", href: "/resources" },
    ],
  },
  platform: {
    title: "Platform",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Partner Program", href: "/partners" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Dispute Resolution", href: "/disputes" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
}

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
]

export function Footer() {
  return (
    <footer className="bg-[var(--dark-surface)] text-white/75">
      <div className="container-page py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="group mb-4 flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] shadow-[0_0_20px_rgba(109,156,159,0.25)] transition-transform group-hover:scale-105 group-hover:rotate-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">Contractual</span>
            </Link>
            <p className="mb-6 max-w-[200px] text-sm text-white/60">Structured work. Trusted outcomes.</p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all duration-200 hover:border-white/40 hover:bg-white/5 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors duration-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-white/40">&copy; 2026 Contractual. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <Link href="/privacy" className="transition-colors hover:text-white/60">
                Privacy Policy
              </Link>
              <span>&middot;</span>
              <Link href="/terms" className="transition-colors hover:text-white/60">
                Terms of Service
              </Link>
              <span>&middot;</span>
              <Link href="/cookie-settings" className="transition-colors hover:text-white/60">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
