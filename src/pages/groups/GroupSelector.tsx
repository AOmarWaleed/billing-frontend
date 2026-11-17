import { Button } from "@mui/material";
import React, { useState } from "react";

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

type Props = {
  data: Group[]; // JSON data passed as a prop
  onImport: (selectedGroups: { group: Group; includeUsers: boolean }[]) => void; // Callback for importing
};

const GroupSelector: React.FC<Props> = ({ data, onImport }) => {
  const [selectedGroups, setSelectedGroups] = useState<
    { group: Group; includeUsers: boolean }[]
  >([]);

  const handleGroupSelection = (group: Group, includeUsers: boolean) => {
    setSelectedGroups((prev) => {
      const groupIndex = prev.findIndex(
        (g) => g.group.group_id === group.group_id
      );

      if (groupIndex === -1) {
        // Add new group with user selection
        return [...prev, { group, includeUsers }];
      } else {
        // Update includeUsers value for the group
        const updated = [...prev];
        updated[groupIndex] = { ...updated[groupIndex], includeUsers };
        return updated;
      }
    });
  };

  const toggleGroupSelection = (group: Group) => {
    setSelectedGroups((prev) => {
      const groupIndex = prev.findIndex(
        (g) => g.group.group_id === group.group_id
      );

      if (groupIndex === -1) {
        // If not selected, add the group with `includeUsers` defaulting to true
        return [...prev, { group, includeUsers: true }];
      } else {
        // If already selected, remove the group
        return prev.filter((g) => g.group.group_id !== group.group_id);
      }
    });
  };

  const handleImport = () => {
    if (selectedGroups.length > 0) {
      onImport(selectedGroups);
    } else {
      alert("Please select at least one group to import.");
    }
  };

  return (
    <div>
      <div>
        <h5 style={{ marginBottom: "10px" }}>Select Groups :</h5>
        {data.map((group) => {
          const selected = selectedGroups.find(
            (g) => g.group.group_id === group.group_id
          );
          const includeUsers = selected ? selected.includeUsers : true;

          return (
            <div key={group.group_id} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!selected} // Check if the group is selected
                  onChange={() => toggleGroupSelection(group)}
                  style={{ marginRight: "15px" }}
                />
                {group.group_name} - {group.description}
              </label>

              {selected && (
                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="checkbox"
                    checked={includeUsers}
                    onChange={(e) =>
                      handleGroupSelection(group, e.target.checked)
                    }
                    style={{ marginRight: "15px" }}
                  />
                  Include Users
                </label>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleImport}>Import Selected Groups</Button>
    </div>
  );
};

export default GroupSelector;
