import {
  InvoiceLineService,
  InvoiceService,
  type InvoiceServiceDeps,
} from "@creative-lab/billing";
import { asCustomerId, type CustomerRepository } from "@creative-lab/crm";
import { asDeliveryId, type DeliveryRepository } from "@creative-lab/delivery";
import { asProjectId, type ProjectRepository } from "@creative-lab/projects";
import type { CreateInvoiceCommand } from "../../commands/billing/CreateInvoiceCommand.js";
import type { InvoiceDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { InvoiceMapper } from "../../mappers/InvoiceMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateInvoiceHandlerDeps = Omit<InvoiceServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  customerRepository: CustomerRepository;
  projectRepository: ProjectRepository;
  deliveryRepository: DeliveryRepository;
};

export class CreateInvoiceHandler implements CommandHandler<CreateInvoiceCommand, InvoiceDto> {
  readonly commandType = "CreateInvoice" as const;
  private readonly invoiceService: InvoiceService;
  private readonly lineService: InvoiceLineService;
  private readonly customerRepository: CustomerRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly deliveryRepository: DeliveryRepository;

  constructor(deps: CreateInvoiceHandlerDeps) {
    const { customerRepository, projectRepository, deliveryRepository, eventPublisher, ...serviceDeps } = deps;
    this.invoiceService = new InvoiceService({ ...serviceDeps, eventPublisher });
    this.lineService = new InvoiceLineService({
      invoiceLineRepository: deps.invoiceLineRepository,
      invoiceRepository: deps.invoiceRepository,
      eventPublisher,
    });
    this.customerRepository = customerRepository;
    this.projectRepository = projectRepository;
    this.deliveryRepository = deliveryRepository;
  }

  async handle(command: CreateInvoiceCommand, context: ApplicationContext): Promise<InvoiceDto> {
    validateRequired(command, ["customerId", "projectId", "deliveryId"]);
    if (command.lines.length === 0) {
      throw new AuthorizationError();
    }

    const customer = await this.customerRepository.findById(asCustomerId(command.customerId));
    const project = await this.projectRepository.findById(asProjectId(command.projectId!));
    const delivery = await this.deliveryRepository.findById(asDeliveryId(command.deliveryId!));

    if (
      !customer || !project || !delivery ||
      String(customer.organizationId) !== String(context.organizationId) ||
      String(project.organizationId) !== String(context.organizationId) ||
      String(delivery.organizationId) !== String(context.organizationId) ||
      String(delivery.projectId) !== String(project.id)
    ) {
      throw new AuthorizationError();
    }

    const invoice = await this.invoiceService.create({
      organizationId: context.organizationId,
      projectId: asProjectId(command.projectId!),
      deliveryId: asDeliveryId(command.deliveryId!),
      customerId: customer.id,
      currency: command.currency,
      invoiceNumber: command.invoiceNumber,
    });

    for (const line of command.lines) {
      await this.lineService.add({
        organizationId: context.organizationId,
        invoiceId: invoice.id,
        description: line.description,
        quantity: line.quantity,
        unitPriceMinor: line.unitAmountMinor,
        currency: command.currency ?? invoice.currency.code,
      });
    }

    return InvoiceMapper.toDto(await this.invoiceService.getById(invoice.id));
  }
}
