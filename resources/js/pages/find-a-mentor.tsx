import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HomeLayout from '@/layouts/home-layout';
import { motion } from 'framer-motion';

export default function FindAMentor({ contact_whatsapp }: { contact_whatsapp: string }) {
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const message = `Halo Admin, saya ingin mencari mentor di GrowRich.%0A%0ANama: ${name}%0AWhatsApp: ${whatsapp}%0AAlamat: ${address}%0AKota: ${city}`;
        const whatsappUrl = `https://wa.me/${contact_whatsapp?.replace(/[^0-9]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <HomeLayout>
            <Head title="Find a Mentor - GrowRich" />
            <div className="relative overflow-hidden bg-white pt-32 pb-20">
                {/* blur blobs */}
                <div className="pointer-events-none absolute -top-32 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="pointer-events-none absolute top-10 -right-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />

                <div className="container relative mx-auto max-w-2xl px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl shadow-primary/5"
                    >
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">Find a Mentor</h1>
                            <p className="text-gray-500">Lengkapi data diri Anda untuk kami hubungkan dengan mentor terbaik yang siap membimbing kesuksesan Anda.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama lengkap sesuai identitas"
                                    required
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">Nomor WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    type="tel"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    required
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Masukkan alamat domisili Anda"
                                    required
                                    className="rounded-xl min-h-[100px] border-gray-100 bg-gray-50/50 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-semibold text-gray-700">Kota / Kabupaten</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Masukkan kota domisili Anda"
                                    required
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-colors"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-full bg-primary text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                Submit & Hubungi Via WhatsApp
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </HomeLayout>
    );
}
