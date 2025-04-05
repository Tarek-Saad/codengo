import {
  SimpleForm,
  Create,
  TextInput,
  required,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";

export const ChallengeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="label" validate={[required()]} label="Label" />

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
    </Create>
  );
};
