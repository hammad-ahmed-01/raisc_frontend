'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
	{
		name: 'Sarah J.',
		condition: 'Anxiety Management',
		image: '/testimonials/woman.png', // Make sure this image exists in your public directory
		text: 'RAISC has been life-changing for me. The therapist I was matched with understood my anxiety issues perfectly, and I\'ve made more progress in three months than I did in years of trying to manage on my own.',
	},
	{
		name: 'Omar K.',
		condition: 'Stress & Burnout',
		image: '/testimonials/woman.png',
		text: 'Thanks to RAISC, I learned how to manage my stress and set boundaries. Their platform is incredibly user-friendly, and the support is amazing.',
	},
	{
		name: 'Aisha M.',
		condition: 'Depression Support',
		image: '/testimonials/woman.png',
		text: 'Finding the right therapist was effortless. The sessions were flexible, and I felt seen and heard for the first time in a long while.',
	},
];

export default function TestimonialSection() {
	const [current, setCurrent] = useState(0);
	const total = testimonials.length;

	const nextTestimonial = () => setCurrent((current + 1) % total);
	const prevTestimonial = () => setCurrent((current - 1 + total) % total);

	const { name, condition, image, text } = testimonials[current];

	return (
		<section
			id="testimonials"
			className="relative px-4 py-20 bg-blue-50 min-h-screen text-center overflow-hidden"
			style={{ borderBottom: '5px solid #D0E3FFC7' }}
		>
			<div className="mb-2">
				<img
					src="/testimonials.png"
					alt="Services Icon"
					className="mx-auto w-30 h-20"
				/>
			</div>
			<h2 className="text-heading font-bold text-2xl mb-[6px]">
				What Our Clients Say
			</h2>
			<h2 className="text-heading2 mt-2 mb-8 max-w-xl mx-auto">
				Real stories from people who have transformed their lives through our platform.
			</h2>

			{/* Testimonial Container */}
			<div className="p-6 rounded-[40px] bg-[#FFD2DC] max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 shadow-xl">
				{/* Left - Image */}
				<div className="flex-shrink-0">
					<img
						src={image}
						alt={name}
						className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg"
					/>
				</div>

				{/* Right - Text */}
				<div className="text-left">
					<p className="text-lg text-normal text-center leading-relaxed mb-4">
						“{text}”
					</p>
					<p className="font-medium text-heading text-center text-base">{name}</p>
					<p className="text-normal text-center text-sm">{condition}</p>
				</div>
			</div>

			{/* Navigation Arrows and Dots */}
			<div className="mt-8 flex flex-col items-center">
				{/* Arrows */}
				<div className="flex items-center gap-6">
					<button
						onClick={prevTestimonial}
						aria-label="Previous"
						className="p-2 rounded-full text-heading2 bg-white shadow hover:bg-gray-100 transition"
					>
						<ChevronLeft size={24} />
					</button>
					<button
						onClick={nextTestimonial}
						aria-label="Next"
						className="p-2 rounded-full text-heading2 bg-white shadow hover:bg-gray-100 transition"
					>
						<ChevronRight size={24} />
					</button>
				</div>

				{/* Pagination Dots */}
				<div className="flex gap-2 mt-4">
					{testimonials.map((_, index) => (
						<span
							key={index}
							className={`h-3 w-3 rounded-full transition-all ${
								index === current ? 'bg-blue-600 w-5' : 'bg-gray-300'
							}`}
						></span>
					))}
				</div>
				<div className="py-2 text-heading2">
					<p>[Add your own experience]</p>
				</div>
			</div>
		</section>
	);
}
