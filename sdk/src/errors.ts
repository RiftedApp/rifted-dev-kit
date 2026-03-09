export class RiftSdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RiftSdkError";
  }
}

export class RiftValidationError extends RiftSdkError {
  constructor(message: string) {
    super(message);
    this.name = "RiftValidationError";
  }
}

export class RiftAccountParseError extends RiftSdkError {
  constructor(message: string) {
    super(message);
    this.name = "RiftAccountParseError";
  }
}

export class RiftTransactionError extends RiftSdkError {
  constructor(message: string) {
    super(message);
    this.name = "RiftTransactionError";
  }
}
