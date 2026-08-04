# Lamora Home Care — Website

A single-page, accessibility-first website for Lamora Home Care.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page (hero, services, why us, request form, contact) |
| `styles.css` | All styling |
| `script.js` | Text-size buttons, mobile menu, form validation + email sending |
| `pics/` | Logo image |

## ⚠️ One step to finish: turn on the email

A website made of plain HTML files cannot send email on its own — it needs a
service to do the actual sending. This site uses **FormSubmit**, which is free
and needs no account.

**To activate it:**

1. Put the site online (see "Publishing" below) or open `index.html` in a browser.
2. Fill in the request form once and press **Send My Request**.
3. FormSubmit will email **lamorahomecare@gmail.com** a one-time confirmation link.
   Open that email and click the link.
4. Done. From then on, every request arrives in that inbox automatically, formatted
   as a table with the first name, last name, email, phone, service needed,
   preferred contact method, and the optional description.

If nothing arrives, check the Gmail **Spam** folder for the FormSubmit confirmation
and mark it as "Not spam".

### Changing the destination address

Edit one line near the top of `script.js`:

```js
var DESTINATION_EMAIL = 'lamorahomecare@gmail.com';
```

### Hiding the address from spam bots (optional, recommended)

Right now the Gmail address appears in `script.js`, where scrapers could find it.
FormSubmit can give you a random string to use instead:

1. Go to https://formsubmit.co and enter `lamorahomecare@gmail.com`.
2. Copy the random endpoint it gives you (e.g. `https://formsubmit.co/ajax/a1b2c3d4...`).
3. In `script.js`, replace the `FORM_ENDPOINT` line with that exact URL:
   ```js
   var FORM_ENDPOINT = 'https://formsubmit.co/ajax/YOUR-RANDOM-STRING';
   ```

### If you'd rather use a different service

The form posts plain JSON, so swapping is a one-line change to `FORM_ENDPOINT`.
Popular alternatives: **Web3Forms**, **Formspree**, **Getform**. All have free tiers.

### Safety net already built in

If the sending service is ever unreachable, the visitor sees a clear message with a
pre-filled email link, the phone number, and the email address — so a request is
never silently lost.

## Publishing

Any static host works. The simplest free options:

- **Netlify** — drag the `website` folder onto https://app.netlify.com/drop
- **GitHub Pages** — push this repo, then Settings → Pages → deploy from `main`
- **Cloudflare Pages** / **Vercel** — connect the repo, no build command needed

## Before going live — things to update

- **Business hours** in the Contact section of `index.html`, currently
  Monday to Friday, 9:00 AM to 5:00 PM.
- **Service address**, if you want one listed.

## Accessibility features

Built for older visitors and anyone using assistive technology:

- 20px base text, going up to 26px with the **Text size** buttons in the top bar
  (the choice is remembered on the next visit)
- Large tap targets: buttons and inputs are at least 56px tall
- High-contrast colors that pass WCAG AA
- Clear, always-visible focus rings for keyboard users
- "Skip to main content" link
- Labels always visible (never placeholder-only), with plain-language hints
- Errors written in full sentences, announced to screen readers, and focus jumps
  to the first field that needs attention
- Works fully by keyboard; respects the system "reduce motion" setting
- Readable when zoomed and on small phone screens
