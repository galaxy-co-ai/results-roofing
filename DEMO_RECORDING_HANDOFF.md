# Results Roofing Demo Recording - Claude-in-Chrome Handoff

## YOUR MISSION

Execute a smooth, cinematic user flow demo of Results Roofing using **Claude-in-Chrome MCP tools** (NOT Playwright). The user is recording with Trupeer in their Chrome browser. Move deliberately, pause at visual moments, type slowly for effect.

**CRITICAL:** Use `mcp__claude-in-chrome__*` tools - this controls the user's actual Chrome browser where Trupeer is running!

**IMPORTANT:** Wait for user to say "GO" before starting.

---

## USER DATA (Use Exactly)

| Field | Value |
|-------|-------|
| **Name** | Dalton Cox |
| **Email** | dalton@galaxyco.ai |
| **Address** | 3815 Sendera Lakes Drive, Moore, OK 73160 |
| **Card Number** | 4242424242424242 |
| **Expiry** | 1228 (or 12/28) |
| **CVC** | 123 |
| **ZIP** | 73160 |

---

## SITE URL

https://results-roofing.vercel.app/

---

## CLAUDE-IN-CHROME TOOLS TO USE

| Tool | Purpose |
|------|---------|
| `mcp__claude-in-chrome__tabs_context_mcp` | Get tab context first! |
| `mcp__claude-in-chrome__tabs_create_mcp` | Create new tab |
| `mcp__claude-in-chrome__navigate` | Go to URLs |
| `mcp__claude-in-chrome__read_page` | Get page elements |
| `mcp__claude-in-chrome__find` | Find elements by description |
| `mcp__claude-in-chrome__computer` | Click, type, scroll, screenshot |
| `mcp__claude-in-chrome__form_input` | Fill form fields |

---

## COMPLETE FLOW

### STEP 0: Setup
```
1. mcp__claude-in-chrome__tabs_context_mcp (createIfEmpty: true)
2. mcp__claude-in-chrome__tabs_create_mcp (create fresh tab)
3. mcp__claude-in-chrome__navigate to https://results-roofing.vercel.app/
```

### STEP 1: Landing Page (2-3 seconds pause)
- Take screenshot to confirm page loaded
- Let the hero section display

### STEP 2: Enter Address
- Find the address input (placeholder: "Start typing your address...")
- Click to focus
- Type slowly: `3815 Sendera Lakes Drive, Moore, OK`
- Wait 1.5s for autocomplete dropdown

### STEP 3: Select Address
- Click on the dropdown option containing "3815 Sendera Lakes Drive"
- A green "We found" confirmation appears
- Wait 1 second

### STEP 4: Click "Get my quote"
- Find and click button "Get my quote"
- Wait for navigation to /quote/new

### STEP 5: Property Confirmation (KEY MOMENT - 3 seconds!)
- **PAUSE HERE** - Let the satellite image display for 3 seconds
- This is a major visual moment!
- Then click "Yes, this is my property"

### STEP 6: Package Selection
- Wait for packages to load
- You'll see: Essential, Preferred (Most Popular), Signature
- Click "Select Preferred"

### STEP 7: Select Date
- Calendar shows February 2026
- Click any available (non-disabled) date like February 12
- Time slots appear

### STEP 8: Select Time
- Click "Morning 8:00 AM - 12:00 PM"
- Navigates to deposit page

### STEP 9: Fill Deposit Form

**9a. Signature:**
- Find signature pad area
- Use computer tool: left_click_drag from one point to another within the pad
- A "Clear Signature" button appears when done

**9b. Name:**
- Find "Your Full Name" input
- Type slowly: `Dalton Cox`

**9c. Email:**
- Find "Your Email" input
- Type slowly: `dalton@galaxyco.ai`

**9d. Terms:**
- Click the "Terms & Agreement" checkbox

### STEP 10: Click Secure My Spot
- Button is now enabled
- Click "Secure My Spot — $500"
- Stripe payment modal opens

### STEP 11: Fill Stripe Payment
**Note:** Stripe form is in an iframe - may need to click into it first

- **Card:** `4242424242424242`
- **Expiry:** `1228`
- **CVC:** `123`
- **ZIP:** `73160`

### STEP 12: Submit Payment
- Click "Pay $500" button
- Wait for processing
- Redirects to portal

### STEP 13: Customer Portal (FINAL - 3 seconds!)
- **PAUSE HERE** - Show the dashboard for 3 seconds
- Shows "Your Project Dashboard"
- Shows Dalton Cox's project details

**DEMO COMPLETE!**

---

## PACING GUIDELINES

| Moment | Pause |
|--------|-------|
| Landing page | 2-3s |
| After address select | 1s |
| **Satellite image** | **3s** |
| Package cards | 2s |
| **Portal dashboard** | **3s** |

**Type slowly for visual effect** - use deliberate keystrokes

---

## TROUBLESHOOTING

1. **Can't find element:** Use `read_page` or `find` tool to locate it
2. **Dropdown won't appear:** Wait longer after typing, ensure input is focused
3. **Stripe iframe:** Click into the card field first to focus the iframe
4. **Signature:** Use left_click_drag action with start/end coordinates

---

## PRE-RECORDING CHECKLIST

- [ ] User has Trupeer ready in Chrome
- [ ] Claude-in-Chrome extension connected
- [ ] User says "GO" to start
- [ ] Execute smoothly with pauses at key moments

---

## SUCCESS = 60-90 second cinematic demo showing:

1. ✅ Professional landing page
2. ✅ Smart address autocomplete
3. ✅ Satellite property view
4. ✅ Package comparison
5. ✅ Easy scheduling
6. ✅ Secure checkout
7. ✅ Customer portal
