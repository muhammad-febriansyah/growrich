import { Head } from '@inertiajs/react';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';

interface ContactInfo {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    google_maps_embed?: string;
}

interface SocialLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
}

const TiktokIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
);

export default function Contact({ contact, socials }: { contact: ContactInfo; socials: SocialLinks }) {
    const socialLinks = [
        { key: 'instagram', icon: <Instagram className="h-5 w-5" />, label: 'Instagram', href: socials.instagram, hoverBg: 'hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white' },
        { key: 'facebook', icon: <Facebook className="h-5 w-5" />, label: 'Facebook', href: socials.facebook, hoverBg: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white' },
        { key: 'youtube', icon: <Youtube className="h-5 w-5" />, label: 'YouTube', href: socials.youtube, hoverBg: 'hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white' },
        { key: 'twitter', icon: <Twitter className="h-5 w-5" />, label: 'Twitter/X', href: socials.twitter, hoverBg: 'hover:bg-black hover:border-black hover:text-white' },
        { key: 'tiktok', icon: <TiktokIcon />, label: 'TikTok', href: socials.tiktok, hoverBg: 'hover:bg-[#010101] hover:border-[#010101] hover:text-white' },
    ].filter((s) => s.href);

    const contactItems = [
        {
            icon: <MessageCircle className="h-6 w-6" />,
            label: 'WhatsApp',
            value: contact.whatsapp,
            href: contact.whatsapp
                ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`
                : undefined,
            linkText: 'Chat Sekarang',
            display: contact.whatsapp,
        },
        {
            icon: <Mail className="h-6 w-6" />,
            label: 'Email',
            value: contact.email,
            href: contact.email ? `mailto:${contact.email}` : undefined,
            linkText: contact.email,
            display: contact.email,
        },
        {
            icon: <Phone className="h-6 w-6" />,
            label: 'Telepon',
            value: contact.phone,
            href: contact.phone ? `tel:${contact.phone}` : undefined,
            linkText: contact.phone,
            display: contact.phone,
        },
        {
            icon: <MapPin className="h-6 w-6" />,
            label: 'Kantor Pusat',
            value: contact.address,
            href: undefined,
            linkText: undefined,
            display: contact.address,
        },
    ].filter((item) => item.value);

    return (
        <HomeLayout>
            <Head title="Hubungi Kami - GrowRich" />

            <PageHeader
                title="Hubungi Kami"
                description="Punya pertanyaan atau butuh bantuan? Tim kami siap melayani Anda sepenuh hati."
            />

            <section className="bg-white py-14 lg:py-20">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Contact Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {contactItems.map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.02]"
                            >
                                {/* Icon */}
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    {item.icon}
                                </div>

                                {/* Label */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        {item.label}
                                    </p>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel="noopener noreferrer"
                                            className="mt-1 block text-sm font-semibold text-primary hover:underline"
                                        >
                                            {item.linkText}
                                        </a>
                                    ) : (
                                        <p className="mt-1 text-sm leading-relaxed text-foreground">
                                            {item.display}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Google Maps */}
                    {contact.google_maps_embed && (
                        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
                            <div
                                className="aspect-[16/7] w-full"
                                dangerouslySetInnerHTML={{
                                    __html: contact.google_maps_embed
                                        .replace(/<iframe/g, '<iframe style="border:0;width:100%;height:100%;"')
                                        .replace(/width="[0-9]*"/g, '')
                                        .replace(/height="[0-9]*"/g, ''),
                                }}
                            />
                        </div>
                    )}

                    {/* Social Media */}
                    {socialLinks.length > 0 && (
                        <div className="mt-14 border-t border-border pt-14 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Ikuti Kami
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-foreground">Media Sosial Resmi</h2>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                {socialLinks.map((s) => (
                                    <a
                                        key={s.key}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className={`flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors ${s.hoverBg}`}
                                    >
                                        {s.icon}
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </HomeLayout>
    );
}
