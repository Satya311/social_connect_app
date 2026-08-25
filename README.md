Social Connection App
Tribes Mobile Social Connection App
Updated Tribes (PulseConnect) with the new requested access control, review-based signout, and guest preview features.

📱 Newly Added Features & Verification
1. Uninvited Guest View ("Install without Invite")
Read-Only Preview Mode: Users launching the app without an invite code can click "Continue without Invite (Read-Only Preview)".
Meetup Details & Posters: Uninvited guests can view all scheduled group meetups, taglines, dates/times, descriptions, venue locations, and poster images.
Action Lock: All interactive capabilities (Group Chatting, Voting on Polls, RSVP/Reached/Safe Home Taps, Call Joining, and Event Creation) are strictly locked. Attempting any locked action displays an alert prompting the guest to enter an invite code (TRIBES-8849) to unlock full group membership.
2. Review & Signout Flow ("Write a review and leave")
Mandatory Feedback: If a user wants to sign out or leave the group workspace, they click "Write Review & Sign Out (Leave Group)" in their Profile tab and must provide a review/feedback.
Preserved Activity: All past chat messages, poll votes, and safety records submitted by that user remain completely intact in the group workspace.
Silent Exit (No Chat Message): Absolutely NO notification or chat message saying "User signed out" or "User left" is posted to the group chat.
3. Re-Authentication / Re-Signin Behavior
When an ex-user or returning user signs in again, they undergo the exact same standard onboarding process (entering the 6-character invite code TRIBES-8849, 6-digit OTP verification, and icebreaker vibe selection) just as a new user would.
🚀 How to Test
Open the mobile web application file in any web browser: 
index.html
Test Guest Mode: Click "Continue without Invite (Read-Only Preview)" -> Verify you can preview meetups and posters, but interactive actions trigger an invite code prompt.
Test Signout & Review: Log in with code TRIBES-8849 -> Go to Profile -> Click "Write Review & Sign Out" -> Enter review -> Verify exit is silent with NO signout message posted to chat, and past messages remain preserved.
Test Re-signin: Re-enter code TRIBES-8849 to sign in again as a returning user!
