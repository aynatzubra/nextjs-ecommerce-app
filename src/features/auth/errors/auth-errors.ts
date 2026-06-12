//todo:Bring the entire auth module to a single error model.

export class TooManyRequestsAuthError extends Error {
  constructor() {
    super('TOO_MANY_REQUESTS')
  }
}