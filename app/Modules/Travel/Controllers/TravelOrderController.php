<?php

namespace App\Modules\Travel\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TravelOrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Modules/Travel/Index');
    }
}
