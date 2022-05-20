import { TEAM_ROLE } from '../types';

/**
 * Team Configuration setting
 * Record<teamId, TEAM_ROLE>
 *
 * @default TEAM_ROLE is MINE
 *
 * @notice: You can add more team roles here or delete the ones you don't own
 */
export const TeamConfig: Record<number, TEAM_ROLE> = {
  28625: TEAM_ROLE.MINE,
  30631: TEAM_ROLE.LOOT,
};
