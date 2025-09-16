<?php

declare(strict_types=1);

use PhpCsFixer\Runner\Parallel\ParallelConfigFactory;

$finder = (new PhpCsFixer\Finder())
    ->in(['src'])
;

return (new PhpCsFixer\Config())
    ->setParallelConfig(ParallelConfigFactory::detect())
    ->setRules([
        '@Symfony' => true,
        '@Symfony:risky' => true,
        '@PhpCsFixer:risky' => true,
        'single_line_throw' => false,
        'native_function_invocation' => false,
        'global_namespace_import' => [
            'import_classes' => true,
            'import_constants' => true,
            'import_functions' => true,
        ],
        'ordered_imports' => false,
        'declare_strict_types' => true,
        'no_useless_else' => true,
        'multiline_whitespace_before_semicolons' => [
            'strategy' => 'new_line_for_chained_calls',
        ],
        'method_chaining_indentation' => true,
        'list_syntax' => true,
        'date_time_immutable' => true,
        'combine_consecutive_issets' => true,
        'class_keyword' => true,
        'assign_null_coalescing_to_coalesce_equal' => true,
        'attribute_empty_parentheses' => true,
        'void_return' => true,
        'use_arrow_functions' => true,
        'simplified_if_return' => true,
        'self_static_accessor' => true,
        'return_assignment' => true,
        'protected_to_private' => true,
        'phpdoc_var_annotation_correct_order' => true,
        'phpdoc_to_return_type' => true,
        'phpdoc_to_param_type' => true,
        'phpdoc_to_property_type' => true,
        'phpdoc_tag_casing' => true,
        'phpdoc_align' => [
            'align' => 'left',
        ],
        'php_unit_mock' => true,
        'php_unit_no_expectation_annotation' => true,
    ])
    ->setRiskyAllowed(true)
    ->setFinder($finder)
;
