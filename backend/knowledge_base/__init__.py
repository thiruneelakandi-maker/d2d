Complete the backend for our AI Emergency Communication and Information Assistant.

The system must support multiple emergency situations, not only fire:
- Flood
- Fire
- Earthquake
- Cyclone
- Accident
- Medical emergency
- Landslide
- Building collapse
- Other emergency situations

Use the existing Django project and existing apps. Do not replace or break the existing UI or working APIs.

Implement and verify:

1. Emergency report API
   - Create emergency report
   - Emergency type
   - Location
   - Description
   - Severity: Low, Medium, High, Critical
   - Timestamp
   - Status

2. AI analysis API
   - Analyze the user's emergency description
   - Classify emergency type
   - Estimate severity
   - Give safe immediate guidance
   - Suggest the appropriate emergency service
   - Return a structured JSON response

3. Emergency history API
   - Save reports
   - Retrieve previous reports
   - Include status, type, severity, location and timestamp

4. Emergency contacts
   - Provide appropriate emergency contact information
   - Keep the data configurable through the existing backend

5. Knowledge base
   - Add basic safety information for flood, fire, earthquake,
     cyclone, accident, medical emergency and landslide

6. Validation and error handling
   - Validate missing or invalid input
   - Return proper HTTP status codes
   - Never expose sensitive information

7. Frontend integration
   - Connect the existing frontend report page to the real Django APIs
   - Do not use mock-only responses
   - Keep the existing design unchanged

8. Testing
   - Test every API endpoint
   - Test at least one example for each emergency type
   - Run Django checks and confirm there are no errors

After implementation, show me:
- files changed
- API endpoints
- test results
- exact commands to run backend and frontend
