# SkillArena Launch Checklist

## Auth
- [ ] Email signup works on production
- [ ] Email login works on production
- [ ] Google OAuth works on production
- [ ] GitHub OAuth works on production
- [ ] Password reset email sends correctly
- [ ] Session persists across page refreshes

## Core Features
- [ ] Dashboard loads with correct user data
- [ ] Mock test can be started and submitted
- [ ] Test result page shows correct score and percentile
- [ ] Notifications page loads without token error
- [ ] Settings page saves profile correctly
- [ ] Billing page shows correct plan and usage
- [ ] Hackathon arena loads and accepts code submissions
- [ ] Interview room loads with video and editor

## Payments
- [ ] Stripe test payment goes through (use card 4242 4242 4242 4242)
- [ ] Plan upgrades correctly after payment webhook
- [ ] Webhook updates user plan in DB
- [ ] Subscription cancellation works
- [ ] Billing portal opens correctly

## Integrations
- [ ] Cloudinary avatar upload works (max 2MB)
- [ ] Resume PDF upload works (max 5MB)
- [ ] Resend email sends on signup/password reset
- [ ] Judge0 code execution returns verdict
- [ ] Daily.co video iframe loads in interview room

## UI/UX
- [ ] Dark mode works on production
- [ ] Dark mode preference persists across sessions
- [ ] Mobile layout correct on real device (iOS + Android)
- [ ] Bottom tab bar shows on mobile
- [ ] No console errors on any page
- [ ] All loading skeletons show correctly
- [ ] Toast notifications appear bottom-right
- [ ] Framer Motion animations play correctly

## Security
- [ ] No API keys visible in frontend source (check DevTools → Sources)
- [ ] .env not pushed to GitHub (check repo files)
- [ ] Auth middleware protecting all private routes
- [ ] Rate limiting active on API (test with rapid requests)
- [ ] CORS only allows production frontend URL
- [ ] Stripe webhook signature verified

## Performance
- [ ] Lighthouse score > 80 on homepage
- [ ] No layout shift on page load
- [ ] Images served from Cloudinary CDN
- [ ] API response times < 500ms

## SEO
- [ ] og:title and og:description on all public pages
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt
- [ ] Favicon shows correctly in browser tab
