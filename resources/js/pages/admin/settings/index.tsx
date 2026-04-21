import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Save, Globe, Phone, Share2, Search, Layout, Settings, Image, Mail, CreditCard, Eye, EyeOff, ShieldCheck, Store, Truck } from 'lucide-react';
import { InputRupiah } from '@/components/ui/input-rupiah';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface SiteSettingsData {
    id: number;
    site_name: string | null;
    site_tagline: string | null;
    site_description: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    hero_image_url: string | null;
    hero_badge: string | null;
    hero_title: string | null;
    hero_title_highlight: string | null;
    hero_title_suffix: string | null;
    hero_description: string | null;
    hero_stats_value: string | null;
    hero_stats_label: string | null;
    features_section_badge: string | null;
    features_section_title: string | null;
    features_section_highlight: string | null;
    features_section_description: string | null;
    packages_section_badge: string | null;
    packages_section_title: string | null;
    packages_section_highlight: string | null;
    packages_section_description: string | null;
    marketing_section_badge: string | null;
    marketing_section_title: string | null;
    marketing_section_highlight: string | null;
    marketing_section_description: string | null;
    career_section_title: string | null;
    career_section_highlight: string | null;
    career_section_description: string | null;
    steps_section_badge: string | null;
    steps_section_title: string | null;
    steps_section_highlight: string | null;
    steps_section_description: string | null;
    contact_phone: string | null;
    contact_whatsapp: string | null;
    contact_email: string | null;
    contact_address: string | null;
    social_facebook: string | null;
    social_instagram: string | null;
    social_twitter: string | null;
    social_youtube: string | null;
    social_tiktok: string | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    footer_text: string | null;
    copyright_text: string | null;
    email_sender: string | null;
    email_token: string | null;
    duitku_merchant_code: string | null;
    duitku_api_key: string | null;
    duitku_is_sandbox: boolean;
    biteship_api_key: string | null;
    biteship_origin_postal_code: string | null;
    biteship_dummy_mode: boolean;
    nocaptcha_sitekey: string | null;
    nocaptcha_secret: string | null;
    google_maps_url: string | null;
    google_maps_embed: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    pairing_bonus_amount: number;
    stockist_min_order: number;
    stockist_discount_percent: number;
    volume_discount_5_percent: number;
    volume_discount_10_percent: number;
}

interface Props {
    settings: SiteSettingsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Situs',
        href: '/admin/settings',
    },
];

