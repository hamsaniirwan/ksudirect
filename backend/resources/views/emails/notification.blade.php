<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #003B73; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #003B73; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>KSU Direct</h2>
        </div>
        <div class="content">
            <p>{{ $bodyText }}</p>
            
            @if($actionUrl)
                <div style="text-align: center;">
                    <a href="{{ $actionUrl }}" class="btn">Klik Di Sini Untuk Tindakan Lanjut</a>
                </div>
            @endif
        </div>
        <div class="footer">
            <p>E-mel ini dijana secara automatik oleh Sistem KSU Direct, Kementerian Pengangkutan Malaysia. Sila jangan balas e-mel ini.</p>
        </div>
    </div>
</body>
</html>