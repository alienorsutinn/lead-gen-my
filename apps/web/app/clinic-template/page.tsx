"use client";

import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, CheckCircle2, ShieldCheck, HeartPulse, Stethoscope } from "lucide-react";

export default function ClinicTemplate() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Top Bar - Trust & Contact */}
            <div className="bg-slate-900 text-white py-2 px-4 shadow-sm z-50 relative">
                <div className="max-w-3xl mx-auto flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                        <span className="font-medium">Open until 9:00 PM</span>
                    </div>
                    <a href="tel:+60312345678" className="flex items-center gap-1 hover:text-blue-100 transition-colors">
                        <Phone size={14} />
                        <span className="hidden sm:inline">Emergency:</span> +603-1234-5678
                    </a>
                </div>
            </div>

            {/* Navigation / Brand */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <HeartPulse className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-none">Bangsar South</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide">FAMILY CLINIC</p>
                        </div>
                    </div>

                    <a
                        href="https://wa.me/60123456789"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                        <MessageCircle size={16} />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="bg-white pb-12 pt-8 sm:py-16 px-6 border-b border-slate-100">
                <div className="max-w-3xl mx-auto text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                        <ShieldCheck size={16} />
                        <span>Registered with KKM & MMA</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                        Patient-first care for <br className="hidden sm:block" />
                        <span className="text-blue-600">your family's health.</span>
                    </h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                        We are a community clinic focused on providing unhurried, thorough consultations.
                        No upsells, just genuine medical advice from experienced doctors.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="tel:+60312345678" className="bg-slate-900 text-white px-6 py-3.5 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-slate-800 transition-all">
                            <Phone size={18} />
                            Call for Appointment
                        </a>
                        <a href="#location" className="bg-white border border-slate-300 text-slate-700 px-6 py-3.5 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-slate-50 transition-all">
                            <MapPin size={18} />
                            View Location
                        </a>
                    </div>
                </div>
            </header>

            {/* Core Services */}
            <section className="py-16 px-6 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <Stethoscope className="text-blue-600" />
                    Our Medical Services
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { title: "General Practice", desc: "Consultations for adults and children, fever, flu, chronic disease management." },
                        { title: "Minor Surgery", desc: "Wound stitching, toilet & suture, dressing, removal of lumps/bumps." },
                        { title: "Health Screening", desc: "Blood tests, urine analysis, ECG, and detailed medical reports." },
                        { title: "Vaccinations", desc: "Routine immunizations for babies/children, flu shots, typhoid, and more." },
                    ].map((service, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                            <h4 className="font-bold text-slate-900 mb-2">{service.title}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* The Doctors / Trust Signal */}
            <section className="bg-blue-900 text-white py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center text-2xl font-bold border-2 border-blue-400">
                            Dr
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Dr. Sarah Lim</h3>
                            <p className="text-blue-200">Resident Physician</p>
                        </div>
                    </div>

                    <div className="space-y-4 text-blue-100 leading-relaxed mb-8">
                        <p>
                            "I believe in treating patients, not just symptoms. My goal is to ensure you leave the clinic understanding your health better than when you walked in."
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-blue-800 pt-8">
                        <div>
                            <p className="text-blue-400 mb-1 font-semibold uppercase tracking-wider text-xs">Qualifications</p>
                            <p>MBBS (Malaya)</p>
                            <p>FRACGP (Australia)</p>
                        </div>
                        <div>
                            <p className="text-blue-400 mb-1 font-semibold uppercase tracking-wider text-xs">Languages</p>
                            <p>English, Bahasa Melayu</p>
                            <p>Mandarin, Cantonese</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Grid: Location & Hours */}
            <section id="location" className="py-16 px-6 max-w-3xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* Hours */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-slate-500" />
                            Opening Hours
                        </h3>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
                            {[
                                { day: "Monday - Friday", time: "9:00 AM - 9:00 PM", active: true },
                                { day: "Saturday", time: "9:00 AM - 5:00 PM", active: false },
                                { day: "Sunday", time: "9:00 AM - 1:00 PM", active: false },
                                { day: "Public Holidays", time: "Closed", active: false },
                            ].map((item, i) => (
                                <div key={i} className={`flex justify-between py-3 px-4 border-b border-slate-100 last:border-0 ${item.active ? 'bg-green-50/50' : ''}`}>
                                    <span className={item.active ? 'font-medium text-slate-900' : 'text-slate-600'}>{item.day}</span>
                                    <span className={item.active ? 'font-bold text-green-700' : 'text-slate-900'}>{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-slate-500" />
                            Visit Us
                        </h3>
                        <div className="bg-slate-100 rounded-xl h-48 mb-4 flex items-center justify-center text-slate-400 border border-slate-200">
                            <span className="text-sm">Google Maps Embed/Image Placeholder</span>
                        </div>
                        <address className="not-italic text-slate-600 leading-relaxed text-sm">
                            <strong className="text-slate-900 block mb-1">Bangsar South Family Clinic</strong>
                            Unit G-12, The Sphere, No. 1<br />
                            Avenue 1, Bangsar South City<br />
                            59200 Kuala Lumpur
                        </address>

                        <div className="mt-4 flex gap-3">
                            <a href="#" className="text-blue-600 hover:underline text-sm font-medium">Get Directions &rarr;</a>
                            <a href="#" className="text-blue-600 hover:underline text-sm font-medium">Waze &rarr;</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to see a doctor?</h2>
                    <p className="text-slate-500 mb-6">Walk-ins are welcome, but appointments are recommended to reduce waiting time.</p>

                    <div className="flex flex-col items-center gap-3">
                        <a
                            href="https://wa.me/60123456789"
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-all shadow-sm"
                        >
                            <MessageCircle size={18} />
                            WhatsApp Appointment
                        </a>
                        <div className="text-slate-400 text-xs mt-4">
                            © 2024 Bangsar South Family Clinic. All rights reserved. <br />
                            <span className="opacity-70">KKM Registration No: 12345678</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
