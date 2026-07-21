<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditTrail extends Model
{
    use HasFactory;

    // TAMBAH INI: Benarkan Laravel mengisi lajur-lajur ini
    protected $fillable = [
        'suggestion_id',
        'user_id',
        'action',
        'old_status',
        'new_status',
        'remarks',
    ];

    // Hubungan (Relationship) kembali kepada Suggestion
    public function suggestion()
    {
        return $this->belongsTo(Suggestion::class);
    }

    // Hubungan (Relationship) kepada User yang membuat tindakan
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}