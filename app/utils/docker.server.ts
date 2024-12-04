// utils/docker.server.ts
import { exec } from "child_process";
import { promisify } from "util";

// Promisify exec to work with async/await
const execPromise = promisify(exec);

export async function getDockerContainers() {
  try {
    // Correct docker ps command with formatting
    const { stdout, stderr } = await execPromise('docker ps -a --format "{{.Names}}: {{.Status}}"');
    
    if (stderr) {
      throw new Error(stderr);
    }

    // Return the list of container names and statuses
    return stdout.split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error running docker ps:", error);
    return [];
  }
}