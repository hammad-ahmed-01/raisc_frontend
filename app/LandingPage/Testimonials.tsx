'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
	{
		name: 'Rehana Rasheed',
		condition: 'Certified Clinical Psychologist',
		image: '/testimonials/woman.png', // Make sure this image exists in your public directory
		text: 'RAISC is an incredible platform and truly one of its kind in the Mental Health space. How AI has been integrated into the entire workflow makes the therapy process as a whole much more efficient and accessible, from both the receiving and giving ends.',
	},
	{
		name: 'Fatima Irfan',
		condition: 'Consultant Psychiatrist',
		image: '/testimonials/woman.png',
		text: 'It is a great initiative and has the potential to change how therapy works. Not only does it make therapy accessible and easy for users, but it also helps therapists in their day-to-day work. One of the best uses of modern technology for public welfare.',
	},
	{
		name: 'Meshal Wali',
		condition: 'Counseling Psychologist',
		image: '/testimonials/woman.png',
		text: 'RAISC is an amazing initiative for accessing therapy online. In the society where this is frowned upon, RAISC is clearing the path to make therapy available for everyone',
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
			className="relative px-4 py-20 bg-blue-50 h-screen text-center overflow-hidden"
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
					<p>[Contact to add your testimonial]</p>
				</div>
			</div>
		</section>
	);
}
