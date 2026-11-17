import React, { useState } from "react";
import { AppBar, Toolbar, Button, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, TextField, Paper, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { extractTextFromDOM, ExtractedTextInfo } from "./exteractText"; // adjust path
import api from "../Api";
// Define your types in a JSON format
const availableTypes = [
  { label: "HEADER", value: "header" },
  { label: "BUTTON", value: "button" },
  { label: "LABEL", value: "label" },
  { label: "PLACEHOLDER", value: "placeholder" },
  { label: "PARAGRAPH", value: "paragraph" },
  { label: "QUESTION", value: "question" },
  { label: "WARNING", value: "warning" },
  { label: "INFO", value: "info" },
  { label: "ERROR", value: "error" },
  { label: "MENU", value: "menu" },
  { label: "HINT", value: "hint" },
  { label: "PROMPT", value: "prompt" },
  { label: "TITLE", value: "title" },
  { label: "MESSAGE", value: "message" },
  // Add more types as needed
];

interface ApproveTextInfo extends ExtractedTextInfo {
  approved: boolean;
  editedText: string;
  editedType: string; // New field for type editing
}
interface TextExtractorToolProps {
  function_id: number;
}
const TextExtractorTool = ({ function_id }) => {
  const [extractedData, setExtractedData] = useState<ApproveTextInfo[]>([]);

  const handleExtractClick = () => {
    const rawData = extractTextFromDOM();
    const withApproval = rawData.map((item) => ({
      ...item,
      approved: false,
      editedText: item.text,
      editedType: item.type, // Initialize with the current type
    }));
    setExtractedData(withApproval);
  };

  const handleCheckboxChange = (index: number) => {
    const updated = [...extractedData];
    updated[index].approved = !updated[index].approved;
    setExtractedData(updated);
  };

  const handleTextChange = (index: number, newText: string) => {
    const updated = [...extractedData];
    updated[index].editedText = newText;
    setExtractedData(updated);
  };

  const handleTypeChange = (index: number, newType: string) => {
    const updated = [...extractedData];
    updated[index].editedType = newType;
    setExtractedData(updated);
  };

  const handleSubmit = async () => {
    try {
      const approved = extractedData.filter((item) => item.approved);
      console.log("Approved for server:", approved);

      // Prepare the data in the format your backend expects
      const payload = {
        function_id: function_id, // You may want to make this dynamic
        data: approved.map((item) => ({
          // id: item.id,
          // name: item.name,
          text: item.editedText,
          type: item.editedType,
        })),
      };

      // Send to backend API
      const response = await api.post("/api/trans/save-resources", payload);

      console.log("Server response:", response.data);
      // Handle successful response (show notification, etc.)
      alert(`Resources saved successfully! Files generated: ${response.data.files.join(", ")}`);
    } catch (error) {
      console.error("Error saving resources:", error);
      // Handle error (show error message, etc.)
      alert("Error saving resources. Please check console for details.");
    }
  };

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: "#e0e0e0" }}>
        <Toolbar>
          <Button
            onClick={handleExtractClick}
            sx={{
              backgroundColor: "#42a5f5", // Light blue
              color: "white", // White text
              "&:hover": {
                backgroundColor: "#1e88e5", // Slightly darker blue on hover
              },
            }}>
            Extract Page Text
          </Button>
        </Toolbar>
      </AppBar>
      {/* <AppBar position="static" >
        <Toolbar>
          <Button color="inherit" onClick={handleExtractClick}>
            Extract Page Text
          </Button>
        </Toolbar>
      </AppBar> */}

      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Extracted Text (Approve and Edit)
        </Typography>

        {extractedData.length > 0 && (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Approve</TableCell>
                  {/* <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell> */}
                  <TableCell>Text</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extractedData.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox checked={item.approved} onChange={() => handleCheckboxChange(i)} />
                    </TableCell>
                    {/* <TableCell>
                      <TextField
                        value={item.id || ""}
                        onChange={(e) => {
                          const updated = [...extractedData];
                          updated[i].id = e.target.value;
                          setExtractedData(updated);
                        }}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.name || ""}
                        onChange={(e) => {
                          const updated = [...extractedData];
                          updated[i].name = e.target.value;
                          setExtractedData(updated);
                        }}
                        size="small"
                        fullWidth
                      /> */}
                    {/* </TableCell> */}
                    <TableCell>
                      <TextField value={item.editedText} onChange={(e) => handleTextChange(i, e.target.value)} size="small" fullWidth />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={item.editedType} onChange={(e) => handleTypeChange(i, e.target.value)} label="Type">
                          {availableTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 2 }} disabled={extractedData.every((item) => !item.approved)}>
              Submit to Server
            </Button>
          </>
        )}
      </Paper>
    </div>
  );
};

export default TextExtractorTool;

// import React, { useState } from "react";
// import { AppBar, Toolbar, Button, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, TextField, Paper, Typography } from "@mui/material";
// import { extractTextFromDOM, ExtractedTextInfo } from "./exteractText"; // adjust path

// interface ApproveTextInfo extends ExtractedTextInfo {
//   approved: boolean;
//   editedText: string;
// }

// const TextExtractorTool = () => {
//   const [extractedData, setExtractedData] = useState<ApproveTextInfo[]>([]);

//   const handleExtractClick = () => {
//     const rawData = extractTextFromDOM();
//     const withApproval = rawData.map((item) => ({
//       ...item,
//       approved: false,
//       editedText: item.text,
//     }));
//     setExtractedData(withApproval);
//   };

//   const handleCheckboxChange = (index: number) => {
//     const updated = [...extractedData];
//     updated[index].approved = !updated[index].approved;
//     setExtractedData(updated);
//   };

//   const handleTextChange = (index: number, newText: string) => {
//     const updated = [...extractedData];
//     updated[index].editedText = newText;
//     setExtractedData(updated);
//   };

//   const handleSubmit = () => {
//     const approved = extractedData.filter((item) => item.approved);
//     console.log("Approved for server:", approved);
//     // Send to backend API here
//     // await fetch("/api/save-resources", { method: "POST", body: JSON.stringify(approved) })
//   };

//   return (
//     <div>
//       <AppBar position="static">
//         <Toolbar>
//           <Button color="inherit" onClick={handleExtractClick}>
//             Extract Page Text
//           </Button>
//         </Toolbar>
//       </AppBar>

//       <Paper sx={{ p: 2, m: 2 }}>
//         <Typography variant="h6" gutterBottom>
//           Extracted Text (Approve and Edit)
//         </Typography>

//         {extractedData.length > 0 && (
//           <>
//             <Table size="small">
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Approve</TableCell>
//                   <TableCell>ID</TableCell>
//                   <TableCell>Name</TableCell>
//                   <TableCell>Text</TableCell>
//                   <TableCell>Type</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {extractedData.map((item, i) => (
//                   <TableRow key={i}>
//                     <TableCell>
//                       <Checkbox checked={item.approved} onChange={() => handleCheckboxChange(i)} />
//                     </TableCell>
//                     <TableCell>{item.id || "-"}</TableCell>
//                     <TableCell>{item.name || "-"}</TableCell>
//                     <TableCell>
//                       <TextField value={item.editedText} onChange={(e) => handleTextChange(i, e.target.value)} size="small" fullWidth />
//                     </TableCell>
//                     <TableCell>{item.type}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//             <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 2 }} disabled={extractedData.every((item) => !item.approved)}>
//               Submit to Server
//             </Button>
//           </>
//         )}
//       </Paper>
//     </div>
//   );
// };

// export default TextExtractorTool;
