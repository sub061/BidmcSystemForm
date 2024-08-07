import * as React from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import type { ISystemGoalFormProps } from "./ISystemGoalFormProps";
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
  systemGoal: string;
  hospital: string;
  goals: string[];
  subGoal: string;
  grid: IGridRow[];
  dropdownText: string;
  systemGoalDropdownText: string;
  subGoalDropdownText: string;
}

export default class SystemGoalForm extends React.Component<
  ISystemGoalFormProps,
  ISystemGoalFormState
> {
  constructor(props: ISystemGoalFormProps) {
    super(props);
    this.state = {
      systemGoal: "bilh",
      hospital: "AJH",
      goals: [],
      subGoal: "Retention",
      grid: [
        {
          hospital: "AJH",
          actual: "",
          target: "",
          details: "",
        },
      ],
      dropdownText: 'Choose Hospital',
      systemGoalDropdownText: 'Choose System Goal',
      subGoalDropdownText: 'Choose Sub Goal'
    };

    this.handleItemClick = this.handleItemClick.bind(this);
    this.systemGoalClick = this.systemGoalClick.bind(this);
    this.subGoalClick = this.subGoalClick.bind(this);
  }
  handleItemClick(event: any) {
    this.setState({
      dropdownText: event.target.textContent
    });
  }
  systemGoalClick(event: any) {
    this.setState({
      systemGoalDropdownText: event.target.textContent
    });
  }
  subGoalClick(event: any) {
    this.setState({
      subGoalDropdownText: event.target.textContent
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
    return (
      // <form onSubmit={this.handleSubmit}>
      //   <label htmlFor="systemGoal">System Goal:</label>
      //   <select
      //     id="systemGoal"
      //     name="systemGoal"
      //     value={this.state.systemGoal}
      //     onChange={this.handleChange}
      //   >
      //     <option value="bilh">BILH</option>
      //   </select>
      //   <br />
      //   <br />

      //   <label htmlFor="hospital">Hospital:</label>
      //   <select
      //     id="hospital"
      //     name="hospital"
      //     value={this.state.hospital}
      //     onChange={this.handleChange}
      //   >
      //     <option value="AJH">AJH</option>
      //     <option value="BIDMC">BIDMC</option>
      //   </select>
      //   <br />
      //   <br />

      //   <label htmlFor="goals">Goal:</label>
      //   <select
      //     id="goals"
      //     name="goals"
      //     multiple
      //     value={this.state.goals}
      //     onChange={this.handleChange}
      //   >
      //     <option value="People">People</option>
      //     <option value="Quality">Quality</option>
      //     <option value="Experience">Experience</option>
      //   </select>
      //   <br />
      //   <br />

      //   <label htmlFor="subGoal">Sub Goal:</label>
      //   <select
      //     id="subGoal"
      //     name="subGoal"
      //     value={this.state.subGoal}
      //     onChange={this.handleChange}
      //   >
      //     <option value="Retention">Retention</option>
      //     <option value="Throughput">Throughput</option>
      //     <option value="Access">Access</option>
      //   </select>
      //   <br />
      //   <br />

      //   <div id="gridContainer">
      //     <table>
      //       <thead>
      //         <tr>
      //           <th>Hospital</th>
      //           <th>Actual</th>
      //           <th>Target</th>
      //           <th>Details</th>
      //         </tr>
      //       </thead>
      //       <tbody>
      //         {this.state.grid.map((row, index) => (
      //           <tr key={index}>
      //             <td>
      //               <select
      //                 name="hospital"
      //                 value={row.hospital}
      //                 onChange={(e) => this.handleGridChange(index, e)}
      //               >
      //                 <option value="AJH">AJH</option>
      //                 <option value="BIDMC">BIDMC</option>
      //               </select>
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="actual"
      //                 value={row.actual}
      //                 onChange={(e) => this.handleGridChange(index, e)}
      //               />
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="target"
      //                 value={row.target}
      //                 onChange={(e) => this.handleGridChange(index, e)}
      //               />
      //             </td>
      //             <td>
      //               <input
      //                 type="text"
      //                 name="details"
      //                 value={row.details}
      //                 onChange={(e) => this.handleGridChange(index, e)}
      //               />
      //             </td>
      //           </tr>
      //         ))}
      //       </tbody>
      //     </table>
      //   </div>
      //   <br />

      //   <button type="button" onClick={this.addRow}>
      //     Add Row
      //   </button>
      //   <br />
      //   <br />

      //   <input type="submit" value="Submit" />
      // </form>

      <>
        <span className={`${styles.dummy}`}></span>

        <div className="system_goal_container">
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
                      <a className="dropdown-item title" href="#" onClick={this.handleItemClick}>
                        BILH
                      </a>
                      <ul>
                        <li className="inner_group">
                          <a className="dropdown-item inner_title" href="#">Metro Boston Division</a>
                          <ul>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>BIDMC</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Joslin</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>MAH</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>NEBH</a>
                            </li>
                          </ul>

                        </li>
                        <li className="inner_group">
                          <a className="dropdown-item  inner_title" href="#" onClick={this.handleItemClick}>Community Division</a>
                          <ul>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>AJH</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Exeter</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>BIDM</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>BIDN</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>NE</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>BIDP</a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={this.handleItemClick}>WH</a>
                            </li>
                          </ul>
                        </li>
                        <li className="inner_group">
                          <a className="dropdown-item inner_title" href="#" onClick={this.handleItemClick}>LHMC Division</a>
                        </li>
                        <li className="inner_group">
                          <a className="dropdown-item inner_title" href="#" onClick={this.handleItemClick}>Diversified Services</a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>

              {/* System goal dropdown */}
              <div className="field_container">
                <label>System Goal:</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {this.state.systemGoalDropdownText}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.systemGoalClick}>
                        People
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.systemGoalClick}>
                        Quality and Experience
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.systemGoalClick}>
                        Finance and Operations
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.systemGoalClick}>
                        Strategy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* System goal dropdown */}
              <div className="field_container">
                <label>Sub Goal:</label>
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {this.state.subGoalDropdownText}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.subGoalClick}>
                        Retention, recruitment, development
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.subGoalClick}>
                        Engagement, culture, communication, well-being
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={this.subGoalClick}>
                        Labor efficiency/ productivity
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table View */}
            <table className="value_table">
              <thead>
                <th style={{ width: '130px', textAlign: 'left' }}>KPI's</th>
                <th style={{ width: '150px', textAlign: 'center' }}>&nbsp;</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actual</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
                <th>Comments</th>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: '130px', textAlign: 'left' }}>Nursing turnover rate (win 1 yr.)</td>
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
                  <td style={{ width: '100px', textAlign: 'center' }}>
                    <span className="cell_with_checkbox">
                      <input type="text" />
                      <div className="form-group">
                        <input type="checkbox" id="ac-1" />
                        <label htmlFor="ac-1" />
                      </div>
                    </span>
                  </td>
                  <td style={{ width: '100px', textAlign: 'center' }}>
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
            </table>

            <div className="btn_container_footer">
              <button className="active">Reset</button> <button>Save</button>
            </div>
          </form>
        </div>
      </>
    );
  }
}
