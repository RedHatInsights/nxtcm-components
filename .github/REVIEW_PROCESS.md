# PR Review Process

## Overview

**All team members have the authority to add any reviewer they need for their PRs.**

All PRs require **2 approvals** to merge.

## 🎯 How to Request Reviews

### When Opening a PR

When you open a PR, CODEOWNERS automatically requests `@RedHatInsights/console-next` as a reviewer. For changes to the GitHub configuration it will require a review from `@RedHatInsights/console-next-admins`. 

You should still:
1. **Add reviewers manually** based on the expertise needed
2. **Use the "Reviewers" section** in the GitHub PR sidebar
3. **Tag people in comments** if you need specific input

### Choosing Reviewers

Consider adding reviewers who have:
- Expertise in the area you're changing
- Context on the feature or bug
- Architecture/design input needed
- Security/performance review capability

**There are no restrictions - add whoever makes sense for your PR!**

### Requesting QE/Manual Testing

**If you want QE to manually test your changes:**
- ✅ **Tag QE team members specifically** in the reviewers list
- ✅ **Comment in the PR** that you're requesting manual testing
- ✅ **Be explicit about what to test** - provide test scenarios or steps
- ✅ **Indicate if they need to pull locally** and test in their environment
- ✅ **Provide setup instructions** if there are any special requirements

**Example comment:**
```
@jloss-redhat - Could you please pull this locally and manually test the new wizard step? 
Specifically, I'd like you to verify:
1. The form validation works correctly
2. The submit button enables/disables as expected
3. Error messages display properly
```

## ✅ Best Practices

### For PR Authors

**DO:**
- ✅ Add at least 2 reviewers when opening a PR
- ✅ Add more reviewers if the change is complex or cross-cutting
- ✅ Tag specific people in comments for questions
- ✅ Be clear in the PR description about what kind of review you need
- ✅ Add reviewers who have context on the feature/area
- ✅ Ping people in Slack/chat if review is urgent

**DON'T:**
- ❌ Open a PR without any reviewers
- ❌ Only add one person for large/complex changes
- ❌ Wait indefinitely without follow-up if no one reviews

### For Reviewers

**DO:**
- ✅ Review PRs promptly when you're tagged
- ✅ Review other PRs even if not explicitly tagged (help the team!)
- ✅ Ask questions if something is unclear
- ✅ Suggest other reviewers if you think someone else should look
- ✅ Approve when you're satisfied (don't wait for "permission")

**DON'T:**
- ❌ Ignore review requests
- ❌ Only review PRs you're tagged on (be proactive!)
- ❌ Block PRs on minor style issues (suggest, don't demand)

## 🔄 Review Workflow

### Simple Changes
```
Small bug fix / style change / doc update
→ Add 2 reviewers with relevant context
→ Get approval
→ Merge
```

### Medium Changes
```
New component / refactor / feature addition
→ Add 2-3 reviewers (mix of expertise)
→ Address feedback
→ Get approvals
→ Merge
```

### Large/Complex Changes
```
Major refactor / architecture change / breaking changes
→ Add 3-4 reviewers (include maintainers)
→ Consider pre-review discussion
→ Multiple rounds of feedback expected
→ Get approvals from core maintainers
→ Merge
```


## 🚀 Tips for Fast Reviews

1. **Keep PRs small** - easier to review, faster to merge
2. **Write clear descriptions** - help reviewers understand context
3. **Add screenshots/videos** - for UI changes
4. **Tag people with specific questions** - "@kdoberst what do you think about this approach?"
5. **Use draft PRs** - for early feedback before formal review
6. **Follow up** - if no review after 24-48 hours, ping in chat
7. **Be responsive** - address feedback quickly to keep momentum

## 🤝 Team Culture

We trust each team member to:
- **Choose appropriate reviewers** for their changes
- **Review thoughtfully** when asked
- **Help each other** by reviewing proactively
- **Move quickly** on straightforward changes
- **Be thorough** on complex/risky changes
- **Communicate clearly** about expectations

## 💡 When in Doubt

- **Not sure who to add as reviewer?** → Ask in team chat in Slack #team-console-next or add 2-3 people
- **Need urgent review?** → Tag in PR + ping in Slack
- **Need manual/QE testing?** → Tag QE team members specifically and comment with test instructions
- **Big architectural decision?** → Add maintainers with architecture expertise
- **Need more eyes?** → Add more reviewers (there's no limit!)

---

**Remember**: The goal is to maintain code quality while moving quickly. Use good judgment, communicate clearly, and don't hesitate to ask for the reviews you need! 🚀

