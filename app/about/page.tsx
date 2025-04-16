"use client";
import Image from "next/image";

export default function AboutUs() {
    return (
        <div className="bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 bg-blue-600 opacity-10 rounded-3xl"></div>
                    <div className="relative">
                        <h1 className="text-5xl font-bold text-blue-900 mb-6">About RAISC</h1>
                        <p className="text-xl text-blue-800 max-w-3xl mx-auto">
                            Revolutionizing mental healthcare through innovative technology and compassionate care.
                        </p>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Our Mission</h2>
                        <p className="text-gray-700 mb-4">
                            At RAISC, we are dedicated to making mental healthcare accessible, effective, and personalized for everyone. 
                            Our platform connects patients with qualified mental health professionals, providing a safe and supportive 
                            environment for healing and growth.
                        </p>
                        <p className="text-gray-700">
                            We believe in the power of technology to transform mental healthcare delivery, making it more accessible 
                            and effective while maintaining the human touch that is essential for healing.
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-8 shadow-lg">
                        <h3 className="text-2xl font-semibold text-blue-900 mb-6">Our Values</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start bg-white p-4 rounded-xl">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700 font-medium">Compassionate Care</span>
                            </li>
                            <li className="flex items-start bg-white p-4 rounded-xl">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700 font-medium">Innovation in Healthcare</span>
                            </li>
                            <li className="flex items-start bg-white p-4 rounded-xl">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700 font-medium">Privacy and Security</span>
                            </li>
                            <li className="flex items-start bg-white p-4 rounded-xl">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700 font-medium">Accessibility for All</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-semibold text-blue-900 mb-8 text-center">Why Choose RAISC?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">👨‍⚕️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Professional Network</h3>
                            <p className="text-gray-700">
                                Connect with qualified mental health professionals who are committed to your well-being.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Personalized Care</h3>
                            <p className="text-gray-700">
                                Receive tailored treatment plans and support based on your unique needs and goals.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Secure Platform</h3>
                            <p className="text-gray-700">
                                Your privacy and security are our top priorities, with end-to-end encryption and strict confidentiality.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-semibold text-blue-900 mb-8">Our Team</h2>
                    <p className="text-gray-700 max-w-3xl mx-auto mb-12">
                        Behind RAISC is a dedicated team of healthcare professionals, technologists, and mental health advocates 
                        working together to make a difference in people's lives.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 text-3xl">👨‍⚕️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-2">Healthcare Experts</h3>
                            <p className="text-gray-700">
                                Licensed professionals with years of experience in mental healthcare.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 text-3xl">💻</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-2">Technology Team</h3>
                            <p className="text-gray-700">
                                Skilled developers creating secure and user-friendly solutions.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 text-3xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-2">Support Staff</h3>
                            <p className="text-gray-700">
                                Dedicated professionals ensuring smooth operations and user support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 