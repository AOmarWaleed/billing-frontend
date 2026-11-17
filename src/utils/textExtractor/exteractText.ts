export interface ExtractedTextInfo {
  // id?: string;
  //name?: string;
  text: string;
  type: string;
}

export function extractTextFromDOM(): ExtractedTextInfo[] {
  const elements: HTMLElement[] = Array.from(document.body.querySelectorAll("*"));
  const extracted: ExtractedTextInfo[] = [];
  const extractedSet = new Set<string>(); // Prevent duplicate extractions

  // First, specifically extract DataGrid headers
  const headerCells = document.querySelectorAll(".MuiDataGrid-columnHeader");
  headerCells.forEach((cell) => {
    const contentElement = cell.querySelector(".MuiDataGrid-columnHeaderTitleContainer") || cell;
    const text = contentElement.textContent?.trim() || "";
    const ariaLabel = cell.getAttribute("aria-label") || "";

    if (text || ariaLabel) {
      const headerText = ariaLabel || text;
      if (!extractedSet.has(headerText)) {
        extractedSet.add(headerText);
        extracted.push({ text: headerText, type: "header" });
      }
    }
    // if (text || ariaLabel) {
    //   extracted.push({
    //     text: ariaLabel || text,
    //     type: "header",
    //   });
    // }
  });
  // ✅ Extract title & message **BEFORE** looping over elements
  const dialogElement = document.querySelector("#delete-dialog-props");
  if (dialogElement) {
    const titleAttr = dialogElement.getAttribute("data-title");
    const messageAttr = dialogElement.getAttribute("data-message");

    if (titleAttr && !extractedSet.has(titleAttr)) {
      extractedSet.add(titleAttr);
      extracted.push({ text: titleAttr, type: "title" });
    }

    if (messageAttr && !extractedSet.has(messageAttr)) {
      extractedSet.add(messageAttr);
      extracted.push({ text: messageAttr, type: "message" });
    }
  }

  // ✅ Extract title & message **BEFORE** looping over elements
  const genericDialogElements = document.querySelectorAll("#generic-dialog-props");
  genericDialogElements.forEach((dialogElement) => {
    const titleAttr = dialogElement.getAttribute("data-title");

    if (titleAttr && !extractedSet.has(titleAttr)) {
      extractedSet.add(titleAttr);
      extracted.push({ text: titleAttr, type: "title" });
    }
  });
  // Process all other DOM elements
  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const style = window.getComputedStyle(el);

    if (tag === "script" || tag === "style" || style.display === "none" || style.visibility === "hidden") return;

    if (el.closest(".MuiDataGrid-row") || el.closest(".MuiDataGrid-virtualScroller") || el.closest(".MuiDataGrid-columnHeader")) {
      return;
    }

    // Regular extraction logic
    const placeholder = (el as HTMLInputElement).placeholder || "";
    const ariaLabel = el.getAttribute("aria-label") || "";
    const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
    const text = hasDirectText ? el.textContent?.trim() || "" : "";

    const extractedText = text || placeholder || ariaLabel;
    if (!extractedText || extractedText.length < 2) return;

    if (extracted.some((e) => e.text === extractedText)) return;
    if (!extractedSet.has(extractedText)) {
      let type = "label";
      if (["button"].includes(tag) || el.getAttribute("role") === "button") type = "button";
      else if (["input", "textarea", "select"].includes(tag)) {
        type = placeholder ? "placeholder" : "input";
      } else if (["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) type = "text";

      extracted.push({ text: extractedText, type });
    }
  });

  return extracted;
}
// ****************
// currently worked copy //
// export function extractTextFromDOM(): ExtractedTextInfo[] {
//   const elements: HTMLElement[] = Array.from(document.body.querySelectorAll("*"));
//   const extracted: ExtractedTextInfo[] = [];

//   // First, specifically extract DataGrid headers
//   const headerCells = document.querySelectorAll(".MuiDataGrid-columnHeader");
//   headerCells.forEach((cell) => {
//     const contentElement = cell.querySelector(".MuiDataGrid-columnHeaderTitleContainer") || cell;
//     const text = contentElement.textContent?.trim() || "";
//     const ariaLabel = cell.getAttribute("aria-label") || "";

//     if (text || ariaLabel) {
//       extracted.push({
//         //  id: cell.id,
//         //name: cell.getAttribute("name") || "",
//         text: ariaLabel || text,
//         type: "header",
//       });
//     }
//   });

//   // Then process other elements as before
//   elements.forEach((el) => {
//     const tag = el.tagName.toLowerCase();
//     const style = window.getComputedStyle(el);

//     // Skip hidden or non-rendered elements
//     if (tag === "script" || tag === "style" || style.display === "none" || style.visibility === "hidden") return;

//     // Skip DataGrid rows and virtual scroller (but we already got headers)
//     if (el.closest(".MuiDataGrid-row") || el.closest(".MuiDataGrid-virtualScroller") || el.closest(".MuiDataGrid-columnHeader")) {
//       return;
//     }

//     const placeholder = (el as HTMLInputElement).placeholder || "";
//     const ariaLabel = el.getAttribute("aria-label") || "";
//     //  const id = el.id || "";
//     //    const name = el.getAttribute("name") || "";

//     // Get direct text
//     const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
//     const text = hasDirectText ? el.textContent?.trim() || "" : "";

//     const extractedText = text || placeholder || ariaLabel;
//     if (!extractedText || extractedText.length < 2) return;

