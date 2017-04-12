Github APp :wink:
===

## User Stories

User stories

As a member of Founders and Coders, who wants to learn from my fellow devs:

>I want to log in with my Github account
So that I can use my Github organisation's info to see posts from my fellow students.

Acceptance criteria:

 - [ ] I can click on a button, which allows me to log in via my Github account
 - [ ] The look of the button should make it obvious that it is this form of login
 - [ ] Once I'm logged in, I should see a list of blog posts
 - [ ] I shouldn't be left with a blank loading screen for too long during the authorisation process, otherwise I will lose confidence in your website and leave.

As any user who is logged in:

>I want to see my username & Github profile picture on the homepage
So that I benefit from logging in with Github OAuth, and don't have to do any profile setup on your site.

Acceptance criteria:

- [ ] I can see my username & profile picture on each page that I visit


Stretch goal:

As a paranoid member of the current cohort, who believes in "what happens at FAC stays at FAC"

> I want others' viewing rights to my posts to be restricted
So that I feel free to be wildly opinionated with my crazy blogging.

Acceptance criteria:

- [ ] Only logged-in members of Founders and Coders can see any of the content on this site
Anyone who is logged in, but not part of the current cohort, should still see a list of blogs. But they should see nothing that I (the paranoid user) have posted.

## Installation instructions

- Clone this repo
- Run `npm install`
- In your terminal run `chmod +x /path/to/init.sh`
- Then: `./fileName.sh` and follow the instructions using the secret passwords we have given you :)
- Run `npm run dev` to run server locally
- To test - `npm run test`
- To test database - `npm run test-database`
- For coverage - `npm run coverage`
