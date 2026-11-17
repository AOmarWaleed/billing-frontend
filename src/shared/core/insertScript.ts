const resourcesData = {
  success: true,
  function_id: 7,
  group_id: 131, // Update this if needed
  total_fields: 14,
  visible_fields: 14,
  resource_ids: [],
  fields: {
    payers_7_postalCode: {
      resource_id: "1870",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "Postal Code",
      label_ar: "الرمز البريدي",
      has_permission: true,
    },
    payers_7_descriptionInArabic: {
      resource_id: "1862",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "Description In Arabic",
      label_ar: "الوصف باللغة العربية",
      has_permission: true,
    },
    payers_7_streetNameInArabic: {
      resource_id: "1863",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "Street Name In Arabic",
      label_ar: "اسم الشارع باللغة العربية",
      has_permission: true,
    },
    payers_7_districtInArabic: {
      resource_id: "1864",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "District In Arabic",
      label_ar: "الحي باللغة العربية",
      has_permission: true,
    },
    payers_7_cityInArabic: {
      resource_id: "1865",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "City In Arabic",
      label_ar: "المدينة باللغة العربية",
      has_permission: true,
    },
    payers_7_provinceInArabic: {
      resource_id: "1866",
      show: true,
      disabled: false,
      required: false,
      resource_type: "TEXT",
      label_en: "Province In Arabic",
      label_ar: "المنطقة باللغة العربية",
      has_permission: true,
    },
  },
};

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI0MSwiZ3JvdXBJZCI6MTMxLCJsYW5ndWFnZSI6ImVuIiwiaWF0IjoxNzgzMjQzMDg1LCJleHAiOjE3ODMzMjk0ODV9.yANPsNOiD8V7TxT0aH3fp_jrqDo0cMjXNrGlBWwo-ts";
async function transformAndPost() {
  const API_URL = "http://localhost:3500/billing-api/api/trans/resources";

  const fields = resourcesData.fields;
  const functionId = resourcesData.function_id.toString();

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const [resourceKey, fieldData] of Object.entries(fields)) {
    // Transform to the required format
    const payload = {
      resource_id: parseInt(fieldData.resource_id),
      resource_type: fieldData.resource_type,
      text: fieldData.label_en,
      facility_id: "0",
      function_id: functionId,
      resource_key: resourceKey,
      text_custom: fieldData.label_en,
      text_locale: fieldData.label_ar,
      text_locale_custom: fieldData.label_ar,
    };

    console.log(`\nProcessing: ${resourceKey} (ID: ${fieldData.resource_id})`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("✓ Success:", responseData);
        successCount++;
        results.push({
          resourceKey,
          status: "success",
          response: responseData,
        });
      } else {
        console.log("✗ Error:", responseData);
        errorCount++;
        results.push({
          resourceKey,
          status: "error",
          response: responseData,
        });
      }
    } catch (error) {
      console.log("✗ Exception:", error.message);
      errorCount++;
      results.push({
        resourceKey,
        status: "exception",
        error: error.message,
      });
    }

    // Add a small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total resources processed: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log("=".repeat(60));

  return results;
}

async function transformAndPostPermissions() {
  const API_URL = "http://localhost:3500/billing-api/api/resources/group-auth";
  const group_id = resourcesData.group_id;
  const fields = resourcesData.fields;
  const permissions = { user_group_auth: [] };

  permissions.user_group_auth = Object.values(fields).map((field) => ({
    group_id,
    resource_id: field.resource_id,
    hidden: field.show ? "N" : "Y",
    disabled: field.disabled ? "Y" : "N",
    required: field.required ? "Y" : null,
  }));

  console.log("\n" + "=".repeat(60));
  console.log("POSTING PERMISSIONS");
  console.log("=".repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
      },
      body: JSON.stringify(permissions),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log("✓ Success: ", responseData);
      return { status: "success", response: responseData };
    } else {
      console.log("✗ Error:", responseData);
      return { status: "error", response: responseData };
    }
  } catch (error) {
    console.log("✗ Exception:", error.message);
    return { status: "exception", error: error.message };
  }
}

// Main execution function that runs everything in sequence
async function executeSequentially() {
  try {
    console.log("Starting resource transformation and posting...\n");

    // First, transform and post all resources
    const resourceResults = await transformAndPost();

    console.log("\n\nResource posting completed. Now posting permissions...\n");

    // Then, post permissions (depends on resources being posted)
    const permissionResult = await transformAndPostPermissions();

    console.log("\n" + "=".repeat(60));
    console.log("ALL OPERATIONS COMPLETED");
    console.log("=".repeat(60));

    return {
      resources: resourceResults,
      permissions: permissionResult,
    };
  } catch (error) {
    console.error("Fatal error during execution:", error);
    throw error;
  }
}

// Run the complete workflow
executeSequentially().catch(console.error);
