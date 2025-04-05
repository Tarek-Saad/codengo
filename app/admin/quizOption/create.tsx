import {
  SimpleForm,
  Create,
  TextInput,
  required,
  ReferenceInput,
  SelectInput,
  BooleanInput,
} from "react-admin";

export const QuizOptionCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" validate={[required()]} label="Text" />
        <BooleanInput source="correct" label="Correct option" />
        <ReferenceInput
          source="challengeId"
          reference="challenges"
          label="challenge"
        >
          <SelectInput optionText="label" validate={[required()]} />
        </ReferenceInput>
        <TextInput source="imageSource" label="Enter Image URL" />

        <TextInput source="audioSource" label="Enter Audio URL" />

      </SimpleForm>
    </Create>
  );
};
