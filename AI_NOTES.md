# AI_NOTES

# AI Usage Notes

This project was developed with assistance from AI tools (primarily Claude/ChatGPT) as a coding assistant. AI was used to speed up development of boilerplate code and provide implementation suggestions, while I reviewed, modified, tested, and validated the final solution.

## 1. AI-generated vs. written by me

### AI-assisted

AI was primarily used for:

* Initial Express project structure and folder organization
* Boilerplate for routes, controllers, and service files
* Basic CRUD endpoint implementations
* Initial Jest and Supertest test scaffolding
* README and API documentation draft
* General suggestions for error handling and validation

### Written or significantly modified by me

I reviewed and adjusted the generated code to better match the assignment requirements. This included:

* Organizing the project into a cleaner folder structure
* Refining request validation and error responses
* Reviewing the service layer logic for expense calculations
* Verifying file-based data persistence
* Improving API response consistency
* Updating and extending the test cases
* Finalizing the README with installation and execution steps
* Preparing this AI usage document

## 2. What I validated, tested, or changed

Rather than accepting AI-generated code as-is, I reviewed each component and made several changes.

### Validation

* Verified that all required assignment endpoints were implemented.
* Checked request validation for required fields, invalid amounts, and invalid dates.
* Ensured appropriate HTTP status codes were returned for success and error scenarios.

### Logic Changes

* Simplified parts of the generated code where the initial solution felt unnecessarily complex.
* Improved consistency of JSON response formats across endpoints.
* Reviewed summary calculations to ensure totals matched expected results.
* Confirmed category filtering behaved correctly.

### Testing

I reviewed and executed the test suite to verify:

* Creating a new expense
* Retrieving all expenses
* Filtering by category
* Calculating expense summaries
* Deleting existing expenses
* Handling invalid requests
* Handling deletion of non-existent expenses

Where necessary, I updated the tests to better cover edge cases and align with the final implementation.

## 3. AI suggestions I chose not to use

During development, AI suggested a few approaches that I decided not to adopt.

### Using a database

AI suggested using a database for persistence, but the assignment explicitly allowed in-memory or JSON file storage, so I kept the implementation file-based to match the requirements and keep the project lightweight.

### Adding extra dependencies

Some suggestions included introducing additional libraries for features that were not required. I avoided these to reduce complexity and keep the project focused on the assignment objectives.

### Over-engineering the architecture

Some generated code introduced abstractions that were unnecessary for a small CRUD API. I simplified the implementation to improve readability and maintainability while still keeping a clear separation between routes, controllers, and services.

## Overall Approach

AI served as a productivity tool for generating boilerplate and providing implementation ideas. The final project reflects my review, validation, testing, and refinement to ensure it meets the assignment requirements and follows clean REST API practices.
