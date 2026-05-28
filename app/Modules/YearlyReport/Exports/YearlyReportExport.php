<?php

namespace App\Modules\YearlyReport\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class YearlyReportExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    protected $results;

    protected $year;

    public function __construct(array $results, $year)
    {
        $this->results = $results;
        $this->year = $year;
    }

    public function array(): array
    {
        $data = [];
        foreach ($this->results as $row) {
            $typeText = $row['type'] === 'salary' ? 'Salary Update' : 'Loyalty Award';
            $milestoneText = $row['type'] === 'salary'
                ? "{$row['milestone']}-year Salary Adjustment"
                : "{$row['milestone']}-year Loyalty Award";

            $data[] = [
                $row['date'],
                $row['name'],
                $row['employee_number'] ?: '—',
                $row['division'],
                $milestoneText,
                $typeText,
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Employee Name',
            'ID Number',
            'Division',
            'Milestone',
            'Type',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
