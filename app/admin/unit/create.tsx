import {
  SimpleForm,
  Create,
  TextInput,
  required,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

export const UnitCreate = () => {
  return (
    <Create>
      <SimpleForm>
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
    </Create>
  );
};
