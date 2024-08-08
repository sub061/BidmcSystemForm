export interface ISystemGoalFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  getGoal: IGoal[];
  getHospital: IHospital[];
  getSystemGoal: ISystemGoal[];
}

export interface IGoal {
  Id: number;
  Title: string;
}

export interface IHospital {
  Id: number;
  Title: string;
  Division: IDivision;
  DivisionId: number;
  OrganizationId: number;
  Organization: string;
  Division1: string;
  Division1Id: number;
}

export interface IDivision {
  Id: number;
  Title: string;
  OrganizationId: string;
  Organization: ISystemGoal;
}

export interface ISystemGoal {
  [x: string]: any;
  Id: number;
  Title: string;
}
