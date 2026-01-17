"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import AnimatedButton from "@/components/AnimatedButton";
import GlassCard from "@/components/GlassCard";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <AppShell showNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl font-light text-neutral-900 tracking-tight text-balance"
              >
                Analyze your resume with{" "}
                <span className="font-medium">AI precision</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-neutral-600 font-light max-w-2xl mx-auto"
              >
                Get instant insights on skill gaps, ATS compatibility, and
                actionable improvements to land your dream job.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Link href="/analyze">
                <AnimatedButton size="lg" className="group">
                  Get started
                  <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
              <Link href="/history">
                <AnimatedButton variant="ghost" size="lg">
                  View history
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-light text-neutral-900 mb-4">
                Why choose Resly?
              </h2>
              <p className="text-neutral-600 font-light">
                Built for job seekers who want more than generic advice
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered Analysis",
                  description:
                    "Advanced algorithms analyze your resume against job descriptions for precise matching.",
                },
                {
                  icon: TrendingUp,
                  title: "Actionable Insights",
                  description:
                    "Get specific, prioritized recommendations to improve your resume's effectiveness.",
                },
                {
                  icon: Shield,
                  title: "ATS Optimized",
                  description:
                    "Ensure your resume passes Applicant Tracking Systems with keyword optimization.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard hover>
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-accent-600" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Preview */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-light text-neutral-900 mb-4">
                See it in action
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-12">
                <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                  <p className="text-neutral-400 text-sm font-light">
                    Interactive demo preview
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl font-light text-neutral-900">
              Ready to improve your resume?
            </h2>
            <p className="text-neutral-600 font-light">
              Start analyzing your resume in seconds. No sign-up required.
            </p>
            <Link href="/analyze">
              <AnimatedButton size="lg" className="mt-6">
                Analyze your resume
                <ArrowRight className="w-4 h-4 ml-2 inline-block" />
              </AnimatedButton>
            </Link>
          </motion.div>
        </section>
      </div>
    </AppShell>
  );
}

