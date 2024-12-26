# sun-track
A simple time tracking web application with location tracking and validation.

Location validation detects discrepancies between the reported and actual location:

Discrepancies include:
- User clocked into a job but was not at the location.
- User arrived at the location but did not clock into the job within a reasonable time.
- User left a location before clocking out of the job.
- User, independent of the job, was at an unknown location for an extended period of time.

The system will be able to generate a report of the user's location history for a given time period.

> Note: If the user is not clocked in, the system will not monitor the location of the user.

## Installation
1. Clone the repository: `git clone https://github.com/johnylindbergh/suntrack.git`
2. Install Node.js.
3. Install the required packages: `npm install`
4. Install MySQL and run `db.sql` with `source db.sql`.
5. Get a Google OAuth API key.
6. Create `credentials.js` with the following content:

```javascript
module.exports = {
  // Google OAuth2 credentials for user authentication
  GOOGLE_CLIENT_ID: '{your_google_client_id}',
  GOOGLE_CLIENT_SECRET: 'your_client_secret',

  // Session encryption secret
  SESSION_SECRET: 'your_session_secret',

  // MySQL credentials
  MYSQL_USERNAME: 'your_mysql_username',
  MYSQL_PASSWORD: 'your_mysql_password',

  // SSL configuration
  approvedDomains: 'yourapproveddomain.com',
  domain: 'https://your_domain.com',
  greenlockEmail: 'your_greenlock_email',

  // Email configuration
  serverEmail: 'optional_server_email',
  emailPassword: 'server_email_password'
}
```

## Usage
1. Navigate to the project directory: `cd sunTrack`

2. Run the application: `node server.js > logFileName.log &`
3. Open your web browser and visit `http://localhost:5000`

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
