type ObservableSubscriber<T> = (oldData: T, newData: T) => void;

export class Observable<T> {
  private subscriptions: ObservableSubscriber<T>[] = [];

  constructor(private data: T) {}

  subscribe(subscriber: ObservableSubscriber<T>) {
    this.subscriptions.push(subscriber);
  }

  get() {
    return this.data;
  }

  set(newData: T) {
    const oldData = this.data;
    this.data = newData;
    this.fire(oldData, this.data);
  }

  fire(oldData: T, newData: T) {
    for (const subscriber of this.subscriptions) {
      subscriber(oldData, newData);
    }
  }
}
