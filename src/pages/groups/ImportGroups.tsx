import GroupSelector from "./GroupSelector";

type User = {
  user_id: number;
  name: string;
};

type Group = {
  group_id: number;
  group_name: string;
  description: string;
  users: User[];
};

const sampleData: Group[] = [
  {
    group_id: 1,
    group_name: "Group A",
    description: "This is Group A",
    users: [
      { user_id: 101, name: "Alice" },
      { user_id: 102, name: "Bob" },
    ],
  },
  {
    group_id: 2,
    group_name: "Group B",
    description: "This is Group B",
    users: [
      { user_id: 103, name: "Charlie" },
      { user_id: 104, name: "David" },
    ],
  },
  {
    group_id: 3,
    group_name: "Group C",
    description: "This is Group C",
    users: [
      { user_id: 105, name: "Eve" },
      { user_id: 106, name: "Frank" },
    ],
  },
  {
    group_id: 4,
    group_name: "Group D",
    description: "This is Group D",
    users: [
      { user_id: 107, name: "Grace" },
      { user_id: 108, name: "Hank" },
    ],
  },
  {
    group_id: 5,
    group_name: "Group E",
    description: "This is Group E",
    users: [
      { user_id: 109, name: "Ivy" },
      { user_id: 110, name: "Jack" },
    ],
  },
  {
    group_id: 6,
    group_name: "Group F",
    description: "This is Group F",
    users: [
      { user_id: 111, name: "Kate" },
      { user_id: 112, name: "Leo" },
    ],
  },
  {
    group_id: 7,
    group_name: "Group G",
    description: "This is Group G",
    users: [
      { user_id: 113, name: "Mia" },
      { user_id: 114, name: "Nate" },
    ],
  },
];

const ImportGroups: React.FC = () => {
  const handleImport = (
    selectedGroups: { group: Group; includeUsers: boolean }[]
  ) => {
    console.log("Imported Groups:", selectedGroups);
  };

  return <GroupSelector data={sampleData} onImport={handleImport} />;
};

export default ImportGroups;
