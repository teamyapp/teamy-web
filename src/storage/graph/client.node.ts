import { Client } from "@core/entity/client";
import { UserNode } from "./user.node";

export class ClientNode implements Client {
    constructor(private clientId: number, private userNode: UserNode) {}

    public get id(): number {
        return this.clientId;
    }

    public get user(): UserNode {
        return this.userNode
    }
}
