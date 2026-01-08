@api
Feature: JSON Placeholder API Testing
  As an Automation engineer
  I want to test the JSON Placeholder API
  So that I can verify all CRUD operations work correctly

  Scenario: Complete API workflow with user and posts
    Given I get all users from the API
    When I select a random user
    Then I should log the user's email address
    
    When I get all posts for the selected user
    Then all posts should have valid Post IDs between 1 and 100
    And I should log the title and ID for each post
    
    When I select a random post from the user's posts
    And I modify the post title to "Updated Title by Automation"
    Then I should verify the post was updated
    And I should log the updated post ID and title
    
    When I create a new post with title "New Post Title" and body "This is the post body"
    Then the post creation should return the correct response
    And I should verify the created post has valid data
