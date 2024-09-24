import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "SystemGoalFormWebPartStrings";
import SystemGoalForm from "./components/SystemGoalForm";
import {
  IGoal,
  IGoalMetrix,
  IHospital,
  IKPI,
  ISystemGoal,
  ISystemGoalFormProps,
} from "./components/ISystemGoalFormProps";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface ISystemGoalFormWebPartProps {
  description: string;
  goal: string;
}

export default class SystemGoalFormWebPart extends BaseClientSideWebPart<ISystemGoalFormWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  // Get List for KPI Tilte
  public async getKPIConfiguration(): Promise<IKPI[]> {
    const requestUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/Lists/GetByTitle('KPI')/Items`;
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      requestUrl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    // console.log("KPI Data --->", data);
    return data.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getKpisData(): Promise<IKPI[]> {
    try {
      const response = await fetch("https://localhost:7087/api/kpis");
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("api kpi", data);
      return data;
    } catch (error) {
      console.error("Error fetching Kpi data:", error);
      throw error;
    }
  }

  // Get List for metrix
 

  public async getGoalMetrixConfiguration(): Promise<IGoalMetrix[]> {
    try {
      const response = await fetch("https://localhost:7087/api/summary");
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("api summary", data);
      return data;
    } catch (error) {
      console.error("Error fetching summary data:", error);
      throw error;
    }
  }





  // List For Sub Goals
  public async getGoalConfiguration(): Promise<IGoal[]> {
    const requestUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/Lists/GetByTitle('Sub Goal')/Items`;
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      requestUrl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    // console.log("Sub Goal --->", data.value);
    return data.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getSubGoalata(): Promise<any> {
    try {
      const response = await fetch("https://localhost:7087/api/subgoals");
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("response api subgoal data", data);
      return data;
    } catch (error) {
      console.error("Error fetching subgoals data:", error);
      throw error;
    }
  }

  //List For Hospitals
  public async getHospitalConfiguration(): Promise<IHospital[]> {
    const requestUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/Lists/GetByTitle('Hospital')/Items`;
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      requestUrl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    return data.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getHospitalListData(): Promise<any> {
    try {
      const response = await fetch("https://localhost:7087/api/hospitals");
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response API hospital  Data ---->", data);
      return data;
    } catch (error) {
      console.error("Error fetching hospital data:", error);
      throw error;
    }
  }

  // Get List for System Goal

  public async getSytemGoalConfiguration(): Promise<ISystemGoal[]> {
    try {
      const response = await fetch("https://localhost:7087/api/pillers");
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response API pillers  Data ---->", data);
      return data;
    } catch (error) {
      console.error("Error fetching pillers data:", error);
      throw error;
    }
  }

  public async render(): Promise<void> {
    if (this.domElement) {
      try {
        // const getKPI = await this.getKPIConfiguration();
        const getGoalMetrix = await this.getGoalMetrixConfiguration();
        //const getHospital = await this.getHospitalConfiguration();
        const getSystemGoal = await this.getSytemGoalConfiguration();
        const getGoal = await this.getGoalConfiguration();
        const newHospital = await this.getHospitalListData();
        const newKpis = await this.getKpisData();
        const newSubgoal = await this.getSubGoalata();

        console.log("NEw SubGoal Data ----->", newSubgoal);

        const element: React.ReactElement<ISystemGoalFormProps> =
          React.createElement(SystemGoalForm, {
            description: this.properties.description,
            isDarkTheme: this._isDarkTheme,
            environmentMessage: this._environmentMessage,
            hasTeamsContext: !!this.context.sdks.microsoftTeams,
            userDisplayName: this.context.pageContext.user.displayName,
            getGoal: getGoal,
            getHospital: newHospital,
            getSystemGoal: getSystemGoal,
            getGoalMetrix: getGoalMetrix,
            getKPI: newKpis,
            newHospital: newHospital,
            newKpis: newKpis,
            newSubgoal: newSubgoal,
            websiteUrl: this.context.pageContext.web.absoluteUrl,
            apiUrl: `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Metrix')/items$top=5000`,
            context: this.context,
          });

        ReactDom.render(element, this.domElement);
      } catch (e) {
        console.log("Error Occured --->", e);
      }
    } else {
      console.log("Dom Element is not availale");
    }
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office": // running in Office
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook": // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams": // running in Teams
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
