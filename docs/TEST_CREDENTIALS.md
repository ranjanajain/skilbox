# Skilling in a Box - Test Credentials Quick Reference

## Portal Access
- **URL:** http://localhost:3000
- **API:** http://localhost:8001/api

---

## Test Accounts

### 🟡 ADMIN (Full Access)
```
Email:    admin@skillingbox.com
Password: admin123
```
**Can do:** Everything - user management, content, analytics, approvals

---

### 🔵 CONTENT ADMIN
```
Email:    content.admin@test.com
Password: ContentAdmin123
```
**Can do:** Create/manage courses, upload content, browse courses

---

### 🟣 MS STAKEHOLDER
```
Email:    ms.stakeholder@test.com
Password: MSStakeholder123
```
**Can do:** View analytics, approve users, view all executions, browse courses

---

### 🟢 TRAINING PARTNER (Approved)
```
Email:    partner.approved@test.com
Password: Partner123
```
**Can do:** Browse courses, download content, schedule executions, submit attendance

---

### 🔴 TRAINING PARTNER (Pending)
```
Email:    partner.pending@test.com
Password: Partner123
```
**Can do:** Browse courses only (cannot download until approved)

---

## Quick Test Scenarios

| Test | Login As | Action |
|------|----------|--------|
| Login works | Any user | Enter credentials, click Sign In |
| Create course | Admin or Content Admin | Upload Content → Create New Course |
| Download file | partner.approved@test.com | Browse Courses → View Details → Download |
| Blocked download | partner.pending@test.com | Browse Courses → View Details → See pending message |
| Approve user | admin@skillingbox.com | User Management → Find pending user → Approve |
| View analytics | admin or ms.stakeholder | Analytics → View stats |
| Schedule execution | partner.approved@test.com | My Executions → Schedule |

---

## API Health Check
```bash
curl http://localhost:8001/api/health
```

## Login via API
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillingbox.com","password":"admin123"}'
```

---

## Notes for Testers

1. **First Login:** Users must accept Terms of Use on first login
2. **Portal-Level Access:** Once approved, partners can download ALL content
3. **Last Updated:** Shows in course details, updates when files are uploaded
4. **Role Changes:** Take effect immediately when admin changes a user's role
