import HeroSection from './LandingPage/hero';
import AboutSection from './LandingPage/About/page';
import ServicesSection from './LandingPage/Services/page';
import TestimonialSection from './LandingPage/Testimonials';
import ContactSection from './LandingPage/Contact';
import Footer from '@/components/LatestFooter';
import Navbar from './LandingPage/constants/navbar';
import JoinWaitlistSection from './LandingPage/WaitList';
import PricingSection from './LandingPage/Pricing';
import MeetYourCompanion from './LandingPage/MeetYourCompanion';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <MeetYourCompanion />
      <AboutSection />
      <ServicesSection />
      <TestimonialSection />
      <JoinWaitlistSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
