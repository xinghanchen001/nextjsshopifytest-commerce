/**
 * Represents text customization for a product
 */
export type TextCustomization = {
  /**
   * First line of text (required)
   */
  line1: string;

  /**
   * Second line of text (optional)
   */
  line2?: string;
};

/**
 * Represents complete hat customization including variant options
 */
export type HatCustomization = TextCustomization & {
  /**
   * Selected hat color
   */
  color: string;

  /**
   * Selected hat style
   */
  style: string;

  /**
   * Selected hat size
   */
  size: string;
};

/**
 * Represents line item properties for Shopify cart
 */
export type CustomizationAttributes = {
  key: string;
  value: string;
}[];

/**
 * Converts TextCustomization to Shopify line item attributes
 * @param customization The text customization to convert
 * @returns Array of key-value attributes for Shopify
 */
export function textCustomizationToAttributes(
  customization: TextCustomization
): CustomizationAttributes {
  const attributes: CustomizationAttributes = [
    { key: 'line1_text', value: customization.line1 },
  ];

  if (customization.line2) {
    attributes.push({ key: 'line2_text', value: customization.line2 });
  }

  return attributes;
}
