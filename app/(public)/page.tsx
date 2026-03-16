/**
 * Landing Page (Public facing)
 * 
 * Target audience: Motorcycle owners, 2-stroke enthusiasts.
 * Vibe: Brutalist layout, editorial typography, stark contrasts (Black/White/Red).
 */

import { HeroSection } from '@/components/public/hero-section';
import { SpecialtiesSection } from '@/components/public/specialties-section';
import { PortfolioGallery } from '@/components/public/portfolio-gallery';
import { StatsSection } from '@/components/public/stats-section';
import { ProcessSection } from '@/components/public/process-section';
import { ContactSection } from '@/components/public/contact-section';
import { ReviewsSection } from '@/components/public/reviews-section';

export default function LandingPage() {
    return (
        <div className="bg-white">
            <HeroSection />
            <StatsSection />
            <SpecialtiesSection />
            <PortfolioGallery />
            <ProcessSection />
            <ReviewsSection />
            <ContactSection />
        </div>
    );
}
