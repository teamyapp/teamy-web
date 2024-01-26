import { RemoteGroup } from "./remoteGroup";
import { RemoteRollout } from "./remoteRollout";



export interface RemoteGroupRolloutRelation {
    group: RemoteGroup;
    rollout: RemoteRollout;
}