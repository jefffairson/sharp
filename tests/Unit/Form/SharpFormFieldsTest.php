<?php

namespace Code16\Sharp\Tests\Unit\Form;

use Code16\Sharp\Form\Fields\SharpFormTextField;
use Code16\Sharp\Form\SharpForm;
use Code16\Sharp\Tests\SharpTestCase;

class SharpFormFieldsTest extends SharpTestCase
{

    /** @test */
    function we_can_add_a_field()
    {
        $form = new class extends FormFieldsTestForm {
            function buildFormFields()
            {
                $this->addField(SharpFormTextField::make("name"));
                $this->addField(SharpFormTextField::make("first_name"));
            }
        };

        $this->assertCount(2, $form->fields());
    }

    /** @test */
    function we_can_see_fields_as_array()
    {
        $form = new class extends FormFieldsTestForm {
            function buildFormFields()
            {
                $this->addField(SharpFormTextField::make("name"));
                $this->addField(SharpFormTextField::make("first_name"));
            }
        };

        $this->assertArraySubset(
            ["key" => "name", "type" => "text"],
            $form->fields()[0]
        );
        $this->assertArraySubset(
            ["key" => "first_name", "type" => "text"],
            $form->fields()[1]
        );
    }
}

abstract class FormFieldsTestForm extends SharpForm
{
    function find($id): array { return []; }
    function update($id, array $data): bool { return false; }
    function store(array $data): bool { return false; }
    function delete($id): bool { return false; }
    function buildFormLayout() {}
}