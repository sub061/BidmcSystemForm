import * as React from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import type { IGoal, IHospital, ISystemGoal, ISystemGoalFormProps } from "./ISystemGoalFormProps";
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
  dropdownText: string;
  systemGoalDropdown: any;
  subGoalDropdown: any;
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
      grid: [
        {
          hospital: "AJH",
          actual: "",
          target: "",
          details: "",
        },
      ],
      dropdownText: 'Choose Hospital',
      systemGoalDropdown: { text: 'Choose Goal', id: 0 },
      subGoalDropdown: {
        text: 'Choose Sub Goal',
        goalId: 0
      }
    };

    this.handleItemClick = this.handleItemClick.bind(this);
    this.systemGoalClick = this.systemGoalClick.bind(this);
    this.subGoalClick = this.subGoalClick.bind(this);
  }

  handleItemClick(value: string) {
    this.setState({
      dropdownText: value
    });
  }
  systemGoalClick(value: any) {
    this.setState({
      systemGoalDropdown: { text: value.Title, id: value.Id }
    });
  }

  subGoalClick(value: any): void {
    console.log("ssssssssssssssss", value)
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

    const setSubGoals = this.state.subGoal.filter((item: any) => item.GoalId === this.state.systemGoalDropdown.id)
    console.log("New Sub Goals aaaaaaaaa --->", setSubGoals)



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
                    {this.state.dropdownText}
                  </button>
                  <ul className="dropdown-menu">
                    <li className="group_list">
                      <a className="dropdown-item title" href="#" onClick={() => this.handleItemClick("BILH")}>
                        BILH
                      </a>
                      <ul>
                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Object.values(systemGoalGroupData).map((group: any, index: number) => (
                          group.heading && (
                            <li key={group.heading.id} className="inner_group">
                              <a className="dropdown-item inner_title" href="#" onClick={() => this.handleItemClick(group.heading.Title)}>
                                {group.heading.Title}
                              </a>
                              <ul>
                                {group.subItems.map((subItem: any) => (
                                  <li key={subItem.id}>
                                    <a
                                      className="dropdown-item"
                                      href="#"
                                      onClick={() => this.handleItemClick(subItem.Title)}
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
              <div className="btn_container_footer justify-content-start">
                <button className="active">Apply</button>
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
                <tr>
                  <td style={{ width: '320px', textAlign: 'left' }}>Nursing turnover rate (win 1 yr.)</td>
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
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-1" />
                        <label htmlFor="ac-1" />
                      </div>
                    </span>
                  </td>
                  <td style={{ width: '150px', textAlign: 'center' }}>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="tr-1" />
                        <label htmlFor="tr-1" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <textarea></textarea>
                  </td>
                </tr>

                <tr>
                  <td>Allied Health turnover (win 1 yr.)
                  </td>
                  <td>
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
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-2" />
                        <label htmlFor="ac-2" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="tr-2" />
                        <label htmlFor="tr-2" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <textarea></textarea>
                  </td>
                </tr>


                <tr>
                  <td>New Hiring (critical areas.)
                  </td>
                  <td>
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
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-3" />
                        <label htmlFor="ac-3" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="tr-3" />
                        <label htmlFor="tr-3" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <textarea></textarea>
                  </td>
                </tr>
                <tr>
                  <td>Rate of URPOC retention in defined roles
                  </td>
                  <td>
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
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-4" />
                        <label htmlFor="ac-4" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="tr-4" />
                        <label htmlFor="tr-4" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <textarea></textarea>
                  </td>
                </tr>
                <tr>
                  <td>Volume of trainees in partnership
                  </td>
                  <td>
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
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-5" />
                        <label htmlFor="ac-5" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="tr-5" />
                        <label htmlFor="tr-5" />
                      </div>
                    </span>
                  </td>
                  <td>
                    <textarea></textarea>
                  </td>
                </tr>
              </tbody>
            </table >

            <div className="btn_container_footer">
              <button className="active">Reset</button> <button>Save</button>
            </div>
          </form >
        </div >
      </>
    );
  }
}
