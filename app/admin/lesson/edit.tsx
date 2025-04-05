import {
  SimpleForm,
  TextInput,
  required,
  Edit,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

export const LessonEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={[required()]} label="Id" />
        <TextInput source="title" validate={[required()]} label="Title" />

                <ReferenceInput
                  source="unitId"
                  reference="units"
                  label="Unit"
                >
                  <SelectInput optionText="title" validate={[required()]} />
                </ReferenceInput>


        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Edit>
  );
};
