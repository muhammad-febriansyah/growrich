<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Penarikan Dana Disetujui</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#237A13;padding:40px 48px;text-align:center;">
                            <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">GrowRich</p>
                            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Platform Investasi &amp; Jaringan Bisnis</p>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:48px 48px 32px;">

                            <p style="margin:0 0 8px;font-size:13px;color:#237A13;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Penarikan Disetujui</p>
                            <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#111827;line-height:1.3;">
                                Penarikan Dana Anda Telah Disetujui
                            </h1>

                            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
                                Halo {{ $user->name }}, permintaan penarikan dana Anda telah disetujui oleh admin. Dana akan segera ditransfer ke rekening yang Anda daftarkan.
                            </p>

                            {{-- Info Box --}}
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#f0faf0;border-left:4px solid #237A13;border-radius:4px;margin-bottom:32px;">
                                <tr>
                                    <td style="padding:20px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding:6px 0;">
                                                    <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:2px;">Jumlah Transfer</span>
                                                    <span style="font-size:15px;color:#237A13;font-weight:700;">Rp {{ number_format($withdrawal->amount, 0, ',', '.') }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;border-top:1px solid #d1fae5;">
                                                    <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:2px;">Bank Tujuan</span>
                                                    <span style="font-size:15px;color:#111827;font-weight:600;">{{ $withdrawal->bank_name }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;border-top:1px solid #d1fae5;">
                                                    <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:2px;">Nomor Rekening</span>
                                                    <span style="font-size:15px;color:#111827;font-weight:600;">{{ $withdrawal->account_number }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;border-top:1px solid #d1fae5;">
                                                    <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:2px;">Atas Nama</span>
                                                    <span style="font-size:15px;color:#111827;font-weight:600;">{{ $withdrawal->account_name }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;border-top:1px solid #d1fae5;">
                                                    <span style="font-size:13px;color:#6b7280;display:block;margin-bottom:2px;">Status</span>
                                                    <span style="font-size:15px;color:#237A13;font-weight:600;">Disetujui</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 32px;font-size:15px;color:#4b5563;line-height:1.7;">
                                Proses transfer biasanya membutuhkan 1-3 hari kerja tergantung kebijakan bank tujuan. Jika dalam 3 hari kerja dana belum masuk, segera hubungi tim kami.
                            </p>

                            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                                <tr>
                                    <td style="background-color:#237A13;border-radius:6px;">
                                        <a href="{{ route('member.wallet.index') }}"
                                            style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                                            Lihat Riwayat Penarikan
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 48px;">
                            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 48px 32px;text-align:center;">
                            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
                            <p style="margin:0;font-size:13px;color:#9ca3af;">&copy; {{ date('Y') }} GrowRich. Seluruh hak cipta dilindungi.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