export default function SiteSettings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        site_name: settings.site_name || '',
        site_tagline: settings.site_tagline || '',
        site_description: settings.site_description || '',
        logo: null as File | null,
        favicon: null as File | null,
        hero_badge: settings.hero_badge || '',
        hero_title: settings.hero_title || '',
        hero_title_highlight: settings.hero_title_highlight || '',
        hero_title_suffix: settings.hero_title_suffix || '',
        hero_description: settings.hero_description || '',
        hero_image: null as File | null,
        hero_stats_value: settings.hero_stats_value || '',
        hero_stats_label: settings.hero_stats_label || '',
        features_section_badge: settings.features_section_badge || '',
        features_section_title: settings.features_section_title || '',
        features_section_highlight: settings.features_section_highlight || '',
        features_section_description: settings.features_section_description || '',
        packages_section_badge: settings.packages_section_badge || '',
        packages_section_title: settings.packages_section_title || '',
        packages_section_highlight: settings.packages_section_highlight || '',
        packages_section_description: settings.packages_section_description || '',
        marketing_section_badge: settings.marketing_section_badge || '',
        marketing_section_title: settings.marketing_section_title || '',
        marketing_section_highlight: settings.marketing_section_highlight || '',
        marketing_section_description: settings.marketing_section_description || '',
        career_section_title: settings.career_section_title || '',
        career_section_highlight: settings.career_section_highlight || '',
        career_section_description: settings.career_section_description || '',
        steps_section_badge: settings.steps_section_badge || '',
        steps_section_title: settings.steps_section_title || '',
        steps_section_highlight: settings.steps_section_highlight || '',
        steps_section_description: settings.steps_section_description || '',
        contact_phone: settings.contact_phone || '',
        contact_whatsapp: settings.contact_whatsapp || '',
        contact_email: settings.contact_email || '',
        contact_address: settings.contact_address || '',
        social_facebook: settings.social_facebook || '',
        social_instagram: settings.social_instagram || '',
        social_twitter: settings.social_twitter || '',
        social_youtube: settings.social_youtube || '',
        social_tiktok: settings.social_tiktok || '',
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        meta_keywords: settings.meta_keywords || '',
        footer_text: settings.footer_text || '',
        copyright_text: settings.copyright_text || '',
        email_sender: settings.email_sender || '',
        email_token: settings.email_token || '',
        duitku_merchant_code: settings.duitku_merchant_code || '',
        duitku_api_key: settings.duitku_api_key || '',
        duitku_is_sandbox: !!settings.duitku_is_sandbox,
        biteship_api_key: settings.biteship_api_key || '',
        biteship_origin_postal_code: settings.biteship_origin_postal_code || '',
        biteship_dummy_mode: !!settings.biteship_dummy_mode,
        bank_name: settings.bank_name || '',
        bank_account_number: settings.bank_account_number || '',
        bank_account_name: settings.bank_account_name || '',
        nocaptcha_sitekey: settings.nocaptcha_sitekey || '',
        nocaptcha_secret: settings.nocaptcha_secret || '',
        google_maps_url: settings.google_maps_url || '',
        google_maps_embed: settings.google_maps_embed || '',
        pairing_bonus_amount: settings.pairing_bonus_amount ?? 100000,
        stockist_min_order: settings.stockist_min_order ?? 10,
        stockist_discount_percent: settings.stockist_discount_percent ?? 0,
        volume_discount_5_percent: settings.volume_discount_5_percent ?? 0,
        volume_discount_10_percent: settings.volume_discount_10_percent ?? 0,
    });

    const [showEmailToken, setShowEmailToken] = useState(false);
    const [showDuitkuApiKey, setShowDuitkuApiKey] = useState(false);
    const [showNocaptchaSecret, setShowNocaptchaSecret] = useState(false);
    const [showBiteshipApiKey, setShowBiteshipApiKey] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Situs" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pengaturan Situs</h1>
                        <p className="text-sm text-muted-foreground">Kelola konfigurasi global aplikasi Anda.</p>
                    </div>
                    <Button onClick={submit} disabled={processing} className="gap-2 shadow-sm font-semibold">
                        <Save className="size-4" />
                        Simpan Perubahan
                    </Button>
                </div>

                <form onSubmit={submit} className="w-full">
                    <Tabs defaultValue="general" orientation="vertical" className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
                        <TabsList className="w-full bg-slate-50/50 p-2 gap-1 border rounded-xl shadow-sm sticky top-6 h-fit">
                            <TabsTrigger
                                value="general"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Globe className="size-4 mr-3" /> Umum
                            </TabsTrigger>
                            <TabsTrigger
                                value="branding"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Settings className="size-4 mr-3" /> Branding
                            </TabsTrigger>
                            <TabsTrigger
                                value="contact"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Phone className="size-4 mr-3" /> Kontak
                            </TabsTrigger>
                            <TabsTrigger
                                value="social"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Share2 className="size-4 mr-3" /> Media Sosial
                            </TabsTrigger>
                            <TabsTrigger
                                value="seo"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Search className="size-4 mr-3" /> SEO
                            </TabsTrigger>
                            <TabsTrigger
                                value="landing"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Layout className="size-4 mr-3" /> Landing Page
                            </TabsTrigger>
                            <TabsTrigger
                                value="footer"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Layout className="size-4 mr-3" /> Footer
                            </TabsTrigger>
                            <TabsTrigger
                                value="email"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Mail className="size-4 mr-3" /> Email
                            </TabsTrigger>
                            <TabsTrigger
                                value="payment"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <CreditCard className="size-4 mr-3" /> Pembayaran
                            </TabsTrigger>
                            <TabsTrigger
                                value="recaptcha"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <ShieldCheck className="size-4 mr-3" /> reCAPTCHA
                            </TabsTrigger>
                            <TabsTrigger
                                value="stockist"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Store className="size-4 mr-3" /> Stokis
                            </TabsTrigger>
                            {/* Tab Bonus disembunyikan */}
                        </TabsList>

                        <div className="space-y-6 min-w-0">
                            {/* General Settings */}
                            <TabsContent value="general" className="mt-0 focus-visible:outline-none">
                                <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                                        <CardTitle className="text-lg">Pengaturan Umum</CardTitle>
                                        <CardDescription>Informasi dasar mengenai situs Anda.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="site_name">Nama Situs</Label>
                                            <Input
                                                id="site_name"
                                                value={data.site_name}
                                                onChange={(e) => setData('site_name', e.target.value)}
                                            />
                                            {errors.site_name && <p className="text-sm text-destructive">{errors.site_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="site_tagline">Tagline</Label>
                                            <Input
                                                id="site_tagline"
                                                value={data.site_tagline}
                                                onChange={(e) => setData('site_tagline', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="site_description">Deskripsi Situs</Label>
                                            <Textarea
                                                id="site_description"
                                                rows={4}
                                                value={data.site_description}
                                                onChange={(e) => setData('site_description', e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Branding Settings */}
                            <TabsContent value="branding" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Identitas Brand</CardTitle>
                                        <CardDescription>Kelola logo dan ikon situs Anda.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-8">
                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Logo Situs (Light Mode)</Label>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 border rounded-xl bg-slate-50/50">
                                                    {settings.logo_url ? (
                                                        <div className="size-24 border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                                                            <img src={settings.logo_url} alt="Logo" className="max-h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        <div className="size-24 border border-dashed rounded-lg bg-white flex items-center justify-center text-muted-foreground shrink-0">
                                                            <Globe className="size-8 opacity-20" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 space-y-3">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                                            className="bg-white"
                                                        />
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-xs text-muted-foreground">Format: <span className="font-semibold">PNG, JPG, WEBP</span> (Maks. 2MB)</p>
                                                        </div>
                                                        {errors.logo && <p className="text-xs text-destructive font-semibold">{errors.logo}</p>}
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="space-y-4">
                                                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Favicon</Label>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 border rounded-xl bg-slate-50/50">
                                                    {settings.favicon_url ? (
                                                        <div className="size-16 border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                                                            <img src={settings.favicon_url} alt="Favicon" className="max-h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        <div className="size-16 border border-dashed rounded-lg bg-white flex items-center justify-center text-muted-foreground shrink-0">
                                                            <Globe className="size-6 opacity-20" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 space-y-3">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setData('favicon', e.target.files?.[0] || null)}
                                                            className="bg-white"
                                                        />
                                                        <p className="text-xs text-muted-foreground">Format: <span className="font-semibold">ICO, PNG (32x32px)</span></p>
                                                        {errors.favicon && <p className="text-xs text-destructive font-semibold">{errors.favicon}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Contact Settings */}
                            <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                                        <CardDescription>Bagaimana pengguna dapat mengunjungi dan menghubungi Anda.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_email">Email Kontak</Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={data.contact_email}
                                                    onChange={(e) => setData('contact_email', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_phone">Nomor Telepon</Label>
                                                <Input
                                                    id="contact_phone"
                                                    value={data.contact_phone}
                                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_whatsapp">WhatsApp (Format Internasional)</Label>
                                                <Input
                                                    id="contact_whatsapp"
                                                    placeholder="628123456789"
                                                    value={data.contact_whatsapp}
                                                    onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_address">Alamat Kantor</Label>
                                            <Textarea
                                                id="contact_address"
                                                rows={3}
                                                value={data.contact_address}
                                                onChange={(e) => setData('contact_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="google_maps_embed">Google Maps Embed Code</Label>
                                            <Textarea
                                                id="google_maps_embed"
                                                rows={4}
                                                placeholder="Tempel kode iframe dari Google Maps di sini"
                                                value={data.google_maps_embed}
                                                onChange={(e) => setData('google_maps_embed', e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Buka Google Maps, cari lokasi, klik 'Bagikan', pilih 'Sematkan peta', lalu salin kode HTML-nya.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Social Media Settings */}
                            <TabsContent value="social" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Media Sosial</CardTitle>
                                        <CardDescription>Tautan ke profil media sosial resmi Anda.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="social_facebook">Facebook URL</Label>
                                                <Input
                                                    id="social_facebook"
                                                    placeholder="https://facebook.com/yourpage"
                                                    value={data.social_facebook}
                                                    onChange={(e) => setData('social_facebook', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="social_instagram">Instagram URL</Label>
                                                <Input
                                                    id="social_instagram"
                                                    placeholder="https://instagram.com/yourprofile"
                                                    value={data.social_instagram}
                                                    onChange={(e) => setData('social_instagram', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="social_twitter">Twitter/X URL</Label>
                                                <Input
                                                    id="social_twitter"
                                                    placeholder="https://x.com/yourprofile"
                                                    value={data.social_twitter}
                                                    onChange={(e) => setData('social_twitter', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="social_tiktok">TikTok URL</Label>
                                                <Input
                                                    id="social_tiktok"
                                                    placeholder="https://tiktok.com/@yourprofile"
                                                    value={data.social_tiktok}
                                                    onChange={(e) => setData('social_tiktok', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SEO Settings */}
                            <TabsContent value="seo" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Search Engine Optimization</CardTitle>
                                        <CardDescription>Optimalkan visibilitas situs Anda di mesin pencari.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="meta_title">Meta Title Default</Label>
                                            <Input
                                                id="meta_title"
                                                value={data.meta_title}
                                                onChange={(e) => setData('meta_title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meta_description">Meta Description Default</Label>
                                            <Textarea
                                                id="meta_description"
                                                rows={3}
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meta_keywords">Meta Keywords (pisahkan dengan koma)</Label>
                                            <Input
                                                id="meta_keywords"
                                                placeholder="investasi, trading, mlm, growrich"
                                                value={data.meta_keywords}
                                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Landing Page Settings */}
                            <TabsContent value="landing" className="mt-0 focus-visible:outline-none">
                                <div className="space-y-6">
                                    <Card className="border shadow-sm rounded-xl overflow-hidden">
                                        <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                                            <CardTitle className="text-lg">Hero Section</CardTitle>
                                            <CardDescription>Konten utama yang tampil di bagian paling atas website.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_badge">Teks Badge</Label>
                                                <Input
                                                    id="hero_badge"
                                                    placeholder="Solusi Pertumbuhan Akurat"
                                                    value={data.hero_badge}
                                                    onChange={(e) => setData('hero_badge', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="hero_title">Judul (Bagian 1)</Label>
                                                    <Input
                                                        id="hero_title"
                                                        placeholder="Grow Your Life"
                                                        value={data.hero_title}
                                                        onChange={(e) => setData('hero_title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="hero_title_highlight">Judul Highlight (Bagian 2 - Hijau)</Label>
                                                    <Input
                                                        id="hero_title_highlight"
                                                        placeholder="With Us"
                                                        value={data.hero_title_highlight}
                                                        onChange={(e) => setData('hero_title_highlight', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="hero_title_suffix">Judul Akhir (Bagian 3)</Label>
                                                    <Input
                                                        id="hero_title_suffix"
                                                        placeholder="Bersama Kami"
                                                        value={data.hero_title_suffix}
                                                        onChange={(e) => setData('hero_title_suffix', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_description">Deskripsi</Label>
                                                <Textarea
                                                    id="hero_description"
                                                    rows={3}
                                                    placeholder="Platform ekosistem MLM modern..."
                                                    value={data.hero_description}
                                                    onChange={(e) => setData('hero_description', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gambar Hero</Label>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 border rounded-xl bg-slate-50/50">
                                                    {settings.hero_image_url ? (
                                                        <div className="h-24 w-40 border rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm shrink-0">
                                                            <img src={settings.hero_image_url} alt="Hero" className="h-full w-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-24 w-40 border border-dashed rounded-lg bg-white flex items-center justify-center text-muted-foreground shrink-0">
                                                            <Image className="size-8 opacity-20" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setData('hero_image', e.target.files?.[0] || null)}
                                                            className="bg-white"
                                                        />
                                                        <p className="text-xs text-muted-foreground">Format: <span className="font-semibold">PNG, JPG, WEBP</span> (Maks. 4MB). Rasio ideal 4:3.</p>
                                                        {errors.hero_image && <p className="text-xs text-destructive font-semibold">{errors.hero_image}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {[
                                        { id: 'features', label: 'Fitur Unggulan', fields: ['badge', 'title', 'highlight', 'description'], defaults: { badge: 'Fitur Unggulan', title: 'Mengapa Memilih', highlight: 'GrowRich?', description: 'Platform lengkap yang dirancang untuk mempercepat pertumbuhan bisnis MLM Anda.' } },
                                        { id: 'packages', label: 'Paket Bergabung', fields: ['badge', 'title', 'highlight', 'description'], defaults: { badge: 'Paket Bergabung', title: 'Pilih Paket', highlight: 'Terbaik Anda', description: 'Mulai perjalanan bisnis Anda dengan paket yang sesuai. Upgrade kapan saja seiring pertumbuhan jaringan Anda.' } },
                                        { id: 'marketing', label: 'Marketing Plan', fields: ['badge', 'title', 'highlight', 'description'], defaults: { badge: 'Marketing Plan', title: '6 Jenis', highlight: 'Bonus Menggiurkan', description: 'Sistem jaringan binary dengan 6 jalur bonus transparan yang mengalir setiap hari dan setiap bulan.' } },
                                        { id: 'career', label: 'Jalur Karir', fields: ['title', 'highlight', 'description'], defaults: { title: 'Jalur Karir', highlight: 'Global Sharing', description: 'Level karir naik otomatis saat Pairing Point pada kaki terkecil memenuhi syarat.' } },
                                        { id: 'steps', label: 'Langkah Bergabung', fields: ['badge', 'title', 'highlight', 'description'], defaults: { badge: 'Cara Bergabung', title: 'Mulai dalam', highlight: '4 Langkah', description: 'Proses bergabung yang mudah dan cepat. Dalam hitungan menit, akun Anda sudah aktif dan siap membangun jaringan.' } },
                                    ].map((section) => (
                                        <Card key={section.id} className="border shadow-sm rounded-xl overflow-hidden">
                                            <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                                                <CardTitle className="text-lg">Section: {section.label}</CardTitle>
                                                <CardDescription>Header dan deskripsi untuk bagian {section.label}.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {section.fields.includes('badge') && (
                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label htmlFor={`${section.id}_badge`}>Badge</Label>
                                                            <Input
                                                                id={`${section.id}_badge`}
                                                                placeholder={(section.defaults as any).badge}
                                                                value={(data as any)[`${section.id}_section_badge`] || ''}
                                                                onChange={(e) => setData(`${section.id}_section_badge` as any, e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`${section.id}_title`}>Judul</Label>
                                                        <Input
                                                            id={`${section.id}_title`}
                                                            placeholder={(section.defaults as any).title}
                                                            value={(data as any)[`${section.id}_section_title`] || ''}
                                                            onChange={(e) => setData(`${section.id}_section_title` as any, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`${section.id}_highlight`}>Highlight (Hijau)</Label>
                                                        <Input
                                                            id={`${section.id}_highlight`}
                                                            placeholder={(section.defaults as any).highlight}
                                                            value={(data as any)[`${section.id}_section_highlight`] || ''}
                                                            onChange={(e) => setData(`${section.id}_section_highlight` as any, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`${section.id}_description`}>Deskripsi</Label>
                                                    <Textarea
                                                        id={`${section.id}_description`}
                                                        rows={2}
                                                        placeholder={(section.defaults as any).description}
                                                        value={(data as any)[`${section.id}_section_description`] || ''}
                                                        onChange={(e) => setData(`${section.id}_section_description` as any, e.target.value)}
                                                    />
                                                </div>
                                                {section.id === 'marketing' && (
                                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                        <strong>Info:</strong> Konten rincian bonus (Bonus Sponsor, Pairing, dll) saat ini diatur sistem. Hubungi developer untuk perubahan rincian tersebut.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Footer Settings */}
                            <TabsContent value="footer" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Pengaturan Footer</CardTitle>
                                        <CardDescription>Informasi yang muncul di bagian kaki situs.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="footer_text">Teks Footer (Tentang Kami)</Label>
                                            <Textarea
                                                id="footer_text"
                                                rows={3}
                                                value={data.footer_text}
                                                onChange={(e) => setData('footer_text', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="copyright_text">Teks Hak Cipta</Label>
                                            <Input
                                                id="copyright_text"
                                                placeholder="© 2024 GrowRich. All rights reserved."
                                                value={data.copyright_text}
                                                onChange={(e) => setData('copyright_text', e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Email Settings */}
                            <TabsContent value="email" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Pengaturan Email</CardTitle>
                                        <CardDescription>Konfigurasi pengiriman email sistem.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email_sender">Email Pengirim (Sender)</Label>
                                            <Input
                                                id="email_sender"
                                                type="email"
                                                placeholder="noreply@example.com"
                                                value={data.email_sender}
                                                onChange={(e) => setData('email_sender', e.target.value)}
                                            />
                                            {errors.email_sender && <p className="text-sm text-destructive">{errors.email_sender}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email_token">Token Email</Label>
                                            <div className="relative">
                                                <Input
                                                    id="email_token"
                                                    type={showEmailToken ? 'text' : 'password'}
                                                    placeholder="Masukkan token layanan email"
                                                    value={data.email_token}
                                                    onChange={(e) => setData('email_token', e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmailToken(!showEmailToken)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showEmailToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            {errors.email_token && <p className="text-sm text-destructive">{errors.email_token}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Payment Settings */}
                            <TabsContent value="payment" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Gerbang Pembayaran Duitku</CardTitle>
                                        <CardDescription>Konfigurasi integrasi pembayaran otomatis menggunakan Duitku.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="duitku_merchant_code">Merchant Code</Label>
                                            <Input
                                                id="duitku_merchant_code"
                                                placeholder="Contoh: D1234"
                                                value={data.duitku_merchant_code}
                                                onChange={(e) => setData('duitku_merchant_code', e.target.value)}
                                            />
                                            {errors.duitku_merchant_code && <p className="text-sm text-destructive">{errors.duitku_merchant_code}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duitku_api_key">API Key</Label>
                                            <div className="relative">
                                                <Input
                                                    id="duitku_api_key"
                                                    type={showDuitkuApiKey ? 'text' : 'password'}
                                                    placeholder="Masukkan API Key Duitku"
                                                    value={data.duitku_api_key}
                                                    onChange={(e) => setData('duitku_api_key', e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDuitkuApiKey(!showDuitkuApiKey)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showDuitkuApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            {errors.duitku_api_key && <p className="text-sm text-destructive">{errors.duitku_api_key}</p>}
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="duitku_is_sandbox">Sandbox Mode</Label>
                                                <p className="text-sm text-muted-foreground">Aktifkan untuk testing (Environment Sandbox).</p>
                                            </div>
                                            <Switch
                                                id="duitku_is_sandbox"
                                                checked={data.duitku_is_sandbox}
                                                onCheckedChange={(checked) => setData('duitku_is_sandbox', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border shadow-sm rounded-xl overflow-hidden mt-6">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Truck className="size-5 text-blue-600" />
                                            Biteship (Ongkos Kirim)
                                        </CardTitle>
                                        <CardDescription>Konfigurasi integrasi cek ongkir menggunakan Biteship API.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="biteship_api_key">API Key Biteship</Label>
                                            <div className="relative">
                                                <Input
                                                    id="biteship_api_key"
                                                    type={showBiteshipApiKey ? 'text' : 'password'}
                                                    placeholder="biteship_live.xxxx atau biteship_test.xxxx"
                                                    value={data.biteship_api_key}
                                                    onChange={(e) => setData('biteship_api_key', e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowBiteshipApiKey(!showBiteshipApiKey)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showBiteshipApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Dapatkan API Key dari dashboard Biteship → Integrasi → Kunci API.</p>
                                            {errors.biteship_api_key && <p className="text-sm text-destructive">{errors.biteship_api_key}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="biteship_origin_postal_code">Kode Pos Asal Pengiriman</Label>
                                            <Input
                                                id="biteship_origin_postal_code"
                                                placeholder="Contoh: 40131"
                                                value={data.biteship_origin_postal_code}
                                                onChange={(e) => setData('biteship_origin_postal_code', e.target.value)}
                                                maxLength={10}
                                            />
                                            <p className="text-xs text-muted-foreground">Kode pos gudang/kantor asal pengiriman. Default: 40131 (Bandung, Coblong).</p>
                                            {errors.biteship_origin_postal_code && <p className="text-sm text-destructive">{errors.biteship_origin_postal_code}</p>}
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="biteship_dummy_mode">Dummy Mode</Label>
                                                <p className="text-xs text-muted-foreground">Aktifkan untuk menggunakan data dummy sementara (API Biteship belum aktif).</p>
                                            </div>
                                            <Switch
                                                id="biteship_dummy_mode"
                                                checked={data.biteship_dummy_mode}
                                                onCheckedChange={(checked) => setData('biteship_dummy_mode', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border shadow-sm rounded-xl overflow-hidden mt-6">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Transfer Bank Manual</CardTitle>
                                        <CardDescription>Informasi rekening bank untuk pembayaran metode transfer manual.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_name">Nama Bank</Label>
                                                <Input
                                                    id="bank_name"
                                                    placeholder="Contoh: Bank BCA"
                                                    value={data.bank_name}
                                                    onChange={(e) => setData('bank_name', e.target.value)}
                                                />
                                                {errors.bank_name && <p className="text-sm text-destructive">{errors.bank_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                                                <Input
                                                    id="bank_account_number"
                                                    placeholder="Contoh: 1234567890"
                                                    value={data.bank_account_number}
                                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                                />
                                                {errors.bank_account_number && <p className="text-sm text-destructive">{errors.bank_account_number}</p>}
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="bank_account_name">Atas Nama (Pemilik Rekening)</Label>
                                                <Input
                                                    id="bank_account_name"
                                                    placeholder="Contoh: PT GrowRich Indonesia"
                                                    value={data.bank_account_name}
                                                    onChange={(e) => setData('bank_account_name', e.target.value)}
                                                />
                                                {errors.bank_account_name && <p className="text-sm text-destructive">{errors.bank_account_name}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* reCAPTCHA Settings */}
                            <TabsContent value="recaptcha" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Google reCAPTCHA v3</CardTitle>
                                        <CardDescription>Konfigurasi keamanan Google reCAPTCHA v3 untuk form pendaftaran dan login.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nocaptcha_sitekey">Site Key</Label>
                                            <Input
                                                id="nocaptcha_sitekey"
                                                placeholder="Masukkan reCAPTCHA Site Key"
                                                value={data.nocaptcha_sitekey}
                                                onChange={(e) => setData('nocaptcha_sitekey', e.target.value)}
                                            />
                                            {errors.nocaptcha_sitekey && <p className="text-sm text-destructive">{errors.nocaptcha_sitekey}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nocaptcha_secret">Secret Key</Label>
                                            <div className="relative">
                                                <Input
                                                    id="nocaptcha_secret"
                                                    type={showNocaptchaSecret ? 'text' : 'password'}
                                                    placeholder="Masukkan reCAPTCHA Secret Key"
                                                    value={data.nocaptcha_secret}
                                                    onChange={(e) => setData('nocaptcha_secret', e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNocaptchaSecret(!showNocaptchaSecret)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showNocaptchaSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            {errors.nocaptcha_secret && <p className="text-sm text-destructive">{errors.nocaptcha_secret}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="stockist" className="mt-0 focus-visible:outline-none">
                                <Card className="border shadow-sm rounded-xl overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 py-4 px-6 font-semibold">
                                        <CardTitle className="text-lg">Pengaturan Stokis & Diskon Volume</CardTitle>
                                        <CardDescription>Atur minimal order stokis dan persentase diskon harga PIN.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="stockist_min_order">Minimal Order Stokis (jumlah PIN)</Label>
                                            <Input
                                                id="stockist_min_order"
                                                type="number"
                                                min={1}
                                                max={999}
                                                placeholder="10"
                                                value={data.stockist_min_order}
                                                onChange={(e) => setData('stockist_min_order', parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground">Stokis wajib memesan minimal sejumlah PIN ini setiap kali order.</p>
                                            {errors.stockist_min_order && <p className="text-sm text-destructive">{errors.stockist_min_order}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stockist_discount_percent">Diskon Harga Stokis (%)</Label>
                                            <Input
                                                id="stockist_discount_percent"
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="0"
                                                value={data.stockist_discount_percent}
                                                onChange={(e) => setData('stockist_discount_percent', parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground">Diskon khusus untuk member berstatus stokis (berlaku untuk semua order stokis).</p>
                                            {errors.stockist_discount_percent && <p className="text-sm text-destructive">{errors.stockist_discount_percent}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="volume_discount_5_percent">Diskon Volume (order ≥ 5 PIN, %)</Label>
                                            <Input
                                                id="volume_discount_5_percent"
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="0"
                                                value={data.volume_discount_5_percent}
                                                onChange={(e) => setData('volume_discount_5_percent', parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground">Diskon otomatis untuk member non-stokis yang memesan 5–9 PIN sekaligus.</p>
                                            {errors.volume_discount_5_percent && <p className="text-sm text-destructive">{errors.volume_discount_5_percent}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="volume_discount_10_percent">Diskon Volume (order ≥ 10 PIN, %)</Label>
                                            <Input
                                                id="volume_discount_10_percent"
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="0"
                                                value={data.volume_discount_10_percent}
                                                onChange={(e) => setData('volume_discount_10_percent', parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground">Diskon otomatis untuk member non-stokis yang memesan 10 PIN atau lebih sekaligus.</p>
                                            {errors.volume_discount_10_percent && <p className="text-sm text-destructive">{errors.volume_discount_10_percent}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* TabsContent Bonus disembunyikan */}
                        </div>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}
