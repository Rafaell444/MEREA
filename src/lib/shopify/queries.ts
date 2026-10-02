import { IN_CONTEXT } from "./client";

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 { amount currencyCode }
`;

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image { url altText width height }
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    availableForSale
    createdAt
    featuredImage { ...ImageFields }
    images(first: 4) { nodes { ...ImageFields } }
    priceRange { minVariantPrice { ...MoneyFields } maxVariantPrice { ...MoneyFields } }
    compareAtPriceRange { minVariantPrice { ...MoneyFields } maxVariantPrice { ...MoneyFields } }
    options { name values }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price { ...MoneyFields }
        compareAtPrice { ...MoneyFields }
        selectedOptions { name value }
      }
    }
    colorName: metafield(namespace: "custom", key: "color_name") { value }
    colorsCount: metafield(namespace: "custom", key: "colors_count") { value }
    modelCode: metafield(namespace: "custom", key: "model_code") { value }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const PRODUCT_FULL_FRAGMENT = /* GraphQL */ `
  fragment ProductFullFields on Product {
    ...ProductCardFields
    description
    descriptionHtml
    seo { title description }
    allImages: images(first: 12) { nodes { ...ImageFields } }
    allVariants: variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        quantityAvailable
        price { ...MoneyFields }
        compareAtPrice { ...MoneyFields }
        selectedOptions { name value }
        image { ...ImageFields }
      }
    }
    collections(first: 10) { nodes { handle title } }
    composition: metafield(namespace: "custom", key: "composition") { value }
    care: metafield(namespace: "custom", key: "care") { value }
    sizeGuide: metafield(namespace: "custom", key: "size_guide") { value }
    colorHex: metafield(namespace: "custom", key: "color_hex") { value }
    rating: metafield(namespace: "reviews", key: "rating") { value }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") { value }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_PRODUCT = /* GraphQL */ `
  query GetProduct($handle: String!) ${IN_CONTEXT} {
    product(handle: $handle) { ...ProductFullFields }
  }
  ${PRODUCT_FULL_FRAGMENT}
`;

/** Other colours of the same model are products sharing the same `model_code` metafield (or tag `model:<code>`). */
export const GET_SIBLINGS = /* GraphQL */ `
  query GetSiblings($query: String!) ${IN_CONTEXT} {
    products(first: 30, query: $query) {
      nodes {
        handle
        availableForSale
        featuredImage { ...ImageFields }
        colorName: metafield(namespace: "custom", key: "color_name") { value }
        colorHex: metafield(namespace: "custom", key: "color_hex") { value }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_PRODUCTS_BY_HANDLES = /* GraphQL */ `
  query GetProductsByHandles($query: String!, $first: Int!) ${IN_CONTEXT} {
    products(first: $first, query: $query) { nodes { ...ProductCardFields } }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_COLLECTION = /* GraphQL */ `
  query GetCollection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) ${IN_CONTEXT} {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { ...ImageFields }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        pageInfo { hasNextPage endCursor }
        filters {
          id
          label
          type
          values { id label count input swatch { color } }
        }
        nodes { ...ProductCardFields }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const SEARCH_PRODUCTS = /* GraphQL */ `
  query SearchProducts($query: String!, $first: Int!, $after: String, $sortKey: SearchSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) ${IN_CONTEXT} {
    search(query: $query, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, productFilters: $filters, types: PRODUCT) {
      totalCount
      pageInfo { hasNextPage endCursor }
      productFilters { id label type values { id label count input swatch { color } } }
      nodes { ... on Product { ...ProductCardFields } }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PREDICTIVE_SEARCH = /* GraphQL */ `
  query PredictiveSearch($query: String!) ${IN_CONTEXT} {
    predictiveSearch(query: $query, limit: 6, types: [PRODUCT, COLLECTION, QUERY]) {
      queries { text }
      collections { handle title }
      products { ...ProductCardFields }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_RECOMMENDATIONS = /* GraphQL */ `
  query GetRecommendations($productId: ID!) ${IN_CONTEXT} {
    productRecommendations(productId: $productId, intent: RELATED) { ...ProductCardFields }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const LIST_COLLECTIONS = /* GraphQL */ `
  query ListCollections($after: String) {
    collections(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { handle title }
    }
  }
`;

// ---------------- Cart ----------------
export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    discountCodes { code applicable }
    cost {
      subtotalAmount { ...MoneyFields }
      totalAmount { ...MoneyFields }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ...MoneyFields } subtotalAmount { ...MoneyFields } }
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            image { ...ImageFields }
            price { ...MoneyFields }
            compareAtPrice { ...MoneyFields }
            selectedOptions { name value }
            product {
              id handle title
              colorName: metafield(namespace: "custom", key: "color_name") { value }
            }
          }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput) ${IN_CONTEXT} {
    cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;
export const CART_GET = /* GraphQL */ `
  query CartGet($id: ID!) ${IN_CONTEXT} { cart(id: $id) { ...CartFields } }
  ${CART_FRAGMENT}
`;
export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) ${IN_CONTEXT} {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;
export const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) ${IN_CONTEXT} {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;
export const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) ${IN_CONTEXT} {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;
export const CART_DISCOUNT_UPDATE = /* GraphQL */ `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) ${IN_CONTEXT} {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { ...CartFields } userErrors { field message } }
  }
  ${CART_FRAGMENT}
`;

// ---------------- Customer (classic customer accounts) ----------------
export const CUSTOMER_ACCESS_TOKEN_CREATE = /* GraphQL */ `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;
export const CUSTOMER_CREATE = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) { customer { id } customerUserErrors { code field message } }
  }
`;
export const CUSTOMER_RECOVER = /* GraphQL */ `
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) { customerUserErrors { code field message } }
  }