//     // Avoid duplicates (including against headers we already added)
//     if (extracted.some((e) => e.text === extractedText)) return;

//     // Guess the type
//     let type = "label";
//     if (["button"].includes(tag) || el.getAttribute("role") === "button") type = "button";
//     else if (["input", "textarea", "select"].includes(tag)) {
//       type = placeholder ? "placeholder" : "input";
//     } else if (["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) type = "text";

//     //extracted.push({ id, name, text: extractedText, type });
//     extracted.push({ text: extractedText, type });
//   });

//   return extracted;
// }

// * v1 *//
// export function extractTextFromDOM(): ExtractedTextInfo[] {
//   const elements: HTMLElement[] = Array.from(document.body.querySelectorAll("*"));
//   const extracted: ExtractedTextInfo[] = [];

//   elements.forEach((el) => {
//     const tag = el.tagName.toLowerCase();
//     const style = window.getComputedStyle(el);

//     // Skip hidden or non-rendered elements
//     if (tag === "script" || tag === "style" || style.display === "none" || style.visibility === "hidden") return;

//     // ❌ Skip only DataGrid rows, not headers
//     if (el.closest(".MuiDataGrid-row") || el.closest(".MuiDataGrid-virtualScroller")) return;

//     const placeholder = (el as HTMLInputElement).placeholder || "";
//     const ariaLabel = el.getAttribute("aria-label") || "";
//     const id = el.id || "";
//     const name = el.getAttribute("name") || "";

//     // 📌 Try to get direct text (e.g., from <p>, <span>, etc.)
//     const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
//     const text = hasDirectText ? el.textContent?.trim() || "" : "";

//     const extractedText = text || placeholder || ariaLabel;
//     if (!extractedText || extractedText.length < 2) return;

//     // Avoid duplicates
//     if (extracted.some((e) => e.text === extractedText)) return;

//     // Guess the type
//     let type = "label";
//     if (["button"].includes(tag) || el.getAttribute("role") === "button") type = "button";
//     else if (["input", "textarea", "select"].includes(tag)) {
//       type = placeholder ? "placeholder" : "input";
//     } else if (["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) type = "text";

//     extracted.push({ id, name, text: extractedText, type });
//   });

//   return extracted;
// }

// export interface ExtractedTextInfo {
//   id?: string;
//   name?: string;
//   text: string;
//   type: string;
// }

// export function extractTextFromDOM(): ExtractedTextInfo[] {
//   const elements: HTMLElement[] = Array.from(document.body.querySelectorAll("*"));
//   const extracted: ExtractedTextInfo[] = [];

//   elements.forEach((el) => {
//     const tag = el.tagName.toLowerCase();

//     // Skip script, style, hidden or invisible elements
//     const style = window.getComputedStyle(el);
//     if (tag === "script" || tag === "style" || style.display === "none" || style.visibility === "hidden") return;

//     // Extract meaningful text only if this element contains direct text
//     const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE ? el.textContent?.trim() : el.childNodes.length === 0 ? el.textContent?.trim() : "";

//     const placeholder = (el as HTMLInputElement).placeholder;
//     const ariaLabel = el.getAttribute("aria-label");

//     const extractedText = text || placeholder || ariaLabel || "";

//     if (!extractedText || extractedText.length < 2) return; // skip short or empty

//     // Prevent duplicates
//     if (extracted.some((e) => e.text === extractedText)) return;

//     let type = "label";
//     if (["button"].includes(tag) || el.getAttribute("role") === "button") type = "button";
//     else if (["input", "textarea", "select"].includes(tag)) type = "input";
//     else if (["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) type = "text";
//     else if (placeholder) type = "placeholder";

//     extracted.push({
//       id: el.id || "",
//       name: el.getAttribute("name") || "",
//       text: extractedText,
//       type,
//     });
//   });

//   return extracted;
// }

// // export interface ExtractedTextInfo {
// //   id?: string;
// //   name?: string;
// //   text: string;
// //   type: string;
// // }

// // function inferTypeFromTag(tag: string): string {
// //   const map: Record<string, string> = {
// //     button: "button",
// //     span: "label",
// //     p: "info",
// //     h1: "header",
// //     h2: "header",
// //     h3: "header",
// //     h4: "header",
// //     h5: "header",
// //     h6: "header",
// //     input: "field",
// //     textarea: "field",
// //     label: "label",
// //     div: "info",
// //   };
// //   return map[tag.toLowerCase()] || "text";
// // }

// // export function extractTextFromDOM(root: HTMLElement = document.body): ExtractedTextInfo[] {
// //   const results: ExtractedTextInfo[] = [];

// //   function traverse(node: HTMLElement) {
// //     const tag = node.tagName.toLowerCase();
// //     const id = node.id || undefined;
// //     const name = node.getAttribute("name") || undefined;
// //     const text = node.textContent?.trim() || "";
// //     const placeholder = (node as HTMLInputElement).placeholder || "";
// //     const type = inferTypeFromTag(tag);

// //     const isTextNode = ["button", "span", "p", "h1", "h2", "h3", "label", "div"].includes(tag);
// //     const isInput = ["input", "textarea"].includes(tag);

// //     if (isTextNode && text) {
// //       results.push({ id, name, text, type });
// //     } else if (isInput && placeholder) {
// //       results.push({ id, name, text: placeholder, type });
// //     }

// //     Array.from(node.children).forEach((child) => traverse(child as HTMLElement));
// //   }

// //   traverse(root);
// //   return results;
// // }
