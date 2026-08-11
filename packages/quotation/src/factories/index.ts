import { Quote, type CreateQuoteProps } from "../aggregates/Quote/Quote.js";
import {
  QuoteVersion,
  type CreateQuoteVersionProps,
} from "../aggregates/QuoteVersion/QuoteVersion.js";
import {
  QuoteLine,
  type CreateQuoteLineProps,
} from "../aggregates/QuoteLine/QuoteLine.js";
import {
  QuoteApproval,
  type CreateQuoteApprovalProps,
} from "../aggregates/QuoteApproval/QuoteApproval.js";

export const QuoteFactory = {
  create: (props: CreateQuoteProps) => Quote.create(props),
  reconstitute: Quote.reconstitute.bind(Quote),
};

export const QuoteVersionFactory = {
  create: (props: CreateQuoteVersionProps) => QuoteVersion.create(props),
  reconstitute: QuoteVersion.reconstitute.bind(QuoteVersion),
};

export const QuoteLineFactory = {
  create: (props: CreateQuoteLineProps) => QuoteLine.create(props),
  reconstitute: QuoteLine.reconstitute.bind(QuoteLine),
};

export const QuoteApprovalFactory = {
  create: (props: CreateQuoteApprovalProps) => QuoteApproval.create(props),
  reconstitute: QuoteApproval.reconstitute.bind(QuoteApproval),
};
