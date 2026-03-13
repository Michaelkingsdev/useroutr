"use client";

import { Home, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from './ui/button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useGSAP(() => {
    if (!navRef.current || !bgRef.current) return

    // Background starts transparent, fades in on scroll
    gsap.set(bgRef.current, { opacity: 0 })
    ScrollTrigger.create({
      start: 'top top',
      end: '+=80',
      onUpdate: (self) => {
        gsap.to(bgRef.current, {
          opacity: self.progress,
          duration: 0.1,
          overwrite: 'auto',
        })
      },
    })

    // Hide on scroll down, reveal on scroll up
    let lastY = 0
    ScrollTrigger.create({
      start: 'top top',
      onUpdate: (self) => {
        const currentY = self.scroll()
        if (currentY > lastY && currentY > 80 && !isMobileMenuOpen) {
          gsap.to(navRef.current, { y: '-100%', duration: 0.3, ease: 'power2.in', overwrite: 'auto' })
        } else {
          gsap.to(navRef.current, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
        }
        lastY = currentY
      },
    })
  }, [isMobileMenuOpen])

  useGSAP(() => {
    if (!mobileMenuRef.current) return

    if (isMobileMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        x: 0,
        duration: 0.6,
        ease: "expo.out",
      })
      gsap.fromTo(".mobile-nav-item", 
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      )
    } else {
      gsap.to(mobileMenuRef.current, {
        x: "100%",
        duration: 0.5,
        ease: "expo.in",
      })
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <section ref={navRef} className='fixed top-0 left-0 right-0 w-full z-[10000] font-display'>
        {/* glass-effect */}
        <div className="filter-[url(#glass-distortion)] backdrop-blur-[3px] rounded-[inherit] absolute inset-0 overflow-hidden" />
        {/* glass-tint — transparent at top, fades in on scroll */}
        <div ref={bgRef} className="rounded-[inherit] bg-[#0009] absolute inset-0 overflow-hidden" />
        
        <section className="relative z-10">
          <div id='navbar-container' className="flex items-center justify-between w-full max-w-7xl h-20 mx-auto px-6 md:px-10">
            {/* Logo */}
            <Link href="/" className="relative z-20">
              <Image src="/logo.svg" alt='Useroutr' width={110} height={32} className="w-auto h-7 md:h-8" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-1">
                <Link href="/" className="p-4 text-zinc-400 hover:text-white transition-colors">
                  <Home size={20} />
                </Link>
                {/* We can add more desktop links here if needed */}
              </nav>
              
              <div className="h-4 w-px bg-white/10 mx-2" />
              
              <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-widest border-white/5 bg-white/2 hover:bg-white/5">
                Access
              </Button>
            </div>

            {/* Mobile Toggle & CTA */}
            <div className="flex md:hidden items-center gap-4 relative z-20">
              <Button variant="outline" size="sm" className="font-mono text-[9px] uppercase tracking-widest border-white/10 px-3 h-8">
                Access
              </Button>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Menu Overlay */}
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-10 bg-black/95 backdrop-blur-md translate-x-full md:hidden flex flex-col pt-32 px-10"
        >
          {/* Internal Close Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
            <X size={24} />
          </button>

          <nav className="flex flex-col gap-6">
            {[
              { label: 'Platform', href: 'https://thirtn.mintlify.app/products' },
              { label: 'Infrastructure', href: 'https://thirtn.mintlify.app/#platform-architecture' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Documentation', href: 'https://thirtn.mintlify.app/' },
              { label: 'Company', href: 'https://x.com/tavio' },
            ].map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-item font-display text-4xl font-bold text-white/50 hover:text-white transition-all tracking-tighter"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pb-12 mobile-nav-item">
            <div className="h-px w-full bg-white/5 mb-8" />
            <div className="flex flex-col gap-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 mb-2 underline active:text-white">Legal</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 underline active:text-white">Privacy Policy</div>
            </div>
          </div>
        </div>
    </section>
  )
}

export default Navbar