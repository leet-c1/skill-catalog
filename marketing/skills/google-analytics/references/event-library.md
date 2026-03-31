# GA4 Event Library

Quick reference for standard events by business context. Use object_action naming (lowercase, underscores).

## Marketing Site

| Event | Properties | Trigger |
|-------|------------|---------|
| cta_clicked | button_text, cta_location, page | CTA click |
| form_started | form_name, form_location | User focuses first field |
| form_submitted | form_name, form_location | Successful submit |
| form_error | form_name, error_type | Validation failure |
| signup_started | source, page | Signup initiated |
| signup_completed | method, plan, source | Signup finished |
| demo_requested | company_size, industry | Demo form submitted |
| contact_submitted | inquiry_type | Contact form sent |
| newsletter_subscribed | source, list_name | Email list signup |
| trial_started | plan, source | Trial begins |
| resource_downloaded | resource_name, resource_type | Asset download |
| video_played | video_id, video_title, duration | Video starts |
| video_completed | video_id, video_title, duration | Video finishes |
| pricing_viewed | source | Pricing page load |

## Product / App

### Onboarding
| Event | Properties |
|-------|------------|
| onboarding_started | — |
| onboarding_step_completed | step_number, step_name |
| onboarding_completed | steps_completed, time_to_complete |
| onboarding_skipped | step_skipped_at |
| first_key_action_completed | action_type |

### Core Usage
| Event | Properties |
|-------|------------|
| feature_used | feature_name, feature_category |
| action_completed | action_type, count |
| content_created | content_type |
| content_edited | content_type |
| search_performed | query, results_count |
| settings_changed | setting_name, new_value |
| invite_sent | invite_type, count |

### Errors & Support
| Event | Properties |
|-------|------------|
| error_occurred | error_type, error_message, page |
| help_opened | help_type, page |
| support_contacted | contact_method, issue_type |
| feedback_submitted | feedback_type, rating |

## Monetization

### Checkout
| Event | Properties |
|-------|------------|
| plan_selected | plan_name, billing_cycle |
| checkout_started | plan, value |
| payment_info_entered | payment_method |
| purchase_completed | plan, value, currency, transaction_id |
| purchase_failed | error_reason, plan |

### Subscriptions
| Event | Properties |
|-------|------------|
| trial_started | plan, trial_length |
| trial_ended | plan, converted |
| subscription_upgraded | from_plan, to_plan, value |
| subscription_downgraded | from_plan, to_plan |
| subscription_cancelled | plan, reason, tenure |
| subscription_renewed | plan, value |

## E-commerce

### Browsing & Cart
| Event | Properties |
|-------|------------|
| product_viewed | product_id, product_name, category, price |
| product_list_viewed | list_name, products[] |
| product_added_to_cart | product_id, product_name, price, quantity |
| product_removed_from_cart | product_id, product_name, price, quantity |
| cart_viewed | cart_value, items_count |

### Checkout & Post-Purchase
| Event | Properties |
|-------|------------|
| checkout_started | cart_value, items_count |
| checkout_step_completed | step_number, step_name |
| coupon_applied | coupon_code, discount_value |
| purchase_completed | transaction_id, value, currency, items[] |
| refund_requested | transaction_id, reason |
| review_submitted | product_id, rating |

## B2B / SaaS

| Event | Properties |
|-------|------------|
| team_created | team_size, plan |
| team_member_invited | role, invite_method |
| team_member_joined | role |
| integration_connected | integration_name |
| integration_disconnected | integration_name, reason |
| account_upgraded | from_plan, to_plan |
| account_churned | reason, tenure, mrr_lost |

## Standard Properties (include on all relevant events)

| Category | Properties |
|----------|------------|
| Page | page_title, page_location, page_referrer |
| User | user_id, user_type, plan_type, account_id |
| Campaign | source, medium, campaign, content, term |
| Product | product_id, product_name, category, price, currency |

## Funnel Sequences

**Signup**: signup_started → signup_step_completed → signup_completed → onboarding_started
**Purchase**: pricing_viewed → plan_selected → checkout_started → payment_info_entered → purchase_completed
**E-commerce**: product_viewed → product_added_to_cart → cart_viewed → checkout_started → purchase_completed
