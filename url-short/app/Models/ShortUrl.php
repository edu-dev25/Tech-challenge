<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShortUrl extends Model
{
    protected $table = 'short_urls';

    /**
     * Nota de seguridad (SQLi):
     * Usar Eloquent/Query Builder con datos validados evita SQL injection
     * porque Laravel hace binding de parámetros (no concatenación de strings).
     */
    protected $fillable = [
        'code',
        'original_url',
    ];
}

