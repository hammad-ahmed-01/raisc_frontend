import HeroSection from './LandingPage/hero';
import AboutSection from './LandingPage/About/page';
import ServicesSection from './LandingPage/Services/page';
import TestimonialSection from './LandingPage/Testimonials';
import ContactSection from './LandingPage/Contact';
import Footer from './LandingPage/constants/footer';
import Navbar from './LandingPage/constants/navbar';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialSection />
      <ContactSection />
      <Footer />
    </main>
  );
}



