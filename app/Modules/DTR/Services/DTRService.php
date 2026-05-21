<?php

namespace App\Modules\DTR\Services;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Leave\Models\Holiday;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DTRService
{
    /**
     * Get attendance records for a specific user, month, and year.
     *
     * @return Collection<int, Attendance>
     */
    public function getAttendanceForExport(int $userId, int $month, int $year): Collection
    {
        return Attendance::where('user_id', $userId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get();
    }

    /**
     * Generate the structured daily DTR data for a given month and year.
     *
     * @param  Collection<int, Attendance>  $attendance
     * @return array<int, array{day: int, date: string, am_in: ?string, am_out: ?string, pm_in: ?string, pm_out: ?string}>
     */
    public function generateDailyData(Collection $attendance, int $month, int $year, string $officialHours = '08:00 AM - 05:00 PM'): array
    {
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        $dailyData = [];

        $isCompressed = str_contains(strtolower($officialHours), 'compressed') || str_contains(strtolower($officialHours), 'mon-thu');

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromDate($year, $month, $day);
            $dateString = $date->toDateString();
            $record = $attendance->firstWhere('date', $dateString);

            $amIn = null;
            $amOut = null;
            $pmIn = null;
            $pmOut = null;

            if ($record) {
                $amIn = $record->am_clock_in ? $record->am_clock_in->format('h:i A') : null;
                $amOut = $record->am_clock_out ? $record->am_clock_out->format('h:i A') : null;
                $pmIn = $record->pm_clock_in ? $record->pm_clock_in->format('h:i A') : null;
                $pmOut = $record->pm_clock_out ? $record->pm_clock_out->format('h:i A') : null;
            } else {
                $isHoliday = Holiday::whereDate('date', $dateString)->exists();

                if ($isHoliday) {
                    $amIn = 'HOLIDAY';
                } elseif ($date->dayOfWeek === Carbon::SATURDAY) {
                    $amIn = 'SATURDAY';
                } elseif ($date->dayOfWeek === Carbon::SUNDAY) {
                    $amIn = 'SUNDAY';
                } elseif ($isCompressed && $date->dayOfWeek === Carbon::FRIDAY) {
                    $amIn = 'FRIDAY';
                }
            }

            $dailyData[] = [
                'day' => $day,
                'date' => $date->format('m/d/Y'),
                'am_in' => $amIn,
                'am_out' => $amOut,
                'pm_in' => $pmIn,
                'pm_out' => $pmOut,
            ];
        }

        return $dailyData;
    }

    /**
     * Generate the CS Form 48 PDF for a user.
     *
     * @param  Collection<int, Attendance>  $attendance
     */
    public function generatePdf(User $user, Collection $attendance, int $month, int $year, string $officialHours = '08:00 AM - 05:00 PM'): Response
    {
        $dailyData = $this->generateDailyData($attendance, $month, $year, $officialHours);
        $period = Carbon::createFromDate($year, $month, 1)->format('F Y');

        $pdf = Pdf::loadView('exports.dtr_pdf', [
            'user' => $user,
            'dailyData' => $dailyData,
            'period' => $period,
            'official_hours' => $officialHours,
        ]);

        $pdf->setPaper('letter', 'portrait');

        return new Response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="DTR_'.$user->employee_number.'_'.$year.'_'.$month.'.pdf"',
        ]);
    }

    /**
     * Generate a CSV export for a user's DTR.
     *
     * @param  Collection<int, Attendance>  $attendance
     */
    public function generateCsv(User $user, Collection $attendance, int $month, int $year, string $officialHours = '08:00 AM - 05:00 PM'): StreamedResponse
    {
        $dailyData = $this->generateDailyData($attendance, $month, $year, $officialHours);
        $filename = "DTR_{$user->employee_number}_{$year}_{$month}.csv";

        return new StreamedResponse(function () use ($user, $dailyData, $month, $year, $officialHours) {
            $handle = fopen('php://output', 'w');
            if (! $handle) {
                return;
            }

            $period = Carbon::createFromDate($year, $month, 1)->format('F Y');

            fputcsv($handle, ['Daily Time Record (CS Form 48)']);
            fputcsv($handle, ['Employee Name:', $user->name]);
            fputcsv($handle, ['Employee Number:', $user->employee_number]);
            fputcsv($handle, ['Period:', $period]);
            fputcsv($handle, ['Official Hours:', $officialHours]);
            fputcsv($handle, []);

            fputcsv($handle, ['Day', 'Date', 'AM Arrival', 'AM Departure', 'PM Arrival', 'PM Departure']);

            foreach ($dailyData as $row) {
                fputcsv($handle, [
                    $row['day'],
                    $row['date'],
                    $row['am_in'] ?? '-',
                    $row['am_out'] ?? '-',
                    $row['pm_in'] ?? '-',
                    $row['pm_out'] ?? '-',
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
