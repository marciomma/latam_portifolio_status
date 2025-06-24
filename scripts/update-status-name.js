const { redis } = require("../lib/redis");

async function updateStatusName() {
  try {
    console.log("Fetching current statuses from Redis...");
    
    // Get current statuses
    const statuses = await redis.get('statuses');
    
    if (!statuses || !Array.isArray(statuses)) {
      console.error("No statuses found or invalid format");
      return;
    }
    
    console.log(`Found ${statuses.length} statuses`);
    
    // Find and update the status with the old name
    let updated = false;
    const updatedStatuses = statuses.map(status => {
      if (status.name === "Available to be Ordered" || status.code === "AVAILABLE_TO_ORDER") {
        console.log(`Updating status: "${status.name}" to "Ready to be Ordered"`);
        updated = true;
        return {
          ...status,
          name: "Ready to be Ordered"
        };
      }
      return status;
    });
    
    if (updated) {
      // Save updated statuses back to Redis
      await redis.set('statuses', updatedStatuses);
      console.log("✅ Status name updated successfully!");
      
      // Verify the update
      const verifiedStatuses = await redis.get('statuses');
      const readyStatus = verifiedStatuses.find(s => s.name === "Ready to be Ordered");
      if (readyStatus) {
        console.log("✓ Verified: Status now has name 'Ready to be Ordered'");
      }
    } else {
      console.log("ℹ️  No status found with name 'Available to be Ordered'");
      
      // Show current status names
      console.log("\nCurrent status names:");
      statuses.forEach(status => {
        console.log(`  - ${status.name} (code: ${status.code})`);
      });
    }
    
  } catch (error) {
    console.error("Error updating status name:", error);
  } finally {
    process.exit(0);
  }
}

updateStatusName(); 