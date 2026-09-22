import React from 'react';
import { Head } from '@inertiajs/react';

// Section imports from co-located welcome/ directory
import { WelcomeProps } from './welcome/types';
import Navbar from './welcome/navbar';
import HeroSection from './welcome/hero-section';
import FeatureGrid from './welcome/feature-grid';
import HowItWorks from './welcome/how-it-works';
import SocialProof from './welcome/social-proof';
import PricingSection from './welcome/pricing-section';
import CtaBanner from './welcome/cta-banner';
import FaqSection from './welcome/faq-section';
import Footer from './welcome/footer';

export default function Welcome({ plans = [] }: WelcomeProps) {
    return (
        <>
            <Head title="OmniWarehouse — Sistem Manajemen Gudang Multi-Tenant" />

            <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
                <Navbar />

                <main>
                    <HeroSection />
                    <FeatureGrid />
                    <HowItWorks />
                    <SocialProof />
                    <PricingSection plans={plans} />
                    <CtaBanner />
                    <FaqSection />
                </main>

                <Footer />
            </div>
        </>
    );
}

// Bypass persistent layout
Welcome.layout = (page: React.ReactNode) => page;
