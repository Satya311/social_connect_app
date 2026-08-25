**Implementation Plan - Mobile Social Connection App ("Tribes")**


Build a modern, user-friendly Invite-Only Mobile Application for private group social connections with Guest View permissions, Review & Signout workflow, and privacy safeguards.

User Review Required
IMPORTANT

Uninvited Guest View: Users without an invite code can ONLY view scheduled meetup details and posters in a Read-Only mode. All interactive actions (chatting, voting, calling, safety taps, event creation) are locked.
Review & Signout Flow: Users wishing to sign out must write a review/feedback to leave.
Activity Preservation: Their past messages, poll votes, and safety records remain intact in the group.
Silent Exit: Absolutely NO notification or message saying "User signed out" is posted in chat.
Re-signin Treatment: Ex-users signing in again undergo the standard onboarding flow (enter invite code, OTP, icebreaker) as if they were a new user.
Proposed Changes
1. Uninvited Guest View (src/components/auth/)
GuestModeBanner.jsx: Banner for users who skip invite entry ("Read-Only Guest Mode - Meetups Preview").
Action Lock: Read-only access to Meetups & Calendar tab (view title, tagline, date, poster). Action buttons (Chat input, Poll creation, Call joining, Safety Taps) are disabled with "Invite Code Required to Unlock" prompt.
2. Review & Signout Modal (src/components/profile/)
SignoutReviewModal.jsx: Bottom sheet containing a required review/feedback text box ("Write a review before leaving").
Silent Exit Handler:
Validates review text entry.
Logs feedback internally.
Clears active user session.
No Chat Broadcast: Ensures zero exit messages in chat feed.
Preserves all previous messages and activity attributable to the handle.
3. Re-Authentication Handler (src/components/auth/)
Reset state to fresh onboarding gate when user signs in again.
Verification Plan
Automated Verification
Run static checks and verify HTML/JS structure.
Manual Verification

Test Guest Mode: Click "Continue as Guest" on onboarding -> Verify user can view Meetups & Posters, but Chat, Safety Taps, Polls, and Calls are locked.
Test Review & Signout: Go to Profile -> Click "Sign Out & Leave" -> Verify user is prompted to write a review -> Submit -> Verify exit is silent with NO message in chat and past messages remain preserved.
Test Re-signin: Sign back in -> Verify full onboarding process triggers as expected.
