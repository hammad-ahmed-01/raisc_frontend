import Navbar from '../LandingPage/constants/navbar';
import Footer from '@/components/LatestFooter';
import AboutUsSection from './components/AboutUsSection';
import OurMissionSection from './components/OurMissionSection';
import OurTeamSection from './components/OurTeamSection';

export default function Home() {
  return (
    <main id = "about" className="bg-white">
      <Navbar />
      <AboutUsSection />
      <OurMissionSection />
      <OurTeamSection />
      <Footer />
    </main>
  );
}
