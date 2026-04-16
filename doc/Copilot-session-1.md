# Session Prompts — libretui Copilot Session

**Session ID:** 2a6dcc12-686a-4a5d-a192-89e38311740a  
**Period:** 2026-04-08 → 2026-04-16

---

## 1 — 2026-04-08 14:58

```
/init
```

## 2 — 2026-04-08 14:59

```
login
```

## 3 — 2026-04-08 15:01

```
I want to init a git repository in this directory and also create new project in github for it.
```

## 4 — 2026-04-08 15:03

```
Rename the default branch to main
```

## 5 — 2026-04-08 15:04

```
Init a node.js project
```

## 6 — 2026-04-08 15:08

```
cat package.json
```

## 7 — 2026-04-08 15:09

```
/init
```

## 8 — 2026-04-08 15:12

```
which ai model are you currently using?
```

## 9 — 2026-04-08 15:17

```
add npm dependencies: @opentui/core, libre-link-unofficial-api
```

## 10 — 2026-04-08 18:08

```
/opentui help
```

## 11 — 2026-04-12 12:08

```
Add a basic Typescript config onto the project.
```

## 12 — 2026-04-12 12:10

```
Add a basic eslint config onto the project, with the recommended js/ts configs.
```

## 13 — 2026-04-12 12:12

```
Add a bais prettier setup onto the project. I want to use 2 spaces for indentation and prefer single ticks to quatation marks on strings.
```

## 14 — 2026-04-12 12:18

```
When commiting changes to git I want you to use the email address 'jesse.jaara+copilot@gmail.com' as the committer, and to omit the cryptographich signing of commits, that is by default configured for my systems git setup.
```

## 15 — 2026-04-12 12:21

```
kkldk
```

## 16 — 2026-04-12 12:21

```
How can i enter prompts onto multiple lines in this cli?
```

## 17 — 2026-04-12 14:34

```
The purpose of this project is to create a TUI for accessing and visualizing
Abbott FreeStyle Libre GCM data in the terminal.
OpenTUI library will be used to render and display the data.
libre-link-unofficial-api library will be used to fetch data from Abbott's servers.

The application should have:

* A login screen where the user can:
  - Select the API server: USA(https://api-us.libreview.io) | EU(https://api-us.libreview.io)
  - Enter the login email
  - Enter the login password

* A screen that streams-in and displayes the current bg level.

* A screen that shows a graph of current and historical bg level data.
  - Should show a nice line graph of bg level values.
  - Should visialuze user's low and hight bg level marks
  - Should have proper legends for the bg level y-axis and
    horizontal x-axis for the time.
  - Should show current value in bold somewhere on the screen together
    with a trend arrow.

* A settings screen where the user can define:
  - Low and High points for bg levels.
  - Whether to use mg/dl or mmol/l units for the bg values.
```

## 18 — 2026-04-12 14:59

```
That plans seems fine for now. But I would like to track the progress in Github as issues. Also you should eventually implement the code in descreet portions, and submit them into the repository as pull requests, so that I can then manually review them before they get merged in.
```

## 19 — 2026-04-12 15:06

```
Add a proper .gitignore file
```

## 20 — 2026-04-12 15:08

```
Add all currently uncommitted changes and files to a new git commit.
```

## 21 — 2026-04-12 15:14

```
We should add a new item to the plan: We should add github action files, that make sure that prettier, eslint and typecript type checks have been run successfully before a PR can be merged. This should be the number 1 issue to implement.
```

## 22 — 2026-04-12 15:15

```
Ok lets get started!
```

## 23 — 2026-04-12 15:18

```
Done
```

## 24 — 2026-04-12 15:30

```
merged
```

## 25 — 2026-04-12 15:41

```
In future prefer a more concise and "autistic" communication style, no need to be polite either.
```

## 26 — 2026-04-12 15:42

```
PR merged. Continue
```

## 27 — 2026-04-12 15:48

```
Pause
```

## 28 — 2026-04-12 15:50

```
I would like to also keep track of the promps used to generate the issues, pull request, etc. Please include a small summary of any relevant promts made here in any future pull requests.
```

## 29 — 2026-04-12 15:50

```
continue
```

## 30 — 2026-04-12 16:22

```
Check the PR for review comments. There are some comments relating to general code style in there too, those should be recorded for further reference, in any and all relevant code quality tool configurations as well as AI agent instructions. But the condif/documentation changes should be made in a seperate commit/pr.
```

## 31 — 2026-04-12 16:31

```
PR #10 has been merged
```

## 32 — 2026-04-12 17:41

```
Ok, that has been merged. Lets continue with the plan
```

## 33 — 2026-04-12 18:05

```
Checkout and fix the comments from the PR
```

## 34 — 2026-04-12 18:11

```
Can you show me what the rendered content of BgGraph might eventually look like?
```

## 35 — 2026-04-12 18:16

```
Run prettier and update the pr
```

## 36 — 2026-04-12 18:19

```
Ok that has been merged. Lets move on to the next feat. But lets split that into smaller chunks, and implement the stuff one screen at a time. Starting with the login screen.
```

## 37 — 2026-04-12 18:30

```
stop
```

## 38 — 2026-04-12 18:31

```
Why are you looking at version 16 of node type? If you need to access them, please use a more modern version. Of preferably reference bun types instead
```

## 39 — 2026-04-12 18:34

```
Please try to create the pr again
```

## 40 — 2026-04-12 18:47

```
Check and fix the pr comment
```

## 41 — 2026-04-12 18:51

```
github-mcp-server is complaining about invalid session
```

## 42 — 2026-04-12 18:54

```
Ok merged, whats next?
```

## 43 — 2026-04-12 19:00

```
Merged. Next
```

## 44 — 2026-04-12 19:07

```
next
```

## 45 — 2026-04-12 19:17

```
fix the pr comments
```

## 46 — 2026-04-12 19:18

```
check aigain
```

## 47 — 2026-04-12 19:23

```
Ok that has been merged too. Tell me what is the next step?
```

## 48 — 2026-04-12 19:24

```
Lets do that
```

## 49 — 2026-04-12 19:55

```
Check and fix the pr comments
```

## 50 — 2026-04-12 20:05

```
Thats done
```

## 51 — 2026-04-12 20:06

```
Lets clear out the final item.
```

## 52 — 2026-04-12 20:17

```
Ok thats merged and we are done for now.
```

