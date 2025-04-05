import {
  SimpleForm,
  TextInput,
  required,
  ReferenceInput,
  SelectInput,
  BooleanInput,
  Edit,
} from "react-admin";

export const QuizOptionEdit = () => {
  return (
    <Edit>
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
        <TextInput source="imageSrc" label="Enter Image URL" />

        <TextInput source="audioSrc" label="Enter Audio URL" />

      </SimpleForm>
    </Edit>
  );
};
