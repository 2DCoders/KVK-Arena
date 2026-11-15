# Policy draft review

Prepared 15 November 2026 from the supplied `Untitled document.docx` and the Arena UI source. These are local drafts, not an approved legal agreement. No effective date or legal reviewer was supplied. All three pages show draft status.

## Supplied business facts

- KVK Arena; kvkarena.lk; 387 Galle Road, Colombo-04, Sri Lanka.
- info@kvkarena.lk; +94 76 560 5885.
- Bookings and memberships; Sri Lankan customers; no general age restriction specified.
- Non-refundable policy; promotional email/SMS; administrator access; retention described as “Lifetime”.

Most terms and refund questionnaire answers were blank. Draft language does not invent fixed cancellation deadlines, refund review periods, deductions, recurring payment permission or liability waivers.

## Evidence used for privacy wording

- `src/components/signup/gym/index.tsx`: name, email, phone, date of birth, gender, password, selected membership plan.
- `src/components/membership-registration/index.tsx`: name, contact details, gender, optional NIC.
- `src/client/pages/contact-us/index.tsx`: name, email and feedback.
- `src/services/payhere.ts` and checkout services: customer details, transaction references, amounts and payment confirmation.
- Member profile/header and checkout services: local storage for sign-in and pending payments; session storage for member badminton payment recovery.
- Promotional modal: local-storage preference.
- Map component and global CSS: OpenStreetMap, Cloudflare CDN and Google Fonts requests.

The questionnaire says “No” to cookies/tracking. The draft distinguishes browser storage and third-party requests from analytics; no analytics tracker was found in the reviewed UI. This is not an audit of backend infrastructure or provider behavior.

## Confirm before finalizing

- Replace indefinite lifetime retention with a confirmed, justified retention/deletion schedule. Do not present a new retention practice as implemented without operational confirmation.
- Confirm hosting, email/SMS providers, countries of processing, administrator/staff access and actual security controls. The frontend cannot establish these facts.
- Resolve the questionnaire's child-data answer against date-of-birth collection and the absence of a general minimum age.
- Confirm marketing subscription/consent and unsubscribe handling. Contact-based requests are described in the draft; no automated opt-out feature was added.
- Approve booking confirmation rules, late arrival, rescheduling, transfers, safety/supervision, damage charges, memberships and promotions.
- Approve handling for KVK cancellations/unavailable services, duplicate payments, incorrect charges and any mandatory remedies. Confirm refund method, timing and deductions before promising them.
- Confirm terms acceptance requirements, legal review and effective date. No new checkbox, checkout enforcement or payment behavior was introduced.

## Reference checks

- Sri Lanka DPA privacy notice: https://www.dpa.gov.lk/privacy-notice — retention tied to purpose; used to identify indefinite retention as a review item.
- Personal Data Protection (Amendment) Act No. 22 of 2025: https://www.parliament.lk/en/business-of-parliament/act-details/G6384 — avoid relying on outdated commencement statements.
- PayHere privacy: https://www.payhere.lk/privacy/
- PayHere terms: https://www.payhere.lk/legal/ — refund channel limitations depend on payment method.

These references inform the draft; they do not establish that KVK Arena has implemented any particular compliance practice.
