@api @negative
Feature: JSON Placeholder API Negative Testing
  As a QA engineer
  I want to test error handling in the JSON Placeholder API
  So that I can verify the API handles invalid requests appropriately

  Scenario: Get user with invalid ID
    When I request a user with ID 99999
    Then the response should return status 404
    And the response body should be empty

  Scenario: Get posts for non-existent user
    When I request posts for user ID 99999
    Then the response should return status 200
    And the response should return an empty array

  Scenario: Create post with missing required fields
    When I create a post with empty title and body
    Then the response should return status 201
    And the created post should have empty title and body

  Scenario: Update non-existent post
    When I update post with ID 99999
    Then the response should return status 500
    And I should receive an error message

  Scenario: Invalid endpoint request
    When I request an invalid endpoint "/invalid-endpoint"
    Then the response should return status 404
