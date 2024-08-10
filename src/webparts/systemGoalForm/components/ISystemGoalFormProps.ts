import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

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
  context: any;
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
}

export interface IKPI {
  Id: number;
  Title: string;
}

export const postUpdateData = async ({
  context,
  apiUrl,
  updatedFields,
  goalMetrix,
}: any): Promise<void> => {
  try {
    const updatedData: any = Object.keys(updatedFields).map((index) => {
      const originalItem = goalMetrix[parseInt(index)]; // Get the original item
      const updatedItem = updatedFields[index]; // Get the updated fields for this item
      return {
        ...originalItem,
        ...updatedItem,
      };
    });

    const itemBody = {
      Metrix: JSON.stringify(updatedData),
    };

    console.log("Payload ----->:", itemBody);

    const response: SPHttpClientResponse = await context.spHttpClient.post(
      apiUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-type": "application/json;odata=verbose",
          "odata-version": "",
        },
        body: JSON.stringify(itemBody),
      }
    );

    console.log("Api Response --->", response);

    if (response.ok) {
      console.log("Form submitted successfully");
    } else {
      console.error("Error submitting form", response.statusText);
    }
  } catch (error) {
    console.error("Error submitting form", error);
  }
};
