export enum AiRequestStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
  CIRCUIT_OPEN = 'circuit_open',
}
