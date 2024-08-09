import * as React from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import type { IGoal, IGoalMetrix, IHospital, ISystemGoal, ISystemGoalFormProps } from "./ISystemGoalFormProps";
import styles from "./SystemGoalForm.module.scss";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import '@fortawesome/fontawesome-free/css/all.min.css';

// Define interface for GridRow and SystemGoalFormState
interface IGridRow {
  hospital: string;
  actual: string;
  target: string;
  details: string;
}

interface ISystemGoalFormState {
  systemGoal: ISystemGoal[];
  goals: string[];
  subGoal: IGoal[];
  hospital: IHospital[];
  grid: IGridRow[];
  goalMetrix: IGoalMetrix[];
  hospitalDropdwon: any;
  systemGoalDropdown: any;
  subGoalDropdown: any;
  kpiData: any
}

export default class SystemGoalForm extends React.Component<
  ISystemGoalFormProps,
  ISystemGoalFormState
> {
  constructor(props: ISystemGoalFormProps) {
    super(props);
    this.state = {
      systemGoal: props.getSystemGoal || null,
      hospital: props.getHospital || null,
      goals: [],
      subGoal: props.getGoal || null,
      goalMetrix: props.getGoalMetrix || null,
      kpiData: props.getKPI || null,
      grid: [
        {
          hospital: "AJH",
          actual: "",
          target: "",
          details: "",
        },
      ],
      hospitalDropdwon: { text: 'Choose Hospital', hospitalId: null },
      systemGoalDropdown: { text: 'Choose Goal', id: null },
      subGoalDropdown: {
        text: 'Choose Sub Goal',
        goalId: null
      }
    };

    this.handleItemClick = this.handleItemClick.bind(this);
    this.systemGoalClick = this.systemGoalClick.bind(this);
    this.subGoalClick = this.subGoalClick.bind(this);
    this.getFilteredMetrixData = this.getFilteredMetrixData.bind(this);
  }

  handleItemClick(value: any) {
    console.log("Hospital dropDown data --------->", value);
    this.setState({
      hospitalDropdwon: { text: value.Title, hospitalId: value.Id }
    });
  }

  systemGoalClick(value: any) {
    console.log("System Dropdwon data --------->", value);

    this.setState({
      systemGoalDropdown: { text: value.Title, id: value.Id },
      subGoalDropdown: {
        text: 'Choose Sub Goal',
        goalId: 0
      }
    });
  }

  subGoalClick(value: any): void {
    console.log("Sub Goal Dropdown data --------->", value);
    this.setState({
      subGoalDropdown: { text: value.Title, goalId: value.Id }
    });
  }

  handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type, selectedOptions } =
      e.target as HTMLSelectElement & HTMLInputElement;
    if (type === "select-multiple") {
      const values = Array.from(
        selectedOptions,
        (option: HTMLOptionElement) => option.value
      );
      this.setState({ [name]: values } as unknown as Pick<
        ISystemGoalFormState,
        keyof ISystemGoalFormState
      >);
    } else {
      this.setState({ [name]: value } as unknown as Pick<
        ISystemGoalFormState,
        keyof ISystemGoalFormState
      >);
    }
  };

  handleGridChange = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const grid = [...this.state.grid];
    grid[index][name as keyof IGridRow] = value;
    this.setState({ grid });
  };

  addRow = () => {
    this.setState((prevState) => ({
      grid: [
        ...prevState.grid,
        { hospital: "AJH", actual: "", target: "", details: "" },
      ],
    }));
  };

  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const itemBody = {
      Title: "System Goal Form Submission", // Adjust based on your list fields
      SystemGoal: this.state.systemGoal,
      Hospital: this.state.hospital,
      Goals: this.state.goals.join(";"), // Assuming Goals is a multi-choice field
      SubGoal: this.state.subGoal,
      Grid: JSON.stringify(this.state.grid), // You may need to handle this differently based on your list structure
    };

    const requestUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Goal Metrix')/items`;
    console.log("url", requestUrl);
    try {
      const response: SPHttpClientResponse =
        await this.context.spHttpClient.post(
          requestUrl,
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

      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Error submitting form", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  // Get KPI Title
  private getKPITitle = (KpiId: number) => {
    const { kpiData } = this.state;
    if (!kpiData) return "Unknown KPI"; // Check if dataKPI is null
    const kpi = kpiData.find((kpi: any) => kpi.Id === KpiId);
    return kpi ? kpi.Title : "Unknown KPI";
  };


  private getFilteredMetrixData() {
    console.log("State ----->", this.state)
    if (this.state.systemGoalDropdown.id === null && !this.state.subGoalDropdown.goalId === null && !this.state.hospitalDropdwon.hospitalId === null) return []
    const metrixData = this.state.goalMetrix.filter((item: any) => this.state.subGoalDropdown.goalId === item.SubGoalId && this.state.hospitalDropdwon.hospitalId === item.HospitalId && this.state.systemGoalDropdown.id === item.GoalId);
    console.log("Filtered Metri data", metrixData)
    return metrixData;
  }

  private resetFilter = () => {
    this.setState({
      hospitalDropdwon: { text: 'Choose Hospital', hospitalId: null },
      subGoalDropdown: { text: 'Choose Sub Goal', goalId: null },
      systemGoalDropdown: { text: 'Choose Goal', id: null }
    });
  }

  public render(): React.ReactElement<ISystemGoalFormProps> {

    const { hospital } = this.state;

    const headings = hospital.reduce((acc, item) => {
      if (item.DivisionId === null) {
        acc[item.Id] = { heading: item, subItems: [] };
      }
      return acc;
    }, {} as Record<number, { heading: any | null; subItems: any[] }>);

    const systemGoalGroupData = hospital.reduce((acc, item) => {
      if (item.DivisionId !== null) {
        const parent = acc[item.DivisionId];
        if (parent) {
          parent.subItems.push(item);
        } else {
          console.log(`No heading found for item with ID ${item.Id} and DivisionId ${item.DivisionId}`);
        }
      }
      return acc;
    }, headings);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setSubGoals = this.state.subGoal.filter((item: any) => item.GoalId === this.state.systemGoalDropdown.id)

    return (
      <>
        <span className={`${styles.dummy}`}></span>

        <div className="system_goal_container">
          <div
            style={{
              width: "100%",
              fontSize: "36px",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            BILH Operating Model
          </div>
          <h3>
            <span>System Goals 2025</span>
          </h3>
          <form onSubmit={this.handleSubmit}>
            <div className="filter_container">
              <div className="field_container">
                <label>Hospitals:</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {this.state.hospitalDropdwon.text}
                  </button>
                  <ul className="dropdown-menu">
                    <li className="group_list">
                      <a className="dropdown-item title" href="#" onClick={() => this.handleItemClick({ Title: 'BILH', id: undefined })}>
                        BILH
                      </a>
                      <ul>
                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Object.values(systemGoalGroupData).map((group: any, index: number) => (
                          group.heading && (
                            <li key={group.heading.id} className="inner_group">
                              <a className="dropdown-item inner_title" href="#" onClick={() => this.handleItemClick(group.heading)}>
                                {group.heading.Title}
                              </a>
                              <ul>
                                {group.subItems.map((subItem: any) => (
                                  <li key={subItem.id}>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={() => this.handleItemClick(subItem)}
                                    >
                                      {subItem.Title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          )
                        ))}
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>

              {/* System goal dropdown */}
              <div className="field_container">
                <label>Goal:</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {this.state.systemGoalDropdown.text}
                  </button>
                  <ul className="dropdown-menu">
                    {this.state.systemGoal.map((goal, index) => (
                      <li key={index}>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => this.systemGoalClick(goal)}
                        >
                          {goal.Title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sub goal dropdown */}
              <div className="field_container">
                <label>Sub Goal:</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {this.state.subGoalDropdown.text}
                  </button>
                  <ul className="dropdown-menu">
                    {setSubGoals.length > 0 ? setSubGoals.map((goal, index) => (
                      <li key={index}>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => this.subGoalClick(goal)}
                        >
                          {goal.Title}
                        </a>
                      </li>
                    )) : <li>
                      <a
                        className="dropdown-item"
                        href="#"
                      >
                        Select Goal First
                      </a>
                    </li>}
                  </ul>
                </div>
              </div>
            </div >

            {/* Table View */}
            < table className="value_table" >
              <thead>
                <th style={{ width: '320px', textAlign: 'left' }}>KPI's</th>
                <th style={{ width: '150px', textAlign: 'center' }}>&nbsp;</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actual</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Target</th>
                <th>Comments</th>
              </thead>
              <tbody>
                {this.getFilteredMetrixData().length > 0 ? this.getFilteredMetrixData().map((item: any, index: number) => (
                  <tr key={index}>
                    <td style={{ width: '320px', textAlign: 'left' }}>{this.getKPITitle(item.KPIId)}</td>
                    <td style={{ width: '150px', textAlign: 'center' }}>
                      <div className="dropdown">
                        <button
                          className="btn dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Percentage
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#">
                              Percentage
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Boolean
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Number
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td style={{ width: '150px', textAlign: 'center' }}>
                      <span className="cell_with_checkbox">
                        <input type="text" defaultValue={item.Actual} />
                        <div className="form-group">
                          <input type="checkbox" id={`ac-${index}`} defaultChecked={item.ActualVerify || false} />
                          <label htmlFor={`ac-${index}`} />
                        </div>
                      </span>
                    </td>
                    <td style={{ width: '150px', textAlign: 'center' }}>
                      <span className="cell_with_checkbox">
                        <input type="text" defaultValue={item.Target || ''} />
                        <div className="form-group">
                          <input type="checkbox" id={`tr-${index}`} defaultChecked={item.TargetVerified || false} />
                          <label htmlFor={`tr-${index}`} />
                        </div>
                      </span>
                    </td>
                    <td>
                      <textarea></textarea>
                    </td>
                  </tr>
                )) : <tr>No Kpis to show</tr>}
              </tbody>
            </table >
            <div className="btn_container_footer">
              <button className="active" onClick={() => this.resetFilter()}>Reset</button> <button>Save</button>
            </div>
          </form >
        </div >
      </>
    );
  }
}
