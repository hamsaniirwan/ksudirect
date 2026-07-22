<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->nullable(); // Asalnya 'diskripsi'
            $table->string('email', 150)->nullable();
            $table->tinyInteger('is_deleted')->default(0)->nullable();
            $table->integer('id_pencipta')->nullable();
            $table->integer('pengguna')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('divisions');
    }
};