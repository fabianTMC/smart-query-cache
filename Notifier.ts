export class Notifier {
	private callback: Function;
	constructor(callback: Function) {
		this.callback = callback;
	}

	public notify(message: string) {
		this.callback(message);
	}
}
