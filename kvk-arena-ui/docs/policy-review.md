# Policy draft review

Prepared 15 November 2026 from the supplied `Untitled document.docx` and the Arena UI source. The owner approved the confirmed wording to take effect upon publication. Public draft labels have been removed. Changes remain local until deployed; no independent legal review has been established.

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

- The owner confirmed indefinite retention with no scheduled deletion. The privacy draft now describes this current practice. Retention necessity and handling of legally required deletion remain review items; confirmation of current practice does not establish legal adequacy. No deletion schedule or automated deletion feature was implemented.
- The owner identified Cloudflare (frontend), MonsterASP (backend), Neon (database), and SMSLenz/Spacemail (messaging). SMSLenz is confirmed for SMS and Spacemail for email. Confirm countries of processing and actual security controls. The owner confirmed that internal customer-record access is restricted to administrators. The frontend cannot establish these facts.
- No general age limit and no current parental consent process are confirmed. The owner confirmed no formal activity-specific supervision requirements are currently in place. Review the actual approach to under-18 data and consent against applicable requirements before finalizing; accurate disclosure alone does not establish compliance. Do not claim that children?s information is never collected.
- Automatic promotional enrollment after registration or booking is confirmed. Administration manually removes or suppresses contact details from future promotional sends on email or phone request, as confirmed by the owner. Review the enrollment practice against applicable consent requirements; disclosure does not establish compliance. No automated opt-out feature was added.
- The owner confirmed that PayHere bookings and memberships are confirmed only after KVK?s system verifies successful payment. The owner confirmed that each promotional offer states eligibility, validity and inclusions, and that normal non-refundable and non-transferable rules apply. No formal activity-specific safety briefing, waiver or adult supervision requirements are currently in place, as confirmed by the owner. Rescheduling through administration and the late-arrival rule are confirmed below.
- Confirm operational handling of duplicate payments, incorrect charges and any mandatory remedies. The non-refundable policy does not remove legally required remedies.
- Confirm terms acceptance requirements, legal review and effective date. No new checkbox, checkout enforcement or payment behavior was introduced.

## Reference checks

- Sri Lanka DPA privacy notice: https://www.dpa.gov.lk/privacy-notice — retention tied to purpose; used to identify indefinite retention as a review item.
- Personal Data Protection (Amendment) Act No. 22 of 2025: https://www.parliament.lk/en/business-of-parliament/act-details/G6384 — avoid relying on outdated commencement statements.
- PayHere privacy: https://www.payhere.lk/privacy/
- PayHere terms: https://www.payhere.lk/legal/ — refund channel limitations depend on payment method.

These references inform the draft; they do not establish that KVK Arena has implemented any particular compliance practice.

## Confirmed refund and rescheduling decision

The owner confirmed that payments are non-refundable for any reason and customers may reschedule through administration. No discretionary refund timelines apply. The refund page and related terms now reflect that decision, including KVK cancellations, while preserving remedies that cannot lawfully be excluded. Rescheduling requires administrator confirmation and availability; no notice period or fee has been invented. This confirmation does not resolve the remaining privacy or effective-date questions.

## Confirmed late-arrival decision

Customers must stay within their booked slot. Late arrivals do not extend the original end time, and no extra time is added. The terms now state this rule alongside the non-refundable policy.

## Confirmed transfer decision

Bookings and memberships cannot be transferred to another person. The terms now state this restriction in both the booking rules and membership section.

## Confirmed membership expiry decision

Membership access ends at the purchased plan expiry date and customers must renew to continue membership benefits. This does not establish automatic renewal. The owner subsequently confirmed that memberships cannot be paused or frozen and the original expiry date remains unchanged, including during non-use.

## Confirmed membership pause decision

No pauses or freezes are allowed. The original membership expiry date stays unchanged. This rule is now included in the membership terms.

## Confirmed service refusal and account suspension decision

Administration decides each case individually and specifies the reason to the affected customer. The terms do not introduce automatic suspension triggers. Customers may contact administration about a restriction or concern.

## Confirmed damage handling decision

For damage caused by misuse, administration reviews the incident and explains any repair or replacement charge to the customer. No fixed charge, automatic payment deduction or new payment authorization is introduced.

## Confirmed age decision

The owner confirmed no general age limit. Terms reflect this and privacy wording acknowledges that registration may include information about under-18s. This supersedes the questionnaire statement that children?s information is not collected. No parental consent workflow or supervision requirement has been assumed or implemented.

