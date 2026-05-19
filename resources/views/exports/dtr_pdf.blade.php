<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CS Form 48 - Daily Time Record</title>
    <style>
        @page {
            margin: 72px 60px 60px 60px;
            size: letter portrait;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #000;
            margin: 0;
            padding: 0;
            line-height: 1.2;
        }
        .main-container {
            width: 100%;
            border-collapse: collapse;
        }
        .main-container > tbody > tr > td {
            vertical-align: top;
            padding: 0;
        }
        .dtr-column {
            width: 42.6%;
            position: relative;
        }
        .spacer-column {
            width: 11%;
        }

        /* DTR Content Styling */
        .form-no {
            font-size: 10px;
            font-style: italic;
            margin-bottom: 8px;
        }
        .title {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .subtitle {
            text-align: center;
            font-size: 10px;
            margin-bottom: 8px;
        }

        /* Name Section */
        .name-line {
            border-bottom: 1px solid #000;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            padding-bottom: 2px;
            margin-top: 6px;
            height: 14px;
        }
        .name-label {
            text-align: center;
            font-size: 10px;
            margin-top: 2px;
            margin-bottom: 8px;
        }

        /* Info Tables */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3px;
            font-size: 10px;
            font-style: italic;
        }
        .info-table td {
            padding: 1px 0;
            vertical-align: middle;
        }
        .line-bottom {
            border-bottom: 1px solid #000;
            font-weight: bold;
            text-align: left;
            padding-left: 5px;
        }

        /* DTR Grid Table */
        .dtr-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .dtr-table th, .dtr-table td {
            border: 1px solid #000;
            padding: 1px 1px;
            text-align: center;
            font-size: 8.5px;
            height: 11px;
        }
        .dtr-table th {
            font-weight: bold;
            background-color: #fff;
        }
        .dtr-table td.day-col {
            font-weight: bold;
        }
        .dtr-table th.header-bottom {
            border-bottom: 2px solid #000;
        }
        .dtr-table th.section-end, .dtr-table td.section-end {
            border-right: 2px solid #000;
        }

        /* Certification */
        .cert-text {
            font-size: 9px;
            font-style: italic;
            text-align: justify;
            margin: 20px 16px 36px 8px;
            line-height: 1.2;
        }

        /* Verification & Signatures */
        .verify-text {
            font-size: 9px;
            font-style: italic;
            margin: 8px 8px 36px 8px;
        }
        .sig-box {
            text-align: center;
            margin-bottom: 10px;
        }
        .sig-line {
            border-bottom: 2px solid #000;
            width: 100%;
            margin-bottom: 3px;
        }
        .sig-label {
            font-size: 9px;
            font-style: italic;
        }
        .instruction-text {
            text-align: center;
            font-size: 8.5px;
            margin-bottom: 15px;
        }

        /* Footer */
        .doc-footer {
            text-align: right;
            font-size: 9px;
            font-weight: bold;
            padding-right: 15px;
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100%;
            box-sizing: border-box;
        }
    </style>
