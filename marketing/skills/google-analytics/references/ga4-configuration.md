# GA4 Configuration Reference

## Enhanced Measurement Events (Automatic)

| Event | Description | Configurable |
|-------|-------------|--------------|
| page_view | Page loads | Always on |
| scroll | 90% scroll depth | Toggle |
| outbound_click | External link clicks | Always on |
| site_search | Search queries | Set parameter name |
| video_engagement | YouTube video plays | Toggle |
| file_download | PDF, docs, etc. | Configure extensions |

## Recommended Events (Use Google's names when applicable)

**All properties**: login, sign_up, share, search
**E-commerce**: view_item, view_item_list, add_to_cart, remove_from_cart, begin_checkout, add_payment_info, purchase, refund

## Custom Events via gtag.js

```javascript
// Basic event
gtag('event', 'signup_completed', {
  'method': 'email',
  'plan': 'free'
});

// Event with value
gtag('event', 'purchase', {
  'transaction_id': 'T12345',
  'value': 99.99,
  'currency': 'USD',
  'items': [{ 'item_id': 'SKU123', 'item_name': 'Product', 'price': 99.99 }]
});

// User properties
gtag('set', 'user_properties', { 'user_type': 'premium', 'plan_name': 'pro' });

// User ID
gtag('config', 'GA_MEASUREMENT_ID', { 'user_id': 'USER_ID' });
```

## Custom Events via GTM (dataLayer)

```javascript
// Push event
dataLayer.push({
  'event': 'form_submitted',
  'form_name': 'contact',
  'form_location': 'footer'
});

// E-commerce — always clear before pushing
dataLayer.push({ ecommerce: null });
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'T12345',
    'value': 99.99,
    'currency': 'USD',
    'items': [{ 'item_id': 'SKU123', 'item_name': 'Product', 'price': 99.99, 'quantity': 1 }]
  }
});
```

## Custom Dimensions & Metrics

Create in: Admin → Data display → Custom definitions

| Scope | Use for | Example |
|-------|---------|---------|
| Event | Per-event attributes | content_type, form_name |
| User | Per-user attributes | user_type, plan_name |
| Item | Per-product attributes | item_category |

Parameter name must match what you send in the event.

## Conversions

1. Ensure event is firing (check DebugView)
2. Admin → Events → Mark as conversion
3. Set counting: "Once per session" (leads) or "Every event" (purchases)
4. Import to Google Ads for bid optimization

## Data Quality

- **Exclude internal traffic**: Admin → Data Streams → Configure tag settings → Define internal traffic
- **Cross-domain tracking**: Admin → Data Streams → Configure tag settings → List all domains
- **Data retention**: Set to 14 months (default is 2 months)
- **Session timeout**: Default 30 min (usually fine)

## Google Ads Integration

1. Admin → Product links → Google Ads links
2. Enable auto-tagging in Google Ads
3. Import GA4 conversions into Google Ads
4. Export audiences for remarketing
