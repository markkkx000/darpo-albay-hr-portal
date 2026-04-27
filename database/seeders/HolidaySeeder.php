<?php

namespace Database\Seeders;

use App\Modules\Leave\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            ['date' => '2025-01-01', 'name' => 'New Year\'s Day'],
            ['date' => '2025-01-27', 'name' => 'Lailatul Isra'],
            ['date' => '2025-02-25', 'name' => 'People Power Anniversary'],
            ['date' => '2025-04-01', 'name' => 'Eidul Fitar'],
            ['date' => '2025-04-09', 'name' => 'The Day of Valor'],
            ['date' => '2025-04-17', 'name' => 'Maundy Thursday'],
            ['date' => '2025-04-18', 'name' => 'Good Friday'],
            ['date' => '2025-04-19', 'name' => 'Black Saturday'],
            ['date' => '2025-04-20', 'name' => 'Easter Sunday'],
            ['date' => '2025-05-01', 'name' => 'Labor Day'],
            ['date' => '2025-05-12', 'name' => 'National and Local Election'],
            ['date' => '2025-06-06', 'name' => 'Eid Al Adha'],
            ['date' => '2025-06-12', 'name' => 'Independence Day'],
            ['date' => '2025-07-27', 'name' => 'INC Anniversary'],
            ['date' => '2025-08-21', 'name' => 'Ninoy Aquino Day'],
            ['date' => '2025-08-25', 'name' => 'National Heroes Day'],
            ['date' => '2025-10-31', 'name' => 'Special Non Working Day'],
            ['date' => '2025-11-01', 'name' => 'All Saints\' Day'],
            ['date' => '2025-11-02', 'name' => 'All Souls\' Day'],
            ['date' => '2025-11-30', 'name' => 'Bonifacio Day'],
            ['date' => '2025-12-08', 'name' => 'Feast of the Immaculate Concepcion'],
            ['date' => '2025-12-24', 'name' => 'Christmas Eve'],
            ['date' => '2025-12-25', 'name' => 'Christmas Day'],
            ['date' => '2025-12-30', 'name' => 'Rizal Day'],
            ['date' => '2025-12-31', 'name' => 'New Year\'s Eve'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(
                ['date' => $holiday['date']],
                ['name' => $holiday['name']]
            );
        }
    }
}
