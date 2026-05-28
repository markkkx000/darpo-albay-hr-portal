<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Document Requests',
        'href' => '/documentrequests',
        'icon' => 'Files',
        'permission' => 'document_requests.view',
    ]);
};
