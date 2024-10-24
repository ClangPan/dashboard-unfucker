# Due to changes in Tumblr's internals, the script isn't functional anymore as of 24/10/2024, efforts are being made to find an alternative fix, please be patient
# Dashboard Unfucker
Unfucks the twitterification of tumblr's dashboard by reverting it to the old layout as closely as possible while also offering control over other aspects of the UI.
Original credit goes to @enchanted-sword/[dragongirlsnout](https://tumblr.com/dragongirlsnout)

## Installation
The script works with and is fully tested with Tampermonkey, Tampermonkey Beta, Greasemonkey, and Violentmonkey.
- Install any one of the script injector extensions listed above.
- Click on [unfucker.user.js](https://github.com/ClangPan/dashboard-unfucker/raw/main/unfucker.user.js) to install or update.

## Features
The script uses window property flags to completely disable the vertical navigation layout, as well as Tumblr Live, the Tumblr Shop, and Tumblr Domains.
By default, it also reverts the latest activity, messaging, and searchbar updates, as well as removing the "post without tags?" popup in the post editor and re-adding the number of unread posts to the corner of the "home" icon in the navbar.

The features of the script are fully customizable in the sidebar config menu (the gear icon).

### Hide dashboard tabs
Hides the tabs at the top of the dashboard.

### Collapse the 'changes', 'staff picks', etc. carousel
Replaces the carousel that appears in your timeline at the spot where you last left off reading posts with a simple dividing line (Adapted from XKit Rewritten)

### Hide recommended blogs
Hides the Recommended Blogs sidebar item and the blog recommendation carousels between posts in the timeline.

### Hide recommended tags
Hides the tag recommendation carousels between posts in the timeline.

### Revert the post header design and re-add user avatars beside posts
Moves the shrunken inline avatars back to scrolling containers beside the posts, shows who a post was reblogged from even if it was reblogged from the previous contributor to the post's content, and replaces the word "reblogged" with the classic icon.

### Hide Tumblr Radar
Hides the Tumblr Radar.

### Hide Explore
Hides the explore icon in the navbar.

### Hide Tumblr Shop
Hides the Tumblr Shop icon in the navbar.

### Hide Badges
Hides users' badges normally displayed next to their username.

### Highlight likely bots in the activity feed
Marks new followers that are likely to be bots. The filter can sometimes indicate a false positive on new human users that have not yet updated their profile information; block at your own discretion.

### Show who follows you in the activity feed
Adds a "Following You" label to relevant notifications that matches the default "Mutuals" and "Following" labels.

### Content positioning
Controls the horizontal offset of the dashboard's content.

### Content width
Controls the width of the dashboard's content.

### Revert activity feed redesign
Reverts the latest activity feed redesign.

### Messaging window scale
Controls the relative height and width of the messaging window

### Revert messaging redesign
Changes the messaging window to look more like the old design.

- Use blog colors (default)
  - Uses the theme colours of the blog you're messaging
- Use theme colors
  - Uses the current dashboard palette colours
- Use custom colors
  - Uses the three custom hex colours supplied by the user in the text areas

### Disable "post without tags" nag
Disables the popup that appears when attempting to create a post without adding tags first. 

### Display exact vote counts on poll answers
Displays the number of votes each poll answer has recieved underneath the vote percentage.

### Display poll results without voting
Displays a colored bar inside of poll vote buttons whose width is proportional to the percentage of votes each option has recieved at the time of loading 

### Disable avatars scrolling with posts
Prevents the avatars beside posts from scrolling with the posts.

### Enable custom dashboard tabs
Enables the custom dashboard tabs experiment, which allows the tabs to be customized (To the extent Tumblr considers "customizable").
It is unclear whether this does anything anymore, if you depended on it before, please tell me if it works or not.

### Enable adding polls to reblogs
Enables adding polls onto reblogged posts.

### Show hidden NSFW posts in the timeline
Certain posts flagged as NSFW by Tumblr are delivered by internal API requests, but are not added to the dashboard feed. Enabling this feature will make these posts visible on the dashboard.

## Troubleshooting
- Not fully tested on chromium or safari, but sources seem to say that it does work as intended.
- If it injects, but ends up wonky, chances are you just need to do a full reload of the page (ctrl + shift + r).
- If you've updated script versions but it doesn't fix a version-specific bug, it's likely because of browser caching, closing and reopening the browser usually fixes it.
- If the inbox navigation icon isn't showing up, remove any custom adblock filters that you were previously using to hide the live/shop/etc. icons.

## Known issues / Incompatibilities
- The script apparently conflicts with HTTPS Everywhere extension on Firefox.
- The script may conflict with Legacy & New XKit. However, it works just fine with XKit Rewritten.
- The header may rarely appear larger than normal. The exact cause of this is not known, but it seems to be fixed permanently by just searching something in the searchbar.
- Not a proper issue per se, but I have gotten proofs that sometimes Tumblr's HTML is generated slightly differently to people, whether this is due to a recent change in internals or other influences is currently unknown due to lack of data

## Credits / Thanks
- @enchanted-sword/[dragongirlsnout](https://tumblr.com/dragongirlsnout), the original creator of the script
- @twilight-sparkle-irl/[desktop-assistant](https://www.tumblr.com/desktop-assistant), for helping with the original script, and angling me towards a direction to fix the state
