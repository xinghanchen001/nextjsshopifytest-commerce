Customizable Hat Module - Product Requirements Document

1. Overview

Objective:
Build a customization module in our Next.js website allowing users to personalize a hat by entering up to two lines of text. The user can also select hat color, style, and size from preset options. Once the user finalizes the design, the order (with all variant and text details) will be created in Shopify under a single, fixed-price product.

⸻

2. Shopify Product Setup

   1. Create One Product in Shopify
      • Name: "Customizable Hat"
      • Base Price: $50 (example)
      • No additional cost for text customization.
   2. Variants
      • Color (e.g., Red, Blue, Black, etc.)
      • Style (e.g., Classic Cap, Trucker Cap)
      • Size (e.g., S, M, L, XL or "One Size Fits All")
   3. Line Item Properties (Custom Fields)
      • Text Line 1 (Required, up to X characters)
      • Text Line 2 (Optional, up to X characters)

   Note: These fields allow you to capture user-specific data in Shopify without needing separate products for each variation of text.

⸻

3. Front-End Customization Flow (Next.js)
   1. Customization Page / Dialog
      • When a user clicks "Customize," a dedicated page or pop-up appears showing:
      • A hat preview that updates color/style/size in real time.
      • Two text input fields for lines of text.
   2. Text Fields
      • Each field can accept a fixed maximum number of characters (e.g., 20 per line).
      • Font, size, and line spacing are predefined and fixed to maintain design consistency.
   3. Real-Time Preview
      • As the user types text into each field, the hat preview displays the text in the correct position, font, and size.
      • Changing color, style, or size updates the hat image while preserving the text overlay.
   4. Add to Cart / Submit
      • Once the user is satisfied, they click "Add to Cart" (or "Save & Checkout").
      • All chosen details—color, style, size, line 1 text, line 2 text—are sent to Shopify.

⸻

4. Data Flow & Integration
   1. Passing Data to Shopify
      • Variants: Map color/style/size to the corresponding variant.
      • Line Item Properties:
      • line1_text: user's first line
      • line2_text: user's second line (if any)
   2. Shopify Order Creation
      • The single "Customizable Hat" product is added to the user's cart.
      • The user completes the checkout process.
      • Shopify order details show:
      • Product: "Customizable Hat" ($50)
      • Variant: e.g., "Blue, Classic Cap, Size M"
      • Line item properties: e.g., line1_text: "HELLO", line2_text: "WORLD"
   3. Fulfillment
      • Your fulfillment team sees the hat variant and custom text in Shopify.
      • They print or embroider the hat with the provided text.

⸻

5. Functional Requirements
   1. Fixed Pricing
      • $50 (example) for any combination of color, style, and two lines of text.
   2. Two Lines of Text
      • Line 1: Mandatory.
      • Line 2: Optional.
      • Predefined font, size, spacing.
   3. Hat Preview
      • Must dynamically reflect the user's color and style choice.
      • The text overlay updates as the user types.
   4. Responsive & Accessible
      • Must work smoothly on desktop and mobile.
      • Provide clear labels for text fields (e.g., "Line 1," "Line 2").

⸻

6. Non-Functional Requirements
   • Performance:
   • The customization page should load quickly and update previews with minimal delay.
   • Security & Privacy:
   • No sensitive data is collected, only text. Standard Shopify security applies.
   • Maintainability:
   • Code structure should allow easy addition of new hat styles or color options in the future.

⸻

7. Implementation Considerations
   1. Preview Rendering
      • Use a front-end technique (e.g., HTML/CSS layering or canvas-based rendering) to overlay text on a hat image.
   2. Shopify API or Storefront SDK
      • Use Shopify's storefront API or Buy SDK to add the product to the cart with the correct variant and line item properties.
   3. Text Validation
      • Limit character count or enforce certain constraints (e.g., no emojis, no special characters) if needed.
   4. Edge Cases
      • No text entered in the second line.
      • Long text that might exceed hat preview boundaries.
      • Users who skip customization but still want to buy the hat.

⸻

8. User Flow Summary
   1. User lands on product page
   2. Clicks "Customize" → opens customization interface
   3. Selects color/style/size
   4. Types text in Line 1 (mandatory) and Line 2 (optional)
   5. Real-time preview updates
   6. Clicks "Add to Cart" → data is passed to Shopify
   7. Completes checkout → order is created in Shopify with variant & text details

⸻

9. Implementation Plan

   1. Backend Updates
      a. Shopify GraphQL API Integration
      • Update cart mutations to include line item properties
      • Modify the addToCart and createCart functions to accept customization text
      • Update cart fragment to include line item properties in the response
      b. Types and Interfaces
      • Extend CartLineInput type to include customAttributes
      • Add customization text types to the product context

   2. Frontend Components
      a. Customization Modal/Page
      • Create a new CustomizeHat component
      • Implement a modal dialog or dedicated page for customization
      • Add state management for text inputs and validation
      b. Text Input Fields
      • Create TextCustomizationInput component with character limits
      • Implement validation for required first line
      • Add character counter and error states
      c. Hat Preview Component
      • Create HatPreview component that displays the selected hat variant
      • Implement text overlay positioning based on hat style
      • Add dynamic text rendering with proper font styling

   3. Product Context Extensions
      a. State Management
      • Extend ProductContext to include customization text state
      • Add methods for updating text lines
      • Persist customization data in URL parameters or local storage
      b. Cart Integration
      • Modify AddToCart component to include customization data
      • Update cart actions to pass line item properties to Shopify

   4. Assets and Resources
      a. Hat Images
      • Prepare base hat images for each color and style variant
      • Ensure consistent positioning for text overlay
      • Create placeholder images for the customization preview
      b. Font Selection
      • Select and implement appropriate fonts for hat customization
      • Ensure fonts are web-safe or properly loaded

   5. Testing Plan
      a. Unit Tests
      • Test text validation logic
      • Test cart operations with line item properties
      b. Integration Tests
      • Test end-to-end flow from customization to checkout
      • Verify line item properties are correctly passed to Shopify
      c. UI/UX Testing
      • Test responsive design on various devices
      • Verify accessibility compliance

   6. Deployment Strategy
      a. Phased Rollout
      • Deploy backend changes first
      • Release frontend components with feature flags
      • Monitor performance and user feedback
      b. Documentation
      • Update internal documentation for fulfillment team
      • Create user guide for the customization feature
