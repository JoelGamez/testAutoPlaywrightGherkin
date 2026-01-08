const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "reporting/cucumber-json",
  reportPath: "reporting/cucumber-html-report",
  metadata: {
    browser: {
      name: "chrome",
      version: "Latest",
    },
    device: "Local test machine",
    platform: {
      name: "macOS",
      version: "Latest",
    },
  },
  customData: {
    title: "Test Execution Report",
    data: [
      { label: "Project", value: "JSON Placeholder API Tests" },
      { label: "Environment", value: "Test" },
      { label: "Execution Time", value: new Date().toLocaleString() },
    ],
  },
});

console.log(
  "✅ Cucumber HTML report generated in: reporting/cucumber-html-report/"
);
