// Import our React Flow workflow canvas
import WorkflowCanvas from "@/components/WorkflowCanvas";

export default function Home() {
  return (
    <main
      style={{
        // Make the page use the full browser height
        width: "100%",
        height: "100vh",

        // Put the title above the workflow canvas
        display: "flex",
        flexDirection: "column",

        // Prevent the page itself from creating unnecessary scrolling
        overflow: "hidden",
      }}
    >
      {/* Application title */}
      <h1
        style={{
          // Keep the title compact so more space is available
          // for the workflow canvas
          margin: "12px 20px",

          // Prevent the title from shrinking
          flexShrink: 0,
        }}
      >
        AI Workflow Builder
      </h1>

      {/* Give the workflow all remaining screen space */}
      <div
        style={{
          // Take all remaining vertical space
          flex: 1,

          // Important when using flex layouts
          // This allows React Flow to calculate its height correctly
          minHeight: 0,
        }}
      >
        {/* Display our workflow builder */}
        <WorkflowCanvas />
      </div>
    </main>
  );
}