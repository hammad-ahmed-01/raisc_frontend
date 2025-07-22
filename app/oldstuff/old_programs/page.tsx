"use client";
import Image from "next/image";

export default function Programs() {
    return (
        <div className="bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 bg-blue-600 opacity-10 rounded-3xl"></div>
                    <div className="relative">
                        <h1 className="text-5xl font-bold text-blue-900 mb-6 mt-8">Our Programs</h1>
                        <p className="text-xl text-blue-800 max-w-3xl mx-auto">
                            Comprehensive mental health programs designed to support your journey to wellness.
                        </p>
                    </div>
                </div>

                {/* Main Programs Section */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-blue-600 text-3xl">🧠</span>
                        </div>
                        <h2 className="text-3xl font-semibold text-blue-900 mb-4">Individual Therapy</h2>
                        <p className="text-gray-700 mb-6">
                            One-on-one sessions with licensed mental health professionals, tailored to your specific needs and goals.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Personalized treatment plans</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Flexible scheduling options</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Confidential and secure sessions</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-blue-600 text-3xl">👥</span>
                        </div>
                        <h2 className="text-3xl font-semibold text-blue-900 mb-4">Group Therapy</h2>
                        <p className="text-gray-700 mb-6">
                            Connect with others in a supportive group environment, facilitated by experienced professionals.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Shared experiences and support</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Diverse group topics and themes</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 text-xl">✓</span>
                                <span className="text-gray-700">Regular group sessions</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Specialized Programs */}
                <div className="mb-16">
                    <h2 className="text-3xl font-semibold text-blue-900 mb-8 text-center">Specialized Programs</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">😌</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Stress Management</h3>
                            <p className="text-gray-700">
                                Learn effective techniques to manage stress and improve your overall well-being.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">💪</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Anxiety Relief</h3>
                            <p className="text-gray-700">
                                Develop coping strategies and tools to manage anxiety in daily life.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <span className="text-blue-600 text-2xl">🌟</span>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-900 mb-3">Self-Esteem Building</h3>
                            <p className="text-gray-700">
                                Build confidence and develop a positive self-image through guided exercises.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Program Features */}
                <div className="bg-blue-50 rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-semibold text-blue-900 mb-8 text-center">Program Features</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Flexible Scheduling</h3>
                            <p className="text-gray-700">
                                Choose from various time slots that fit your schedule, including evenings and weekends.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Progress Tracking</h3>
                            <p className="text-gray-700">
                                Monitor your progress with regular assessments and personalized feedback.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Resource Library</h3>
                            <p className="text-gray-700">
                                Access a comprehensive collection of mental health resources and tools.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Community Support</h3>
                            <p className="text-gray-700">
                                Connect with others in our supportive community through forums and events.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 