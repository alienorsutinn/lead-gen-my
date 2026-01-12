
import React from 'react';
import { Phone, MapPin, Clock, CheckCircle2, Star, ArrowRight, MessageCircle } from 'lucide-react';

export default function LocalBusinessTemplate() {
    const business = {
        name: "CityFix Plumbing & Heating",
        tagline: "Your Trusted Local Experts Since 2015",
        phone: "+60 12-345 6789",
        whatsapp: "60123456789",
        address: "123 Jalan Utama, Taman Business, 47000 Sungai Buloh",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127482.52932644265!2d101.52047!3d3.20817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc4681d0000001%3A0x647167683933!2sSungai%20Buloh!5e0!3m2!1sen!2smy!4v1700000000000!5m2!1sen!2smy",
        hours: [
            { day: "Mon - Fri", time: "8:00 AM - 6:00 PM" },
            { day: "Saturday", time: "9:00 AM - 3:00 PM" },
            { day: "Sunday", time: "Emergency Only" }
        ]
    };

    const services = [
        { title: "Emergency Repairs", desc: "Fast response for leaks and bursts." },
        { title: "Drain Cleaning", desc: "Unclogging drains quickly and safely." },
        { title: "Heater Installation", desc: "Expert installation and maintenance." },
        { title: "Pipe Replacement", desc: "Full piping overhaul services." },
        { title: "Leak Detection", desc: "Advanced tech to find hidden leaks." },
        { title: "Commercial Plumbing", desc: "Reliable service for businesses." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sticky Mobile Header */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 py-3 flex justify-between items-center md:hidden">
                <span className="font-bold text-lg text-slate-800">{business.name}</span>
                <a
                    href={`https://wa.me/${business.whatsapp}`}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                    <MessageCircle size={16} /> WhatsApp
                </a>
            </nav>

            {/* Hero Section */}
            <header className="relative bg-slate-900 text-white py-16 px-4 md:py-24">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm text-green-400 font-medium">
                        <Star size={14} className="fill-green-400" />
                        <span>#1 Rated Local Service</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Professional Repairs.<br />
                        <span className="text-slate-400">Done Right, First Time.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto">
                        {business.tagline}. Fast, reliable, and fair pricing. We show up on time, every time.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <a
                            href={`https://wa.me/${business.whatsapp}`}
                            className="inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg active:transform active:scale-95 transition-all"
                        >
                            <MessageCircle size={20} />
                            WhatsApp Us Now
                        </a>
                        <a
                            href={`tel:${business.phone}`}
                            className="inline-flex justify-center items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg shadow-lg active:transform active:scale-95 transition-all"
                        >
                            <Phone size={20} />
                            Call Now
                        </a>
                    </div>
                </div>
            </header>

            {/* Services Grid */}
            <section className="py-16 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Our Services</h2>
                    <p className="text-slate-600 mt-2">Comprehensive solutions for your home and office.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-700">
                                <CheckCircle2 size={20} />
                            </div>
                            <h3 className="font-bold text-lg mb-1 text-slate-900">{s.title}</h3>
                            <p className="text-slate-500 text-sm">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Section */}
            <section className="bg-slate-100 py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why Choose Us?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                                <Star size={24} />
                            </div>
                            <h3 className="font-bold text-lg">5-Star Reviews</h3>
                            <p className="text-slate-600 text-sm">Hundreds of satisfied customers can't be wrong. We prioritize your satisfaction.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-bold text-lg">On-Time Guarantee</h3>
                            <p className="text-slate-600 text-sm">We value your time. If we're late, we'll discount your service bill.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-bold text-lg">Locally Owned</h3>
                            <p className="text-slate-600 text-sm">Proudly serving the community for over 10 years. We're your neighbors.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location & Hours */}
            <section className="py-16 px-4 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Visit Us</h2>
                            <div className="flex items-start gap-3 text-slate-600 mb-4">
                                <MapPin className="shrink-0 mt-1" size={20} />
                                <p>{business.address}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Clock size={18} /> Opening Hours
                            </h3>
                            <div className="space-y-2">
                                {business.hours.map((h, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{h.day}</span>
                                        <span className="font-medium text-slate-900">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="font-bold text-slate-900">Contact</h3>
                            <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                                <Phone size={20} />
                                <span className="underline decoration-slate-300">{business.phone}</span>
                            </a>
                            <a href={`https://wa.me/${business.whatsapp}`} className="flex items-center gap-3 text-slate-600 hover:text-green-600 transition-colors">
                                <MessageCircle size={20} />
                                <span className="underline decoration-slate-300">Chat on WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-xl overflow-hidden h-[400px] shadow-inner">
                        {/* Map Placeholder - Replace src with actual specific embedding if needed */}
                        <iframe
                            src={business.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full grayscale opacity-80 hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-slate-900 text-white py-12 px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">Contact us today for a free quote. No obligations, just honest advice.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href={`https://wa.me/${business.whatsapp}`}
                        className="inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold transition-all"
                    >
                        <MessageCircle size={18} />
                        WhatsApp Us
                    </a>
                    <a
                        href={`tel:${business.phone}`}
                        className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                    >
                        <Phone size={18} />
                        Call {business.phone}
                    </a>
                </div>
                <div className="mt-12 text-xs text-slate-600 border-t border-slate-800 pt-6">
                    &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
                </div>
            </section>
        </div>
    );
}
