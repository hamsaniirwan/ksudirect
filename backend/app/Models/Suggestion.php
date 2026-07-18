<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'division_id', // <-- Tambah ini
        'reference_no', 
        'category', 
        'title', 
        'description', 
        'attachment', 
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // <-- TAMBAH HUBUNGAN INI SUPAYA LARAVEL BOLEH BACA
    public function division() 
    {
        return $this->belongsTo(Division::class);
    }
}