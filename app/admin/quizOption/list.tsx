import { Datagrid, List, TextField, ReferenceField, BooleanField } from "react-admin";

export const QuizOptionList = () => {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="text" />
        <BooleanField source="correct" />
        <ReferenceField source="challengeId" reference="challenges">
          <TextField source="label" />
        </ReferenceField>
        <TextField source="imageSrc" label="image" />
        <TextField source="audioSrc" />
      </Datagrid>
    </List>
  );
};