## Confirmed parental consent practice

The owner confirmed that KVK currently has no parental consent process. The privacy draft now discloses that consent is not obtained or verified as part of registration or booking. This records current practice; it does not establish legal adequacy or implement a consent workflow. The owner subsequently confirmed no formal activity-specific supervision requirements are currently in place.

## Confirmed promotional enrollment practice

The owner confirmed that registration or booking automatically adds customers to promotional email/SMS communications. The privacy draft describes this practice without claiming explicit opt-in. The owner subsequently confirmed manual opt-out processing by administration on email or phone request. No subscription, consent or messaging behavior was changed in code.

## Confirmed promotional opt-out practice

Administration manually removes or suppresses a customer?s contact details from future promotional sends when requested by email or phone. The privacy policy now states this procedure and distinguishes promotional messages from necessary booking, payment and account communications. No automated unsubscribe workflow or response deadline has been introduced.

## Confirmed customer-record retention practice

The owner confirmed that customer records are kept without deletion. The privacy draft now states indefinite retention and no scheduled deletion process. Access, correction, deletion and privacy requests remain contact-based; no automatic deletion or guaranteed deletion outcome is promised. Retention adequacy remains a separate review item. The owner subsequently confirmed that administration manually reviews and responds to access, correction and deletion requests received by email or phone.

## Confirmed privacy request handling

Administration manually reviews and responds to customer requests for access, correction or deletion received by email or phone. The privacy policy now states this practice. No automatic deletion, guaranteed deletion outcome or response deadline is promised.

## Confirmed internal access rule

Only KVK Arena administrators may access customer records internally. The privacy policy now states this restriction. This records the owner-confirmed access rule; backend role permissions have not been audited or changed. External provider processing remains described separately.

## Confirmed infrastructure and messaging providers

The owner identified Cloudflare for frontend hosting, MonsterASP for backend hosting, Neon for the database, and SMSLenz and Spacemail for messaging. The owner subsequently clarified that SMSLenz handles SMS and Spacemail handles email. Provider names have been added to the privacy draft without assuming hosting regions, exclusive Sri Lankan processing, or specific provider security controls.

## Hosting-region evidence checked

Repository backend configuration contains Neon region identifier `ap-southeast-1`, which Neon identifies as Singapore (https://neon.com/demos/regional-latency). This is configuration evidence, not verification of live production settings. MonsterASP offers Europe and USA datacenters (https://help.monsterasp.net/domains-https/domains/new-website-for-domain); the selected production datacenter was not established from the reviewed configuration. Do not infer it from the provider?s default or headquarters. The public draft now explains that provider processing may occur outside Sri Lanka without asserting unverified exact production locations. The owner confirmed SMSLenz for SMS and Spacemail for email.

## Confirmed current safety procedures

The owner answered ?not yet? when asked about safety briefings, signed waivers and adult supervision requirements. Terms and privacy wording now describe the absence of formal activity-specific requirements rather than implying an existing procedure. General staff directions and careful equipment use remain in the terms. This records current practice; it does not assess the adequacy of facility safety arrangements.

## Confirmed promotional offer rules

Each promotional offer states its eligibility, validity dates and inclusions. Normal non-refundable and non-transferable rules apply to promotional bookings and memberships, subject to mandatory rights. These rules are now included in the terms. No separate voucher conditions were assumed.

## Confirmed payment confirmation rule

The owner confirmed that PayHere bookings and memberships require successful payment verification by KVK?s system before confirmation. Terms now state this explicitly. This matches the previously reviewed checkout behavior; payment handling code was not changed for this wording update.

## Confirmed currency and total disclosure

The owner confirmed that website booking and membership prices are charged in LKR and that the full payable total is shown before payment. Terms now state these facts. This wording update does not change checkout pricing or verify every live price display.

## Confirmed registered business name

The owner confirmed that KVK Arena is the exact registered business name on the business registration and PayHere application. Privacy and terms wording now explicitly identifies it as the registered business name. Registration documents and the PayHere account were not independently inspected.

## Publication approval and remaining verification

The owner approved effectiveness upon publication. Public pages now state this, retain the revision date, and no longer display draft notices or internal review language. This is not a deployment record. Remaining checks include production hosting regions, actual access controls and security, live pricing and policy links, and legal adequacy of the confirmed retention, marketing and under-18 practices.
