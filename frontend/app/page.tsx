// Import our workflow canvas
import WorkflowCanvas from "@/components/WorkflowCanvas";

export default function Home() {
  return (
    <main>
      {/* Page heading */}
      <h1>AI Workflow Builder</h1>

      {/* Display our workflow canvas */}
      <WorkflowCanvas />
    </main>
  );
}