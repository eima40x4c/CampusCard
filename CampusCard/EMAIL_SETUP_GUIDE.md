# Email Verification Setup Guide

This guide explains how to configure and use the email verification feature in CampusCard.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Testing Mode (Current Setup)](#testing-mode-current-setup)
3. [Production Setup](#production-setup)
4. [Email Flow](#email-flow)
5. [Configuration Options](#configuration-options)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The email verification system allows admins to verify that users own their registered email addresses before approving their accounts.

**Two Modes:**

- **Testing Mode** (`app.testing.mode=true`): API returns token for manual verification
- **Production Mode** (`app.testing.mode=false`): Sends real emails, no token returned

---

## Testing Mode (Current Setup) ✅

**Current configuration in `application.properties`:**

```properties
app.testing.mode=true
```

### How it works:

1. **Admin sends verification:**

```bash
POST /api/admin/users/5/send-verification
```

2. **Response includes token:**

```json
{
  "message": "Verification email sent (testing mode)",
  "token": "a7b8c9d0-1234-5678-90ab-cdef12345678",
  "userId": 5
}
```

3. **Admin manually verifies:**

```bash
POST /api/admin/users/5/verify-email/a7b8c9d0-1234-5678-90ab-cdef12345678
```

**No email configuration needed!** Perfect for local development.

---

## Production Setup 🚀

### Step 1: Configure Email Server

Choose one of these options and add to `application.properties`:

#### Option A: Gmail (Recommended for testing)

```properties
# Enable email sending
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Set production mode
app.testing.mode=false
app.frontend.url=https://yourfrontend.com
```

**Get Gmail App Password:**

1. Enable 2-Step Verification in Google Account
2. Go to: Security → 2-Step Verification → App passwords
3. Generate password and use it (NOT your regular password)

#### Option B: Microsoft 365 / Outlook

```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### Option C: Custom SMTP Server

```properties
spring.mail.host=smtp.yourdomain.com
spring.mail.port=587
spring.mail.username=noreply@yourdomain.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Step 2: Update Configuration

Edit `application.properties`:

```properties
# Set production mode
app.testing.mode=false

# Set your frontend URL
app.frontend.url=https://yourfrontend.com
```

### Step 3: Rebuild Project

```bash
mvn clean install
```

### Step 4: Deploy

Now when deployed, emails will be sent automatically!

---

## Email Flow

### Testing Mode Flow (Current)

```
Admin                    Backend
  |                         |
  |--[1] Send Verification->|
  |                         |
  |<--[2] Token Returned----|
  |                         |
  |--[3] Manual Verify----->|
  |       with token        |
  |                         |
```

### Production Mode Flow

```
Admin          Backend          User          Frontend
  |               |               |               |
  |--[1] Send---->|               |               |
  |               |--[2] Email--->|               |
  |               |               |               |
  |<--[3] OK------|               |               |
  |               |               |--[4] Clicks-->|
  |               |               |     Link      |
  |               |<--[5] Verify--|               |
  |               |               |               |
```

**Email contains link:**

```
https://yourfrontend.com/verify?token=abc123&userId=5
```

**Frontend calls:**

```javascript
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const userId = params.get("userId");

await fetch(`/api/admin/users/${userId}/verify-email/${token}`, {
  method: "POST",
});
```

---

## Configuration Options

### Environment Variables (Recommended for Production)

Instead of hardcoding in `application.properties`, use environment variables:

```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
app.frontend.url=${FRONTEND_URL}
app.testing.mode=${TESTING_MODE:false}
```

**Set in deployment:**

```bash
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-app-password"
export FRONTEND_URL="https://yourfrontend.com"
export TESTING_MODE="false"
```

### Profile-Based Configuration

Create `application-prod.properties` for production:

```properties
# application-prod.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.frontend.url=https://yourfrontend.com
app.testing.mode=false
```

**Run with profile:**

```bash
java -jar campuscard.jar --spring.profiles.active=prod
```

**Add to `.gitignore`:**

```
application-prod.properties
```

---

## Troubleshooting

### Issue: "Failed to send verification email"

**Solution:**

- Check SMTP credentials
- Verify Gmail app password (not regular password)
- Check firewall/network allows port 587
- Enable "Less secure app access" if using regular Gmail password (not recommended)

### Issue: "Authentication failed"

**Solution:**

- For Gmail: Use app password, not account password
- For Outlook: Enable SMTP in account settings
- Verify username includes full email address

### Issue: Emails not arriving

**Solution:**

- Check spam/junk folder
- Verify `spring.mail.username` is correct
- Test with a different email provider
- Check email server logs

### Issue: Testing mode not working

**Solution:**

- Verify `app.testing.mode=true` in application.properties
- Restart application after changing config
- Check AdminController has `@Value("${app.testing.mode:true}")`

### Testing Email Configuration

Add this test endpoint to verify email works:

```java
@PostMapping("/test-email")
public ResponseEntity<?> testEmail(@RequestParam String toEmail) {
    try {
        emailService.sendVerificationEmail(toEmail, 999, "test-token");
        return ResponseEntity.ok("Email sent successfully");
    } catch (Exception e) {
        return ResponseEntity.status(500)
            .body("Failed: " + e.getMessage());
    }
}
```

---

## Quick Reference

### Switch to Testing Mode

```properties
app.testing.mode=true
```

Restart app → Token returned in API response

### Switch to Production Mode

```properties
app.testing.mode=false
# + configure spring.mail.* properties
```

Restart app → Real emails sent

### Check Current Mode

Look at API response:

- Testing: `"message": "Verification email sent (testing mode)"`
- Production: `"message": "Verification email sent successfully"`

---

## Security Best Practices

1. ✅ **Never commit credentials**

   - Use environment variables
   - Add `application-prod.properties` to `.gitignore`

2. ✅ **Use app passwords**

   - Not your regular email password
   - Revoke if compromised

3. ✅ **Separate environments**

   - Development: testing mode
   - Staging: production mode with test emails
   - Production: production mode with real domain

4. ✅ **Monitor email delivery**
   - Log email sending attempts
   - Track verification rates
   - Set up alerts for failures

---

## Summary

| Mode                 | Token Returned | Email Sent          | Use Case             |
| -------------------- | -------------- | ------------------- | -------------------- |
| Testing (`true`)     | ✅ Yes         | ⚠️ Tries (may fail) | Local development    |
| Production (`false`) | ❌ No          | ✅ Yes              | Deployed environment |

**Current Setup:** Testing mode ✅  
**To Deploy:** Configure SMTP + set `app.testing.mode=false` 🚀
