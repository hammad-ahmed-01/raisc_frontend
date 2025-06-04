import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white px-4 py-8 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <div>
          <h3 className="font-bold mb-2">RAISC</h3>
          <p>Empowering mental wellness through accessible care.</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Services</h3>
          <ul>
            <li>Therapy</li>
            <li>Evaluation</li>
            <li>Scheduling</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Contact</h3>
          <ul>
            <li>raisccare@gmail.com</li>
            <li>+92 333 1234567</li>
            <li>H-12, Islamabad</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-6">© 2025 RAISC. All rights reserved.</div>
    </footer>
  );
}
