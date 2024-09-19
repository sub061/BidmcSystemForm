import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface ISystemGoalFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  getGoal: IGoal[];
  getHospital: IHospital[];
  getSystemGoal: ISystemGoal[];
  getGoalMetrix: IGoalMetrix[];
  getKPI: any;
  apiUrl: string;
  websiteUrl: string;
  context: WebPartContext;
  newHospital: any;
  newKpis: any;
  newSubgoal: any;
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

export interface IGoalMetrix {
  SystemGoalId: number;
  GoalId: number;
  SubGoalId: number;
  KPIId: number;
  HospitalId: number;
  Actual: string;
  Target: string;
  ActualVerify: boolean;
  TargetVerified: boolean;
  Id: number;
  Comment: any;
  URL: any;
}

export interface IKPI {
  Id: number;
  Title: string;
}
