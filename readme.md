SPECIFICATIONS:

Onboarding

Admins should be able to sign in with their Google account. i.e The backend should already recognize admin emails and only authenticate those emails.
Admin sessions should be authorized with JWT in http-only cookies. [i.e We expect that Admin is going to using a website).
Admin JWT token must be valid for 8 hours.
When a new person comes into the hub to register, admin should: a. Create a user account for them by entering their email. b. A login link i then sent to the new user's email for then to complete their signup.
User Onboarding a. User clicks on the link and is taken to Hub's site to complete their sign up. b. Optionally User can complete it with Google sign in. [This allows Backend to collect their full name]. c. OR User can add their full name and password and complete sign up.
Admin Features

Be able to see the clock days for each user.
Be able to see all users: email, fullNames, etc.
Admin should be able add new user: a. Name b. Email c. Subscription Type/Schedule: DAILY, WEEKLY, MONTHLY. d. Optional start date; or backend will use the current date.
Admin should be able to mark a user as defaulting on payment.
Admin should be able to set user Subscription status to ACTIVE, SUSPENDED, STOPPED.
Admin should be able to edit clock-in days for each user.
User Features

Sign in with Google.
Sign with Email and Password.
Password recovery.
Change Password.
Be able to see their clock-in days in any time period. e.g From January 1 2023 - July 6 2023
User can clock-in.
user can clock-out.
User can easily see the number of days for any month.
TECH STACK Language: TypeScript DataBase: MongoDB Framework: ExpressJS, NodeJs
