import { useState } from "react";
import { CodeList } from "./CodeList";
interface CodeItem {
  code: string;
  description: string;
}

const Example = () => {
  const [selectedCode, setSelectedCode] = useState<CodeItem | null>(null);
  return (
    <>
      <div>Example</div>
      <label>Selected code is {selectedCode?.description}</label>
      <CodeList codeType={1} value={selectedCode} onChange={setSelectedCode} placeholder="Please select Religion Codes" />;
    </>
  );
};
export default Example;
