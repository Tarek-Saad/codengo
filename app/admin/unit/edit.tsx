import {
  SimpleForm,
  TextInput,
  required,
  Edit,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

export const UnitEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={[required()]} label="Id" />
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput
          source="description"
          validate={[required()]}
          label="Description"
        />

                <ReferenceInput
                  source="courseId"
                  reference="courses"
                  label="Course"
                >
                  <SelectInput optionText="title" validate={[required()]} />
                </ReferenceInput>

        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Edit>
  );
};
