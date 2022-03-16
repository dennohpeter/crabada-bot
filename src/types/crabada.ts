export interface Crabada {
  crabada_id: number;
  id: number;
  price: number;
  crabada_name: string;
  lender: string;
  is_being_borrowed: number;
  borrower: string;
  game_id: number;
  crabada_type: number;
  crabada_class: number;
  class_id: number;
  class_name: string;
  is_origin: number;
  is_genesis: number;
  legend_number: number;
  pure_number: number;
  photo: string;
  hp: number;
  speed: number;
  damage: number;
  critical: number;
  armor: number;
  battle_point: number;
  time_point: number;
  mine_point: number;
}

export interface Mine {
  game_id: number;
  start_time: number;
  end_time: number;
  cra_reward?: number;
  tus_reward?: number;
  miner_cra_reward?: number;
  miner_tus_reward?: number;
  looter_cra_reward?: number;
  looter_tus_reward?: number;
  estimate_looter_win_cra?: number;
  estimate_looter_win_tus?: number;
  estimate_looter_lose_cra?: number;
  estimate_looter_lose_tus?: number;
  estimate_miner_lose_cra?: number;
  estimate_miner_lose_tus?: number;
  estimate_miner_win_cra?: number;
  estimate_miner_win_tus?: number;
  round?: number;
  team_id?: number;
  owner?: string;
  attack_team_id?: number;
  attack_team_owner?: string;
  attack_point?: number;
  winner_team_id?: null;
  status?: string;
  process: Process[];
  crabada_id_1?: number;
  crabada_id_2?: number;
  crabada_id_3?: number;
  crabada_1_photo?: string;
  crabada_2_photo?: string;
  crabada_3_photo?: string;
  faction?: string;
  defense_team_members?: TeamMember[];
  attack_team_members?: TeamMember[];
  defense_mine_point?: number;
  defense_point?: number;
  defense_crabada_number?: number;
  attack_mine_point?: number;
  mine_point_modifier?: number;
}

export interface TeamMember {
  crabada_id?: number;
  crabada_class?: number;
  photo?: string;
  hp?: number;
  speed?: number;
  armor?: number;
  damage?: number;
  critical?: number;
  is_origin?: number;
  is_genesis?: number;
  legend_number?: number;
}

export interface Process {
  action: string;
  transaction_time: number;
}

export interface Team {
  team_id: number;
  owner?: string;
  crabada_id_1?: number;
  crabada_1_photo?: string;
  crabada_1_hp?: number;
  crabada_1_speed?: number;
  crabada_1_armor?: number;
  crabada_1_damage?: number;
  crabada_1_critical?: number;
  crabada_1_is_origin?: number;
  crabada_1_is_genesis?: number;
  crabada_1_legend_number?: number;
  crabada_id_2?: number;
  crabada_2_photo?: string;
  crabada_2_hp?: number;
  crabada_2_speed?: number;
  crabada_2_armor?: number;
  crabada_2_damage?: number;
  crabada_2_critical?: number;
  crabada_2_is_origin?: number;
  crabada_2_is_genesis?: number;
  crabada_2_legend_number?: number;
  crabada_id_3?: number;
  crabada_3_photo?: string;
  crabada_3_hp?: number;
  crabada_3_speed?: number;
  crabada_3_armor?: number;
  crabada_3_damage?: number;
  crabada_3_critical?: number;
  crabada_3_is_origin?: number;
  crabada_3_is_genesis?: number;
  crabada_3_legend_number?: number;
  battle_point?: number;
  time_point?: number;
  mine_point?: number;
  game_type?: null;
  mine_start_time?: null;
  mine_end_time?: null;
  game_id?: null;
  game_start_time?: null;
  game_end_time?: null;
  process_status?: null;
  game_round?: null;
  status?: string;
  faction?: string;
  crabada_1_class?: number;
  crabada_2_class?: number;
  crabada_3_class?: number;
  crabada_1_type?: number;
  crabada_2_type?: number;
  crabada_3_type?: number;
}
