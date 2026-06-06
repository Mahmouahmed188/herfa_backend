export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  AWAITING_EVIDENCE = 'awaiting_evidence',
  RESOLVED_CUSTOMER = 'resolved_customer',
  RESOLVED_PROVIDER = 'resolved_provider',
  CLOSED = 'closed',
}

export const DISPUTE_STATUS_TRANSITIONS: Record<
  DisputeStatus,
  DisputeStatus[]
> = {
  [DisputeStatus.OPEN]: [DisputeStatus.UNDER_REVIEW, DisputeStatus.CLOSED],
  [DisputeStatus.UNDER_REVIEW]: [
    DisputeStatus.AWAITING_EVIDENCE,
    DisputeStatus.RESOLVED_CUSTOMER,
    DisputeStatus.RESOLVED_PROVIDER,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.AWAITING_EVIDENCE]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.RESOLVED_CUSTOMER]: [DisputeStatus.CLOSED],
  [DisputeStatus.RESOLVED_PROVIDER]: [DisputeStatus.CLOSED],
  [DisputeStatus.CLOSED]: [],
};
