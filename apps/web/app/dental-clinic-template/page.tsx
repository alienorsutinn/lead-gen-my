"use client";

import React, { useState } from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Star, ArrowRight, MessageCircle, Stethoscope, Sparkles, Smile, User, CheckCircle2, Facebook, Instagram, X } from 'lucide-react';

export default function DentalClinicTemplate() {
    const [isSocialOpen, setIsSocialOpen] = useState(false);

    const clinic = {
        name: "Elite Dental Studio",
        tagline: "Advanced Dentistry. Gentle Care.",
        phone: "+60 12-987 6543",
        whatsapp: "60129876543",
        get whatsappLink() {
            return `https://wa.me/${this.whatsapp}?text=Hi%20Elite%20Dental,%20I%20would%20like%20to%20book%20an%20appointment.`;
        },
        address: "88 Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.7849187123!2d101.6500!3d3.1500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMDknMDAuMCJOIDEwMcKwMzknMDAuMCJF!5e0!3m2!1sen!2smy!4v1600000000000!5m2!1sen!2smy",
        hours: [
            { day: "Mon - Fri", time: "9:00 AM - 7:00 PM" },
            { day: "Saturday", time: "9:00 AM - 5:00 PM" },
            { day: "Sunday", time: "By Appointment Only" }
        ],
        doctor: {
            name: "Dr. Sarah Lim",
            title: "BDS (Malaya), MSc Orthodontics (UK)",
            experience: "12+ Years Experience",
            bio: "Dr. Lim specializes in cosmetic makeovers and anxiety-free dentistry. Her gentle approach helps even the most nervous patients feel at ease."
        }
    };

    const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    );

    const services = [
        {
            title: "Dental Implants",
            desc: "The permanent solution for missing teeth. Restore your smile and chewing ability with natural-looking implants.",
            img: "/service-implants.png",
            highlight: true
        },
        {
            title: "Professional Whitening",
            desc: "Brightening your smile up to 8 shades in a single 60-minute session. Safe, effective, and instant results.",
            img: "/service-whitening.png",
            highlight: true
        },
        {
            title: "Invisalign & Braces",
            desc: "Straighten your teeth discreetly. We are a Diamond Provider for clear aligner therapy.",
            img: "/service-invisalign.png",
            highlight: false
        },
        {
            title: "General Scaling",
            desc: "Comprehensive cleaning to prevent gum disease and maintain oral hygiene.",
            img: "/service-scaling.png",
            highlight: false
        },
        {
            title: "Root Canal Treatment",
            desc: "Save your natural tooth with our advanced, pain-free microscope-enhanced procedures.",
            img: "/service-root-canal.png",
            highlight: false
        },
        {
            title: "Children's Dentistry",
            desc: "Fun, friendly, and educational visits to build a lifetime of good oral habits.",
            img: "/service-children.png",
            highlight: false
        }
    ];

    return (
        <div className="font-sans antialiased text-slate-800 bg-white selection:bg-teal-100 scroll-smooth">

            {/* Sticky Mobile Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_rgba(0,0,0,0.05)] flex md:hidden pb-safe">
                <a
                    href={`tel:${clinic.phone}`}
                    className="flex-1 flex flex-col items-center justify-center py-3 active:bg-slate-50 transition-colors border-r border-slate-100"
                >
                    <Phone className="text-slate-700 mb-1" size={20} />
                    <span className="text-xs font-bold text-slate-700">Call Now</span>
                </a>
                <button
                    onClick={() => setIsSocialOpen(!isSocialOpen)}
                    className="flex-1 flex flex-col items-center justify-center py-3 bg-[#f0fdf4] active:bg-green-100 transition-colors"
                >
                    <MessageCircle className="text-[#25D366] mb-1 w-5 h-5" />
                    <span className="text-xs font-bold text-[#128C7E]">Contact Us</span>
                </button>
            </div>

            {/* Mobile Social Speed Dial (Above Sticky Bar) */}
            <div className={`fixed bottom-20 right-4 z-50 flex flex-col gap-4 items-end transition-all duration-300 md:hidden ${isSocialOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <a href={clinic.whatsappLink} className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg font-bold">
                    <span className="text-sm">WhatsApp</span>
                    <WhatsAppIcon className="w-6 h-6" />
                </a>
                <a href="#" className="flex items-center gap-3 bg-[#1877F2] text-white px-4 py-3 rounded-full shadow-lg font-bold">
                    <span className="text-sm">Messenger</span>
                    <Facebook size={24} />
                </a>
                <a href="#" className="flex items-center gap-3 bg-gradient-to-tr from-[#FFD600] via-[#FF0100] to-[#D800B9] text-white px-4 py-3 rounded-full shadow-lg font-bold">
                    <span className="text-sm">Instagram</span>
                    <Instagram size={24} />
                </a>
            </div>

            {/* Desktop Floating Speed Dial */}
            <div className={`hidden md:flex flex-col gap-4 fixed bottom-6 right-6 z-50 items-end`}>
                <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${isSocialOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none absolute bottom-0 right-0'}`}>
                    <a href={clinic.whatsappLink} className="flex items-center gap-3 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl border border-slate-100 hover:bg-slate-50 group">
                        <span className="font-bold text-sm">WhatsApp</span>
                        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                            <WhatsAppIcon className="w-6 h-6" />
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl border border-slate-100 hover:bg-slate-50 group">
                        <span className="font-bold text-sm">Messenger</span>
                        <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                            <Facebook size={20} />
                        </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl border border-slate-100 hover:bg-slate-50 group">
                        <span className="font-bold text-sm">Instagram</span>
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD600] via-[#FF0100] to-[#D800B9] rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                            <Instagram size={20} />
                        </div>
                    </a>
                </div>

                <button
                    onClick={() => setIsSocialOpen(!isSocialOpen)}
                    className={`flex items-center justify-center w-16 h-16 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${isSocialOpen ? 'bg-slate-800 rotate-90' : 'bg-teal-600 animate-bounce-slow'}`}
                    aria-label="Contact Options"
                >
                    {isSocialOpen ? <X size={28} /> : <MessageCircle size={32} />}
                </button>
            </div>


            {/* Navbar */}
            <nav className="fixed w-full z-40 top-0 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-end gap-2">
                            {/* Simple Text Logo */}
                            <span className="text-2xl font-extrabold text-teal-900 tracking-tight">Elite<span className="text-teal-500">Dental</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#services" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Services</a>
                            <a href="#doctor" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Our Doctor</a>
                            <a href="#results" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Results</a>
                            <a href="#contact" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full transition-all shadow-lg shadow-teal-200">
                                Book Now
                            </a>
                        </div>

                        {/* Mobile Nav Toggle / Chat - Kept simple for now, using Action Bar principally */}
                        <button
                            onClick={() => setIsSocialOpen(true)}
                            className="md:hidden bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                        >
                            <MessageCircle size={16} fill="currentColor" /> Chat
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/dental-hero.png"
                        alt="Modern Dental Clinic"
                        className="w-full h-full object-cover opacity-90 brightness-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-950/90 via-teal-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                    <div className="max-w-2xl space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-50 text-sm font-bold tracking-wide uppercase">
                            <Star size={14} className="fill-teal-400 text-teal-400" />
                            <span>Voted #1 Family Clinic in Mont Kiara</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-sm">
                            Your Perfect Smile <br />
                            <span className="text-teal-200">Starts Here.</span>
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-100 max-w-lg leading-relaxed font-light">
                            Experience pain-free, world-class dentistry in a spa-like environment. We utilize the latest technology to ensure your comfort and satisfaction.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <a
                                href={clinic.whatsappLink}
                                className="inline-flex justify-center items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all"
                            >
                                <WhatsAppIcon className="w-5 h-5 text-white" />
                                Book Appointment
                            </a>
                            <a
                                href="#services"
                                className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg backdrop-blur-md transition-all"
                            >
                                View Treatments
                            </a>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-teal-100 font-medium pt-8 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-teal-400" /> Satisfied Patients
                            </div>
                            <div className="h-4 w-px bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-teal-400" /> 5-Star Rated
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Strip */}
            <div className="bg-teal-50 border-b border-teal-100 py-10">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm mb-2">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">Hospital-Grade Safety</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">We adhere to the strictest sterilization protocols for your complete safety.</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm mb-2">
                            <Smile size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">Pain-Free Dentistry</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Advanced numbing techniques and sedation options mainly for nervous patients.</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm mb-2">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">Flexible Hours</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Open weekends and evenings to fit your busy schedule perfectly.</p>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-teal-600 font-bold tracking-wider uppercase text-sm">Our Expertise</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Comprehensive Dental Care</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg pt-2">Combines art and science. From routine check-ups to complex restorative treatments.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((s, i) => (
                            <div
                                key={i}
                                className={`group rounded-3xl transition-all duration-300 border overflow-hidden h-full flex flex-col ${s.highlight
                                        ? 'bg-slate-900 text-white shadow-xl border-slate-800'
                                        : 'bg-white hover:shadow-xl border-slate-100 hover:border-teal-100'
                                    }`}
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className={`absolute inset-0 ${s.highlight ? 'bg-teal-900/20 mix-blend-multiply' : 'bg-black/0'}`}></div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <h3 className={`font-bold text-2xl mb-3 ${s.highlight ? 'text-white' : 'text-slate-900'}`}>{s.title}</h3>
                                    <p className={`${s.highlight ? 'text-slate-300' : 'text-slate-500'} leading-relaxed flex-grow`}>{s.desc}</p>

                                    <div className="pt-6 mt-auto">
                                        <span className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide group-hover:gap-3 transition-all ${s.highlight ? 'text-teal-400' : 'text-teal-600'}`}>
                                            Learn More <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctor / Credentials Section */}
            <section id="doctor" className="bg-slate-50 py-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">

                        <div className="w-full lg:w-1/2 relative lg:order-2">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl skew-y-1">
                                <img
                                    src="/doctor-profile.png"
                                    alt="Dr. Sarah Lim"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-8 pt-24 text-white">
                                    <h3 className="text-2xl font-bold">{clinic.doctor.name}</h3>
                                    <p className="text-teal-300 font-medium">{clinic.doctor.title}</p>
                                </div>
                            </div>
                            <div className="absolute top-4 -right-4 w-full h-full border-2 border-teal-200 rounded-3xl -z-0"></div>
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl"></div>
                        </div>

                        <div className="w-full lg:w-1/2 space-y-8 lg:order-1">
                            <div>
                                <span className="text-teal-600 font-bold tracking-wider uppercase text-sm mb-2 block">Meet Your Dentist</span>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                                    Expert Care with a <br /> <span className="text-teal-600">Gentle Touch.</span>
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    {clinic.doctor.bio}
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-teal-100 p-2 rounded-full text-teal-700"><CheckCircle2 size={24} /></div>
                                        <h4 className="font-bold text-slate-900 text-lg">12+ Years</h4>
                                    </div>
                                    <p className="text-slate-500 text-sm">Extensive experience in both cosmetic and general dentistry.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-teal-100 p-2 rounded-full text-teal-700"><Smile size={24} /></div>
                                        <h4 className="font-bold text-slate-900 text-lg">Anxiety Free</h4>
                                    </div>
                                    <p className="text-slate-500 text-sm">Specializing in treating nervous patients with care and patience.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <a href="#contact" className="inline-flex items-center text-lg font-bold text-teal-600 border-b-2 border-teal-200 hover:border-teal-600 transition-all pb-1">
                                    Schedule a Consultation with Dr. Lim
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real Results */}
            <section id="results" className="py-24 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <span className="text-teal-600 font-bold tracking-wider uppercase text-sm">Real Results</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Transforming Smiles Daily</h2>
                            <p className="text-slate-600 mt-4 text-lg">See the difference our cosmetic treatments can make to your confidence.</p>
                        </div>
                        <a href={clinic.whatsappLink} className="hidden md:flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors">
                            View Gallery <ArrowRight size={18} />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="relative group overflow-hidden rounded-3xl">
                            <img src="/smile-result.png" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" alt="Smile Transformation" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                            <div className="absolute bottom-0 left-0 p-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h4 className="text-2xl font-bold mb-2">Porcelain Veneers</h4>
                                <p className="text-slate-200">Complete upper arch transformation for a natural, brighter smile.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center border border-slate-100">
                            <div className="mb-6">
                                <div className="flex justify-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-2xl font-serif italic text-slate-800 leading-relaxed">
                                    "I used to hide my smile in photos. After my treatment at Elite, I can't stop smiling! The process was so much easier than I expected."
                                </p>
                            </div>
                            <div className="mt-4">
                                <h5 className="font-bold text-slate-900">Jessica Tan</h5>
                                <p className="text-sm text-slate-500">Patient since 2021</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location & Contact */}
            <section id="contact" className="bg-teal-900 py-24 px-4 text-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div className="space-y-12">
                        <div>
                            <span className="text-teal-400 font-bold tracking-wider uppercase text-sm">Visit Us</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6">Ready for your <br /> check-up?</h2>
                            <p className="text-teal-100 text-lg max-w-md">We are strategically located in Mont Kiara with ample parking. Contact us today.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-xl bg-white/10 text-teal-300">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Our Location</h3>
                                    <p className="text-teal-100 text-lg leading-relaxed">{clinic.address}</p>
                                    <a href={clinic.mapUrl} className="inline-block mt-3 text-teal-400 font-bold hover:text-white transition-colors">Open in Google Maps &rarr;</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-xl bg-white/10 text-teal-300">
                                    <Clock size={24} />
                                </div>
                                <div className="w-full max-w-sm">
                                    <h3 className="text-xl font-bold mb-2">Opening Hours</h3>
                                    <div className="space-y-3">
                                        {clinic.hours.map((h, i) => (
                                            <div key={i} className="flex justify-between text-teal-100 border-b border-teal-800 pb-2 last:border-0">
                                                <span>{h.day}</span>
                                                <span className="font-medium text-white">{h.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                        <iframe
                            src={clinic.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                        ></iframe>
                        <div className="absolute bottom-6 left-6 right-6">
                            <a
                                href={clinic.whatsappLink}
                                className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <WhatsAppIcon className="w-6 h-6 text-white" /> WhatsApp For Appointment
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="bg-teal-950 text-teal-400/60 py-12 px-4 text-center text-sm border-t border-teal-900">
                <p>&copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
            </footer>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
             `}</style>
        </div>
    );
}
