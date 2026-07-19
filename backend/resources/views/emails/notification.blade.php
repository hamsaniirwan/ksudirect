<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f4; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .content { padding: 30px 20px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #003B73; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin-top: 25px; font-weight: bold; }
        .footer-text { margin-top: 20px; padding: 20px; font-size: 12px; text-align: center; color: #777; background-color: #f9f9f9; border-top: 1px solid #eee; }
        img { max-width: 100%; height: auto; display: block; border: 0; }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- BAHAGIAN GAMBAR HEADER -->
        <div>
            <img src="{{ $message->embed(public_path('images/templates/email_header.png')) }}" alt="KSU Direct Header">
        </div>

        <!-- BAHAGIAN KANDUNGAN TEKS -->
        <div class="content">
            <p>{{ $bodyText }}</p>
            
            @if($actionUrl)
                <div style="text-align: center;">
                    <a href="{{ $actionUrl }}" class="btn">Klik Di Sini Untuk Tindakan Lanjut</a>
                </div>
            @endif
        </div>

        <!-- BAHAGIAN GAMBAR FOOTER -->
        <div>
            <img src="{{ $message->embed(public_path('images/templates/email_footer.png')) }}" alt="KSU Direct Footer">
        </div>

        <!-- NOTA KAKI SISTEM -->
        <div class="footer-text">
            <p>E-mel ini dijana secara automatik oleh Sistem KSU Direct, Kementerian Pengangkutan Malaysia. Sila jangan balas e-mel ini.</p>
        </div>
        
    </div>
</body>
</html>