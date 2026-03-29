"use client"

import { motion } from "framer-motion"
import { Users, Shield, MessageSquare, Zap, Target, Star, Globe, Trophy } from "lucide-react"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"

const communityFeatures = [
  {
    icon: Shield,
    title: "Verified Networks",
    description: "Every member is vetted to ensure professional standards and high-quality collaboration.",
    color: "var(--primary)"
  },
  {
    icon: MessageSquare,
    title: "Expert Mentorship",
    description: "Connect with industry veterans for 1:1 guidance, code reviews, and career coaching.",
    color: "var(--cta-amber)"
  },
  {
    icon: Target,
    title: "Project Labs",
    description: "Team up with other freelancers to tackle complex enterprise projects in collaborative environments.",
    color: "#2ecc71"
  },
  {
    icon: Trophy,
    title: "Recognition System",
    description: "Earn community-validated badges and climb the expert directory based on performance.",
    color: "#9b59b6"
  }
]

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-[120px] pb-20 lg:pt-[160px] lg:pb-32 overflow-hidden bg-[var(--dark-surface)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,var(--primary),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,var(--cta-amber),transparent_50%)]" />
        </div>
        
        <div className="container-page relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
              A Global Hub for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--cta-amber)]">
                Modern Professionals
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/70 mb-10 leading-relaxed font-medium">
              Contractual is more than a marketplace — it's a living ecosystem of top-tier talent, 
              innovative businesses, and shared expertise. Join the network where trust is built into every interaction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-amber-cta !py-4 !px-8 text-base">
                Join the Community
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all duration-300">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border-r border-[var(--border)] last:border-0">
              <p className="text-3xl font-stat font-bold text-[var(--text-primary)] mb-2">50K+</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider">Members</p>
            </div>
            <div className="text-center p-6 border-r border-[var(--border)] last:border-0 lg:border-r">
              <p className="text-3xl font-stat font-bold text-[var(--text-primary)] mb-2">120+</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider">Countries</p>
            </div>
            <div className="text-center p-6 border-r border-[var(--border)] last:border-0 md:border-r-0 lg:border-r">
              <p className="text-3xl font-stat font-bold text-[var(--text-primary)] mb-2">4.9/5</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider">Rating</p>
            </div>
            <div className="text-center p-6">
              <p className="text-3xl font-stat font-bold text-[var(--text-primary)] mb-2">$20M+</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider">Earnings Shared</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container-page">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">
              Build Connections, Not Just Contracts
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              We provide the tools and infrastructure to help you grow your network and your business simultaneously.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {communityFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group p-8 rounded-[32px] border border-[var(--border)] bg-white hover:border-[var(--primary)] transition-all duration-300 shadow-sm"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Vision Section */}
      <section className="py-24 bg-[var(--bg-alt)] border-y border-[var(--border)]">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative aspect-square max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)] to-[var(--cta-amber)] rounded-[40px] rotate-3 opacity-10" />
              <Image 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=900&fit=crop&q=80" 
                alt="Community Collaboration"
                fill
                className="object-cover rounded-[40px] shadow-2xl transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] mb-6">
                Our Vision for a Transparent Workplace
              </h2>
              <div className="space-y-6">
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                  In a world of fragmented gig platforms, Contractual was born from a simple idea: 
                  that high-stakes work requires high-trust environments. Our community isn't just a list of names; 
                  it's a commitment to quality.
                </p>
                <ul className="space-y-4">
                  {[
                    "Zero-tolerance for unprofessional behavior",
                    "Transparency in pricing and deliverables",
                    "Collaborative dispute resolution",
                    "Continuous learning and mentorship"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                      <Zap className="w-5 h-5 text-[var(--primary)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container-page">
          <div className="relative rounded-[48px] overflow-hidden bg-[var(--gradient-primary)] px-8 py-20 text-center text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl -ml-32 -mb-32 rounded-full" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                Ready to find your professional home?
              </h2>
              <p className="text-xl text-white/80 mb-10 leading-relaxed font-medium">
                Start building your legacy on Contractual today. Whether you're looking for world-class 
                talent or high-trust projects, we have a place for you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-5">
                <Link href="/auth/register" className="px-10 py-4 bg-white text-[var(--primary-dark)] rounded-2xl font-bold text-lg hover:bg-white/90 transition-all duration-300 shadow-xl">
                  Become a Member
                </Link>
                <Link href="/contact" className="px-10 py-4 border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
