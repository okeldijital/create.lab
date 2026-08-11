import {
  Contract,
  type CreateContractProps,
} from "../aggregates/Contract/Contract.js";
import {
  ContractVersion,
  type CreateContractVersionProps,
} from "../aggregates/ContractVersion/ContractVersion.js";
import {
  ContractTerm,
  type CreateContractTermProps,
} from "../aggregates/ContractTerm/ContractTerm.js";
import {
  ContractAmendment,
  type CreateContractAmendmentProps,
} from "../aggregates/ContractAmendment/ContractAmendment.js";

export const ContractFactory = {
  create: (props: CreateContractProps) => Contract.create(props),
  reconstitute: Contract.reconstitute.bind(Contract),
};

export const ContractVersionFactory = {
  create: (props: CreateContractVersionProps) =>
    ContractVersion.create(props),
  reconstitute: ContractVersion.reconstitute.bind(ContractVersion),
};

export const ContractTermFactory = {
  create: (props: CreateContractTermProps) => ContractTerm.create(props),
  reconstitute: ContractTerm.reconstitute.bind(ContractTerm),
};

export const ContractAmendmentFactory = {
  create: (props: CreateContractAmendmentProps) =>
    ContractAmendment.create(props),
  reconstitute: ContractAmendment.reconstitute.bind(ContractAmendment),
};
