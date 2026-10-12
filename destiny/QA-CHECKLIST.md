# QA Test Checklist — Expense Dashboard

Target: `/dashboard` (Next.js + Supabase)
Tester: ______________  Date: ______________  Build/commit: ______________

| # | Area | Test case | Steps / Expected result | Status |
|---|------|-----------|--------------------------|--------|
| 1 | Auth | Unauthenticated redirect | Visit `/dashboard` while logged out → redirected to `/login`. | ☐ Pass ☐ Fail |
| 2 | Auth | Session persistence | Log in, refresh `/dashboard` → stays logged in; header shows name/initials and email. | ☐ Pass ☐ Fail |
| 3 | Auth | Logout | Click Logout → session cleared; revisiting `/dashboard` redirects to `/login`. | ☐ Pass ☐ Fail |
| 4 | Create | Add valid expense | Fill description, amount, category, date → button shows "Adding…", form clears, new row appears in list, totals update. | ☐ Pass ☐ Fail |
| 5 | Create | Amount validation | Submit amount `0`, negative, or non-numeric → error "Enter a valid amount greater than 0." and nothing is saved. | ☐ Pass ☐ Fail |
| 6 | Create | Description validation | Empty description → "Description is required."; 500+ chars rejected (input capped at 499). | ☐ Pass ☐ Fail |
| 7 | Create | Future date blocked | Date field `max` = today → picking a future date is rejected; server rejects invalid format (`YYYY-MM-DD`). | ☐ Pass ☐ Fail |
| 8 | Create | Category validation | Only categories from `EXPENSE_CATEGORIES` are accepted; tampered value → "Choose a valid category." | ☐ Pass ☐ Fail |
| 9 | Read | Summary accuracy | "Total spent", "Transactions", "Average", "Largest" match a manual sum of the listed expenses for the selected month. | ☐ Pass ☐ Fail |
| 10 | Read | Naira formatting | All amounts render as ₦ with 2 decimals and thousands separators (e.g. ₦2,500.00). | ☐ Pass ☐ Fail |
| 11 | Read | Daily chart | Bars exist for every day of the month; hover tooltip shows correct date + total; empty month shows "No spending recorded in this month." | ☐ Pass ☐ Fail |
| 12 | Read | Category breakdown | Bars only for categories with spending; widths proportional; largest = 100%; empty state message shown when none. | ☐ Pass ☐ Fail |
| 13 | Month nav | Prev/next month | Prev/next updates `?month=YYYY-MM`, list + summary + chart all switch together; next arrow disabled on current month. | ☐ Pass ☐ Fail |
| 14 | Month nav | Month jump input | Type a month (max = current) and press Go → correct month loads; datalist suggests months with data; invalid/empty param falls back to current month. | ☐ Pass ☐ Fail |
| 15 | Update | Edit an expense | Click Edit → inline form pre-filled; change values → Save shows "Saving…", row updates, summary recalculates. | ☐ Pass ☐ Fail |
| 16 | Update | Edit cancel | Click Cancel in edit form → form closes, original values unchanged. | ☐ Pass ☐ Fail |
| 17 | Delete | Delete with confirm | Delete → confirmation dialog; Cancel keeps the row; OK removes it and totals decrease. | ☐ Pass ☐ Fail |
| 18 | List | Search / filter / sort | Search matches description or category (case-insensitive); category filter narrows results; all 4 sort options order correctly; header sort toggles direction; "Clear filters" restores defaults; result summary counts match. | ☐ Pass ☐ Fail |
| 19 | List | Pagination | With >25 entries: 25 rows per page, "Showing X–Y of Z", Prev disabled on page 1, Next disabled on last page, ellipsis renders, page resets to 1 on filter change. | ☐ Pass ☐ Fail |
| 20 | Chat | Expense chat (current month) | Send an example message → response lists parsed expenses + total; Undo removes the saved rows; chat hidden when viewing a past month; errors shown inline without crashing. | ☐ Pass ☐ Fail |

## Additional checks (run if time allows)

| # | Area | Test case | Steps / Expected result | Status |
|---|------|-----------|--------------------------|--------|
| A1 | Security | RLS isolation | Log in as user B → user A's expenses are never visible or editable. | ☐ Pass ☐ Fail |
| A2 | Security | Server action auth | Call add/update/delete while signed out → rejected ("You must be signed in."). | ☐ Pass ☐ Fail |
| A3 | Error state | Missing table | With `expenses` table absent, amber setup banner with SQL schema is shown instead of data sections. | ☐ Pass ☐ Fail |
| A4 | UI | Empty month | Month with no data → empty messages in list, chart, and categories; summary shows ₦0.00 and 0 transactions. | ☐ Pass ☐ Fail |
| A5 | UI | Dark mode | Toggle dark mode → all cards, chart, table, and badges remain readable with correct contrast. | ☐ Pass ☐ Fail |
| A6 | UI | Responsive | At 375px width → summary cards stack to 2 cols, table scrolls horizontally, no overlapping/overflow. | ☐ Pass ☐ Fail |
| A7 | UI | Accessibility | Inputs have labels, buttons have visible text/aria-labels, focus rings visible, table headers use `aria-sort`. | ☐ Pass ☐ Fail |
| A8 | Profile | Profile section | Name, email, date of birth, user ID, and member since render correctly; missing fields show "—". | ☐ Pass ☐ Fail |

**Sign-off:** ☐ All critical tests (1–20) passed  ☐ Known issues documented: ____________________
