import { Task, Cron } from '../src';

interface Subscription {
	id: number;
	cancelled: boolean;
	expireAt: Date;
}

class ExpiryTask implements Task {
	public constructor(public readonly proto: Subscription) {}

	public get id() {
		return this.proto.id.toString();
	}

	public get completeAt() {
		return this.proto.expireAt;
	}
}

/* janky database */
// just my shorthand for creating random dates
function task(id: number): ExpiryTask {
	const expireAt = new Date(Date.now() + 1000 * id);
	return new ExpiryTask({ id, expireAt, cancelled: false });
}
// for usage later in _usage() function
const subscriptions = new Map<number, ExpiryTask>();
for (let i = 1; i <= 10; i++) subscriptions.set(i, task(i));

class ExpiryCron extends Cron<ExpiryTask> {
	public end(sub: ExpiryTask) {
		// implemented business logic for expiring their subscription

		// this is where you'd update your database so we don't
		// keep running this function on the same object
		sub.proto.cancelled = true;
		subscriptions.set(sub.proto.id, sub);

		console.log(`Subscription #${sub.id} (${sub.completeAt.toLocaleTimeString()}) just expired!`);
	}

	public check() {
		// this is where you'd usually implement your query
		// to the database, for the sake of this test i'll
		// just be adding some psudo tasks

		const subs = [...subscriptions.values()].filter((s) => !s.proto.cancelled);

		const now = Date.now();
		for (const sub of subs.values()) {
			const drawAt = sub.completeAt.getTime();
			if (drawAt - now <= this.delay) this.queue(sub);
			else if (!this.waiting.has(sub.id) && now > drawAt) this.end(sub);
		}
	}
}

new ExpiryCron(10 * 1000).init();
