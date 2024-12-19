import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="main-container">
      <div className="main-content">
        <Image
          src="/raisc-logo.jpg" // Place the logo as 'raisc-logo.jpg' in public/
          alt="RAISC Logo"
          width={200}
          height={200}
        />
        <h1 className="main-title">Welcome to RAISC</h1>
        <p className="main-description">
          Revolutionizing Mental Health through AI.
          Discover your personalized mental health assistant today.
        </p>
        <Link href="/login" className="main-button">
          Get Started
        </Link>
      </div>
    </div>
  );
}
