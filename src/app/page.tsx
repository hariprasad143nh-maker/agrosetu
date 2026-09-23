"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Route, Recycle, Leaf, Sun, Droplets, Factory, Tractor } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Hero Section with Image Background */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-32 sm:py-48 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-green-300 border border-white/20 text-sm font-medium mb-6 backdrop-blur-md">
              <Leaf className="h-4 w-4" /> Connecting Farms to Industries
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Making Every <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Harvest Count.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-light"
          >
            A dual-sided intelligence platform. We help <strong>farmers</strong> prevent post-harvest losses, and we help <strong>industries</strong> source high-quality biomass and agricultural residues efficiently.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button asChild size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition-all hover:scale-105">
              <Link href="/dashboard">
                Farmer Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all">
              <Link href="/industry/demand">
                Industry Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Section - Glass Cards */}
      <section className="py-24 px-4 sm:px-8 relative z-20 -mt-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sun className="h-32 w-32" />
            </div>
            <div className="h-14 w-14 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Prevent Loss</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              AI-driven freshness tracking helps farmers decide when to sell or move produce to decentralized solar cooling hubs before it spoils.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Route className="h-32 w-32" />
            </div>
            <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Route className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Smart Logistics</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              We group nearby farms together to create efficient collection clusters, drastically reducing transport costs for industrial buyers.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Droplets className="h-32 w-32" />
            </div>
            <div className="h-14 w-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <Recycle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Recover Value</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Turn waste into wealth. We match unavoidable agricultural residue directly with industries needing biomass, biogas, or compost.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Dual Sided Marketplace Section */}
      <section className="py-24 px-4 sm:px-8 bg-slate-100 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">A Unified Circular Ecosystem</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">AgroSetu bridges the gap between agricultural producers and industrial consumers, creating a seamless marketplace for fresh produce and biomass.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-zinc-950 p-10 rounded-[2.5rem] shadow-lg border border-slate-200 dark:border-zinc-800"
            >
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center mb-8">
                <Tractor className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Farmers</h3>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400 mb-8">
                <li className="flex items-start gap-3"><span className="text-green-500 font-bold">✓</span> AI freshness tracking to prevent spoilage</li>
                <li className="flex items-start gap-3"><span className="text-green-500 font-bold">✓</span> Direct access to nearby solar cooling hubs</li>
                <li className="flex items-start gap-3"><span className="text-green-500 font-bold">✓</span> Monetize agricultural waste (stubble, husks) instead of burning it</li>
              </ul>
              <Button variant="outline" className="rounded-full w-full h-12" asChild>
                <Link href="/dashboard">Access Farmer Tools</Link>
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-slate-900 dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-lg border border-slate-800 text-white"
            >
              <div className="h-16 w-16 bg-blue-900/50 text-blue-400 rounded-2xl flex items-center justify-center mb-8">
                <Factory className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Industries</h3>
              <ul className="space-y-4 text-slate-300 mb-8">
                <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> Post demand for specific biomass & raw materials</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> Smart matching algorithm ensures quality and moisture requirements</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 font-bold">✓</span> Cluster-based logistics reduce transport overhead</li>
              </ul>
              <Button className="rounded-full w-full h-12 bg-blue-600 hover:bg-blue-500 text-white" asChild>
                <Link href="/industry/demand">Access Industry Portal</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
