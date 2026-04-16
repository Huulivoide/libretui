# Session Prompts

Prompts entered during this Copilot CLI session for the `libretui` project.

> **Note:** 32 messages from the middle of the session were compacted by the context summariser and their exact text is not recoverable. The topics they covered are noted below.

---

## Tab Selector Fix

1. There's something wrong with how the tab selectors: Server on Login Screen & Unit selector on Settings Screen. They can be interattected with, but they do not seem to be rendering any content on the screen.

2. Stop

3. Replace thise tabselect components with the OpenTUI Select component

---

## [32 messages — compacted]

Topics covered (from session summary):
- Iterative implementation of the Select component replacement for Server (Login screen) and Unit (Settings screen) selectors
- Button component refactor
- DataPoller service implementation

---

## Live Screen Visual Upgrade

4. Lets create a visually more stunning display for the current BG value on the Live screen. Lets use the ASCIIFontRenderable from OpenTUI to render the actual value using the 'pallet' font. We are also going to then need a better trend arrow too. Create a ascii visualization for each of the needed trends. The pallet font is 6 charactes tall, so the trend arrows should probably also be 6 characters talls. Before you proceed to implement the actual code, i would like to see the trend arrows rendered here in the chat, so I can approve them.

5. Those look like absolute shit. Try again and see what you can create using the braille characters instead, using the individual dots as pixels.

6. Those are shit too. I used Gemini to create some good looking arrows. The are difined in the @src/components/TrendArrowFont.ts file. Plese use them.

7. *(empty — proceed)*

---

## Git Workflow Rule

8. You must never commit code directly onto the main branch. Instead always create a new feature branch and pull request for all change sets.

9. Save that onto your instructions file

---

## README & LICENSE

10. Create a Readme file onto the projects root folder, and add a License file also.

11. merged

---

## Caveman Mode

12. /caveman

---

## Graph Y-Axis Improvements

13. Lets improve the Graph screen and: 1. Add values to the y-axis legend for the threhold lines. 2. Add a neutrally colored horizontral line, at every 1 mmol/l \ 20 mg/dl, these lines should also have numbers on the y-axis legend. 3. Drop the current y-axis legend values. 4. Make sure the graph always displays at least the range of 3-12 mmol/l or 50-210 mg/dl. 5. There should also be atleast 0.5mml/l or 10mg/dl of padding at the top and bottom, so that the lines added in point 2. neverget rendered at the very edge of the graph.

14. *(empty — proceed)*

---

## Threshold Line Glitch Fix

15. There seems to be a visual glich when rendering the low/high threshold lines. Of they align to the same row onto which a normal dim grid line has been draw, the grid line is shown behind the dashed threshed line. Lets change the threshold line implementation to be a continuous line instead of dashed.

16. *(empty — proceed)*

17. merged

---

## Graph Border & Adaptive Grid

18. Lets improve the graph some more: - Currently the graph is missing a border from the top and right edges. Add in those. - On smaller console sizes the gridlines dont allign wery nicely. If the renreded height is <= 40 rows, only render the regular grid lines every 2 mmol/l \ 40 mg/dl.

19. *(empty — proceed)*

20. Check and fix pr

21. Check the pr comments

---
