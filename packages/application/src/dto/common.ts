export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  status: string;
  displayName: string;
  timezone: string;
  locale: string;
  currency: string;
};

export type ProjectDto = {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  ownerId: string;
  description: string | null;
};

export type CustomerDto = {
  id: string;
  organizationId: string;
  customerNumber: string;
  name: string;
  legalName: string | null;
  status: string;
  industry: string | null;
  billingAddress: string | null;
};

export type ContactDto = {
  id: string;
  organizationId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  status: string;
};

export type ServiceCategoryDto = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: string;
};

export type ServiceDto = {
  id: string;
  organizationId: string;
  serviceCode: string;
  name: string;
  description: string | null;
  categoryId: string;
  defaultPriceBookId: string | null;
  pricingModel: string;
  status: string;
};

export type InvoiceDto = {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  status: string;
  currency: string;
  projectId: string;
};

export type QuoteDto = {
  id: string;
  organizationId: string;
  quoteNumber: string;
  customerId: string;
  opportunityId: string | null;
  status: string;
  currency: string;
  currentVersionId: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractDto = {
  id: string;
  organizationId: string;
  contractNumber: string;
  customerId: string;
  status: string;
  quotationId: string;
  effectiveDate: string;
  expiryDate: string | null;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EngagementDto = {
  id: string;
  organizationId: string;
  engagementNumber: string;
  customerId: string;
  contractId: string;
  status: string;
};

export type PortfolioDto = {
  id: string;
  organizationId: string;
  portfolioNumber: string;
  name: string;
  status: string;
  startDate: string;
};

export type KnowledgeArticleDto = {
  id: string;
  organizationId: string;
  articleNumber: string;
  title: string;
  status: string;
  categoryId: string;
};

export type AssetDto = {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  projectId: string | null;
};

export type ProductionDto = {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  projectId: string;
};

export type ReviewDto = {
  id: string;
  organizationId: string;
  title: string;
  status: string;
  projectId: string;
};

export type DeliveryDto = {
  id: string;
  organizationId: string;
  status: string;
  projectId: string;
};
