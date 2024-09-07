const fs = require('fs');
const { exec } = require('child_process');

// Function to read the file and parse it as JSON
const readDataFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

// Function to check if any tag matches the "*.PR-*" pattern
const findMatchingIds = (data) => {
  // const pattern = /^.*\.PR-.*/;
  return data
    .filter(item => item.metadata.container.tags.length == 0)
  //   .filter(item => item.metadata.container.tags.some(tag => pattern.test(tag)))
    .map(item => item.id);
};

// Function to execute the GH API delete command for each version ID
const deleteVersion = (versionId) => {
  const command = `gh api -X DELETE -H "Accept: application/vnd.github+json" /orgs/e-learning-by-sse/packages/container/nm-self-learning/versions/${versionId}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error deleting version ${versionId}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Version ${versionId} deleted successfully: ${stdout}`);
  });
};

// Read data from list.txt and find matching IDs
const data = readDataFromFile('list.txt');
const matchingIds = findMatchingIds(data);

// Call the GH API for each matching ID
matchingIds.forEach(id => {
  deleteVersion(id);
  console.log("deleted:", id)
});

