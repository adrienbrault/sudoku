import { Agent, type Connection } from "agents";
import type { ClientMessage } from "../lib/types.ts";
import type { OutgoingMessage } from "./room.ts";
import { GameRoom } from "./room.ts";

export class SudokuAgent extends Agent {
	room!: GameRoom;

	onStart() {
		this.room = new GameRoom(this.name);
	}

	onConnect(_connection: Connection) {
		// Connection established, wait for join message
	}

	onMessage(connection: Connection, message: string | ArrayBuffer) {
		if (typeof message !== "string") return;

		let msg: ClientMessage;
		try {
			msg = JSON.parse(message);
		} catch {
			connection.send(
				JSON.stringify({ type: "error", message: "Invalid message" }),
			);
			return;
		}

		// Track connection by playerId on join
		if (msg.type === "join") {
			connection.setState({ playerId: msg.playerId });
		}

		const state = connection.state as { playerId?: string } | undefined;
		const senderId = state?.playerId ?? null;
		if (!senderId && msg.type !== "join") {
			connection.send(JSON.stringify({ type: "error", message: "Not joined" }));
			return;
		}

		const outgoing = this.room.handleMessage(
			msg.type === "join" ? msg.playerId : senderId!,
			msg,
		);
		this.dispatch(outgoing, connection, senderId);
	}

	onClose(connection: Connection) {
		const state = connection.state as { playerId?: string } | undefined;
		const playerId = state?.playerId ?? null;
		if (!playerId) return;
		const outgoing = this.room.handleDisconnect(playerId);
		this.dispatch(outgoing, connection, playerId);
	}

	private getOpponentConnection(senderId: string): Connection | null {
		for (const conn of this.getConnections()) {
			const state = conn.state as { playerId?: string } | undefined;
			if (state?.playerId && state.playerId !== senderId) return conn;
		}
		return null;
	}

	private dispatch(
		messages: OutgoingMessage[],
		sender: Connection,
		senderId: string | null,
	) {
		for (const { target, message } of messages) {
			const json = JSON.stringify(message);
			switch (target) {
				case "sender":
					sender.send(json);
					break;
				case "opponent": {
					if (senderId) {
						const opponent = this.getOpponentConnection(senderId);
						opponent?.send(json);
					}
					break;
				}
				case "all":
					this.broadcast(json);
					break;
			}
		}
	}
}

type Env = {
	// biome-ignore lint/suspicious/noExplicitAny: Cloudflare Workers DurableObjectNamespace type
	SudokuAgent: any;
};

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// Extract room ID from path: /parties/sudoku/:roomId
		const match = url.pathname.match(/^\/parties\/sudoku\/(.+)$/);
		if (!match) {
			return new Response("Not found", { status: 404 });
		}

		const roomId = match[1];
		const id = env.SudokuAgent.idFromName(roomId);
		const stub = env.SudokuAgent.get(id);
		return stub.fetch(request);
	},
};
