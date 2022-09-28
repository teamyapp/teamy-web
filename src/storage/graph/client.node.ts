import { Client } from "@core/entity/client";
import { LocalStore } from '@core/storage/syncer/localStore';
import { ClientState } from "../states/client.state";
import { UserNode } from "./user.node";

export class ClientNode implements Client {
    constructor(private localStore: LocalStore, private client: ClientState) {}

    public get id(): number {
        return this.client.id;
    }

    public get user(): UserNode {
        return new UserNode(this.localStore, this.localStore.getState().users[this.client.userId])
    }
}
