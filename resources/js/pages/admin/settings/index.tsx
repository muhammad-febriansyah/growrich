import { Head, useForm } from '@inertiajs/react';
import { Save, Globe, Phone, Share2, Search, Layout, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface SiteSettingsData {
    id: number;
    site_name: string | null;
    site_tagline: string | null;
    site_description: string | null;
    logo_url: string | null;
    favicon_url: string | null;
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
    });

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
                                value="footer"
                                className="px-4 py-3 border-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-slate-600 hover:bg-slate-100 transition-all rounded-lg font-semibold"
                            >
                                <Layout className="size-4 mr-3" /> Footer
                            </TabsTrigger>
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
                        </div>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}
