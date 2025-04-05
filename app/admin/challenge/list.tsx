import { Datagrid, List, TextField, ReferenceField, NumberField, SelectField } from "react-admin";

export const ChallengeList = () => {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="label" />
        
        <SelectField
          source="type"
          choices={[
            { id: 'SELECT', name: 'Select' },
            // { id: 'VIDEO', name: 'Video' },
            // { id: 'CODE', name: 'code' },
            // { id: 'TEXT', name: 'text' }
          ]}
          label="Type"
        />
        
        <ReferenceField source="lessonId" reference="lessons">
          <TextField source="title" />
        </ReferenceField>
        
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};