</head>
<body>

    <table class="main-container">
        <tbody>
            <tr>
                <!-- LEFT COLUMN -->
                <td class="dtr-column">
                    <div class="form-no">Civil Service Form No. 48</div>
                    <div class="title">DAILY TIME RECORD</div>
                    <div class="subtitle">-----o0o-----</div>

                    <div class="name-line">{{ $user->name }}</div>
                    <div class="name-label">(Name)</div>

                    <table class="info-table" style="margin-left: 10px;">
                        <tr>
                            <td width="28%">For the month of</td>
                            <td width="72%" class="line-bottom">{{ $period }}</td>
                        </tr>
                    </table>

                    <table class="info-table" style="margin-bottom: 10px;">
                        <tr>
                            <td width="42%" rowspan="2" style="text-align: center; padding-right: 5px;">Official hours for arrival<br>and departure</td>
                            <td width="23%" style="text-align: right; padding-right: 5px;">Regular days</td>
                            <td width="35%" class="line-bottom">{{ $official_hours ?? '08:00 AM - 05:00 PM' }}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; padding-right: 5px;">Saturdays</td>
                            <td class="line-bottom"></td>
                        </tr>
                    </table>

                    <table class="dtr-table">
                        <thead>
                            <tr>
                                <th rowspan="2" width="10%" class="section-end header-bottom">Day</th>
                                <th colspan="2" class="section-end">A.M.</th>
                                <th colspan="2" class="section-end">P.M.</th>
                                <th colspan="2">Undertime</th>
                            </tr>
                            <tr>
                                <th width="18%" class="header-bottom">Arrival</th>
                                <th width="18%" class="section-end header-bottom">Depar-<br>ture</th>
                                <th width="18%" class="header-bottom">Arrival</th>
                                <th width="18%" class="section-end header-bottom">Depar-<br>ture</th>
                                <th width="9%" class="header-bottom">Hours</th>
                                <th width="9%" class="header-bottom">Min-<br>utes</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for ($day = 1; $day <= 31; $day++)
                                @php
                                    $row = collect($dailyData)->firstWhere('day', $day);
                                @endphp
                                <tr>
                                    <td class="day-col section-end">{{ $day }}</td>
                                    <td>{{ $row['am_in'] ?? '' }}</td>
                                    <td class="section-end">{{ $row['am_out'] ?? '' }}</td>
                                    <td>{{ $row['pm_in'] ?? '' }}</td>
                                    <td class="section-end">{{ $row['pm_out'] ?? '' }}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            @endfor
                            <tr>
                                <td colspan="5" class="section-end" style="text-align: right; font-weight: bold; padding-right: 15px;">Total</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="cert-text">
                        I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.
                    </div>

                    <div class="sig-box" style="margin-bottom: 15px;">
                        <div class="sig-line"></div>
                    </div>

                    <div class="verify-text">
                        VERIFIED as to the prescribed office hours:
                    </div>

                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-label">In Charge</div>
                    </div>

                    <div class="instruction-text">
                        (SEE INSTRUCTION ON BACK)
                    </div>

                    <div class="doc-footer">
                        HRDD-EXT-008 rev0
                    </div>
                </td>

                <!-- SPACER -->
                <td class="spacer-column"></td>

                <!-- RIGHT COLUMN -->
                <td class="dtr-column">
                    <div class="form-no">Civil Service Form No. 48</div>
                    <div class="title">DAILY TIME RECORD</div>
                    <div class="subtitle">-----o0o-----</div>

                    <div class="name-line">{{ $user->name }}</div>
                    <div class="name-label">(Name)</div>

                    <table class="info-table" style="margin-left: 10px;">
                        <tr>
                            <td width="28%">For the month of</td>
                            <td width="72%" class="line-bottom">{{ $period }}</td>
                        </tr>
                    </table>

                    <table class="info-table" style="margin-bottom: 10px;">
                        <tr>
                            <td width="42%" rowspan="2" style="text-align: center; padding-right: 5px;">Official hours for arrival<br>and departure</td>
                            <td width="23%" style="text-align: right; padding-right: 5px;">Regular days</td>
                            <td width="35%" class="line-bottom">{{ $official_hours ?? '08:00 AM - 05:00 PM' }}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; padding-right: 5px;">Saturdays</td>
                            <td class="line-bottom"></td>
                        </tr>
                    </table>

                    <table class="dtr-table">
                        <thead>
                            <tr>
                                <th rowspan="2" width="10%" class="section-end header-bottom">Day</th>
                                <th colspan="2" class="section-end">A.M.</th>
                                <th colspan="2" class="section-end">P.M.</th>
                                <th colspan="2">Undertime</th>
                            </tr>
                            <tr>
                                <th width="18%" class="header-bottom">Arrival</th>
                                <th width="18%" class="section-end header-bottom">Depar-<br>ture</th>
                                <th width="18%" class="header-bottom">Arrival</th>
                                <th width="18%" class="section-end header-bottom">Depar-<br>ture</th>
                                <th width="9%" class="header-bottom">Hours</th>
                                <th width="9%" class="header-bottom">Min-<br>utes</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for ($day = 1; $day <= 31; $day++)
                                @php
                                    $row = collect($dailyData)->firstWhere('day', $day);
                                @endphp
                                <tr>
                                    <td class="day-col section-end">{{ $day }}</td>
                                    <td>{{ $row['am_in'] ?? '' }}</td>
                                    <td class="section-end">{{ $row['am_out'] ?? '' }}</td>
                                    <td>{{ $row['pm_in'] ?? '' }}</td>
                                    <td class="section-end">{{ $row['pm_out'] ?? '' }}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            @endfor
                            <tr>
                                <td colspan="5" class="section-end" style="text-align: right; font-weight: bold; padding-right: 15px;">Total</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="cert-text">
                        I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.
                    </div>

                    <div class="sig-box" style="margin-bottom: 15px;">
                        <div class="sig-line"></div>
                    </div>

                    <div class="verify-text">
                        VERIFIED as to the prescribed office hours:
                    </div>

                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-label">In Charge</div>
                    </div>

                    <div class="instruction-text">
                        (SEE INSTRUCTION ON BACK)
                    </div>

                    <div class="doc-footer">
                        HRDD-EXT-008 rev0
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

</body>
</html>
