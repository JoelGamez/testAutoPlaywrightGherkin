import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I init the config", async () => {
  console.log("Initializing configuration...");
});