`;
export const CUSTOMER_ACCESS_TOKEN_DELETE = /* GraphQL */ `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) { deletedAccessToken userErrors { field message } }
  }
`;
export const GET_CUSTOMER = /* GraphQL */ `
  query GetCustomer($token: String!) {
    customer(customerAccessToken: $token) { id email firstName lastName phone acceptsMarketing }
  }
`;
export const GET_CUSTOMER_ORDERS = /* GraphQL */ `
  query GetCustomerOrders($token: String!) ${IN_CONTEXT} {
    customer(customerAccessToken: $token) {
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          statusUrl
          totalPrice { ...MoneyFields }
          lineItems(first: 20) { nodes { title quantity variant { title image { url } } } }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

// ---------------- Customer account (profile, addresses, single order) ----------------
export const ADDRESS_FRAGMENT = /* GraphQL */ `
  fragment AddressFields on MailingAddress { id firstName lastName company address1 address2 city province zip country phone }
`;
export const GET_CUSTOMER_FULL = /* GraphQL */ `
  query GetCustomerFull($token: String!) {
    customer(customerAccessToken: $token) {
      id email firstName lastName phone acceptsMarketing
      defaultAddress { id }
      addresses(first: 20) { nodes { ...AddressFields } }
      birthday: metafield(namespace: "custom", key: "birthday") { value }
      gender: metafield(namespace: "custom", key: "gender") { value }
      bonusBalance: metafield(namespace: "loyalty", key: "balance") { value }
    }
  }
  ${ADDRESS_FRAGMENT}
`;
export const CUSTOMER_UPDATE = /* GraphQL */ `
  mutation CustomerUpdate($token: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $token, customer: $customer) {
      customer { id }
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;
export const ADDRESS_CREATE = /* GraphQL */ `
  mutation AddressCreate($token: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $token, address: $address) { customerAddress { id } customerUserErrors { message } }
  }
`;
export const ADDRESS_UPDATE = /* GraphQL */ `
  mutation AddressUpdate($token: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $token, id: $id, address: $address) { customerAddress { id } customerUserErrors { message } }
  }
`;
export const ADDRESS_DELETE = /* GraphQL */ `
  mutation AddressDelete($token: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $token, id: $id) { deletedCustomerAddressId customerUserErrors { message } }
  }
`;
export const DEFAULT_ADDRESS_UPDATE = /* GraphQL */ `
  mutation DefaultAddressUpdate($token: String!, $id: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $token, addressId: $id) { customer { id } customerUserErrors { message } }
  }
`;
export const GET_CUSTOMER_ORDER = /* GraphQL */ `
  query GetCustomerOrder($token: String!, $query: String!) ${IN_CONTEXT} {
    customer(customerAccessToken: $token) {
      orders(first: 1, query: $query) {
        nodes {
          id orderNumber processedAt financialStatus fulfillmentStatus statusUrl
          totalPrice { ...MoneyFields } subtotalPrice { ...MoneyFields } totalShippingPrice { ...MoneyFields }
          shippingAddress { ...AddressFields }
          successfulFulfillments(first: 3) { trackingCompany trackingInfo { number url } }
          lineItems(first: 50) { nodes { title quantity originalTotalPrice { ...MoneyFields } variant { title image { url } product { handle } } } }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${ADDRESS_FRAGMENT}
`;
