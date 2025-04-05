import {
  SimpleForm,
  TextInput,
  required,
  Edit,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

export const ChallengeEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="id" validate={[required()]} label="Id" />
        <TextInput source="label" validate={[required()]} label="Question" />

        <SelectInput
          source="type"
          choices={[
            {
              id: "SELECT",
              name: "SELECT",
            },
            // {
            //   id: "ASSIST",
            //   name: "ASSIST",
            // },
          ]}
        />
        <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
          <SelectInput optionText="title" validate={[required()]} />
        </ReferenceInput>

        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Edit>
  );
};
