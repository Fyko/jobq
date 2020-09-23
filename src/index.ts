/**
 * Represents the base task model for our cron.
 */
export interface Task {
	id: string;
	completeAt: Date;
}

/**
 * Represents a cron
 */
export class Cron<T extends Task> {
	/**
	 * The interval that performs our check function
	 */
	public interval!: NodeJS.Timeout;

	/**
	 * The queue of IDs
	 */
	public readonly waiting: Set<string> = new Set();

	/**
	 * @param delay How frequently a "check" should be performed
	 */
	public constructor(public readonly delay = 60 * 1000) {}

	// implementation to handle what you want to do when its time for
	// this job to complete
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public end(_: T): void {
		throw Error(`${this.constructor.name}#end has not been implemented.`);
	}

	// queue implementation to basically queue up items to fire exactly
	// when they should and not wait until the next query
	public queue(job: T): void {
		const untilFire = job.completeAt.getTime() - Date.now();
		this.waiting.add(job.id);
		setTimeout(() => {
			this.end(job);
		}, untilFire);
	}

	// this is where you perform your query every this.rate
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public check() {
		throw Error(`${this.constructor.name}#check has not been implemented.`);
	}

	/**
	 * Initialize the first check and create the internval.
	 */
	public init(): void {
		this.check();
		this.interval = setInterval(this.check.bind(this), this.delay);
	}
}
