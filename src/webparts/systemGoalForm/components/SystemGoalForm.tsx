import * as React from "react";
import {
  type IGoal,
  type IGoalMetrix,
  type IHospital,
  type ISystemGoal,
  type ISystemGoalFormProps,
} from "./ISystemGoalFormProps";
import styles from "./SystemGoalForm.module.scss";
import { getSP, SPFI } from "../../../pnpjsConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
  kpiData: any;
  updatedFields: any;
  apiUrl: string;
  context: any;
  _sp: SPFI;
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
      updatedFields: {},
      apiUrl: props.apiUrl,
      context: props.context,
      _sp: getSP(props.context),
      grid: [
        {
          hospital: "AJH",
          actual: "",
          target: "",
          details: "",
        },
      ],
      hospitalDropdwon: { text: "Choose Hospital", hospitalId: null },
      systemGoalDropdown: { text: "Choose Goal", id: null },
      subGoalDropdown: {
        text: "Choose Sub Goal",
        goalId: null,
      },
    };
    // const _sp: SPFI = getSP(props.context);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.systemGoalClick = this.systemGoalClick.bind(this);
    this.subGoalClick = this.subGoalClick.bind(this);
    this.getFilteredMetrixData = this.getFilteredMetrixData.bind(this);
  }

  private resetFilter = () => {
    this.setState({
      hospitalDropdwon: { text: "Choose Hospital", hospitalId: null },
      subGoalDropdown: { text: "Choose Sub Goal", goalId: null },
      systemGoalDropdown: { text: "Choose Goal", id: null },
      updatedFields: {},
    });
  };

  private handleInputChange = (id: number, index: number, field: string, value: any) => {
    const updatedFields = { ...this.state.updatedFields };

    // If the index is not in updatedFields, initialize it
    if (!updatedFields[index]) {
      updatedFields[index] = { Id: id }; // Initialize with Id
    }

    // Update the specific field for the index
    updatedFields[index][field] = value;

    // Update the state
    this.setState({
      updatedFields,
    });
  };

  private editListItem = async (e: any) => {
    e.preventDefault();
    const { updatedFields } = this.state;
    // Prepare the updated data by using the Id from updatedFields
    const updatedData: any = Object.keys(updatedFields).map((index) => {
      const { Id, ...updatedItem } = updatedFields[index]; // Extract Id from updatedFields
      return {
        Id,
        ...updatedItem,
      };
    });
    const list = this.state._sp.web.lists.getByTitle("Metrix");

    try {
      // Iterate over updated data to update each item individually
      for (let i = 0; i < updatedData.length; i++) {
        const data = updatedData[i];
        const { Id, ...fieldsToUpdate } = data;
        await list.items.getById(Id).update(fieldsToUpdate);
      }
      window.alert(`List item edited successfully`);
    } catch (e) {
      console.error("Error updating list item", e);
    } finally {
      window.location.reload();
    }
  };



  handleItemClick(value: any) {
    console.log("Hospital dropDown data --------->", value);
    this.setState({
      hospitalDropdwon: { text: value.Title, hospitalId: value.Id },
      subGoalDropdown: { text: "Choose Sub Goal", goalId: null },
      systemGoalDropdown: { text: "Choose Goal", id: null },
    });
  }

  systemGoalClick(value: any) {
    this.setState({
      systemGoalDropdown: { text: value.Title, id: value.Id },
      subGoalDropdown: {
        text: "Choose Sub Goal",
        goalId: 0,
      },
    });
  }

  subGoalClick(value: any): void {
    this.setState({
      subGoalDropdown: { text: value.Title, goalId: value.Id },
    });
  }

  // Get KPI Title
  private getKPITitle = (KpiId: number) => {
    const { kpiData } = this.state;
    if (!kpiData) return "Unknown KPI"; // Check if dataKPI is null
    const kpi = kpiData.find((kpi: any) => kpi.Id === KpiId);
    return kpi ? kpi.Title : "Unknown KPI";
  };

  private getFilteredMetrixData() {
    if (
      this.state.systemGoalDropdown.id === null &&
      this.state.subGoalDropdown.goalId === null &&
      this.state.hospitalDropdwon.hospitalId === null
    )
      return [];
    const metrixData = this.state.goalMetrix.filter(
      (item: any) =>
        this.state.subGoalDropdown.goalId === item.SubGoalId &&
        this.state.hospitalDropdwon.hospitalId === item.HospitalId &&
        this.state.systemGoalDropdown.id === item.GoalId
    );
    return metrixData;
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
          console.log(
            `No heading found for item with ID ${item.Id} and DivisionId ${item.DivisionId}`
          );
        }
      }
      return acc;
    }, headings);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setSubGoals = this.state.subGoal.filter(
      (item: any) => item.GoalId === this.state.systemGoalDropdown.id
    );
    console.log(" Russia ---->  ", this.state.updatedFields);


    return (
      <>
        <span className={`${styles.dummy}`} />
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
          <form>
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
                      <a
                        className="dropdown-item title"
                        href="#"
                        onClick={() =>
                          this.handleItemClick({ Title: "BILH", id: undefined })
                        }
                      >
                        BILH
                      </a>
                      <ul>
                        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Object.values(systemGoalGroupData).map(
                          (group: any, index: number) =>
                            group.heading && (
                              <li
                                key={group.heading.id}
                                className="inner_group"
                              >
                                <a
                                  className="dropdown-item inner_title"
                                  href="#"
                                  onClick={() =>
                                    this.handleItemClick(group.heading)
                                  }
                                >
                                  {group.heading.Title}
                                </a>
                                <ul>
                                  {group.subItems.map((subItem: any) => (
                                    <li key={subItem.id}>
                                      <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={() =>
                                          this.handleItemClick(subItem)
                                        }
                                      >
                                        {subItem.Title}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )
                        )}
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
                    {setSubGoals.length > 0 ? (
                      setSubGoals.map((goal, index) => (
                        <li key={index}>
                          <a
                            className="dropdown-item"
                            href="#"
                            onClick={() => this.subGoalClick(goal)}
                          >
                            {goal.Title}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li>
                        <a className="dropdown-item" href="#">
                          Select Goal First
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Table View */}
            <table className="value_table">
              <thead>
                <th style={{ width: "320px", textAlign: "left" }}>KPI's</th>
                <th style={{ width: "150px", textAlign: "center" }}>&nbsp;</th>
                <th style={{ width: "150px", textAlign: "center" }}>Actual</th>
                <th style={{ width: "150px", textAlign: "center" }}>Target</th>
                <th>Url</th>
                <th>Comments</th>
              </thead>
              <tbody>
                {this.getFilteredMetrixData().length > 0 ? (
                  this.getFilteredMetrixData().map((item, index) => (
                    <tr key={index}>
                      <td style={{ width: "320px", textAlign: "left" }}>
                        {this.getKPITitle(item.KPIId)}
                      </td>
                      <td style={{ width: "150px", textAlign: "center" }}>
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
                      <td style={{ width: "150px", textAlign: "center" }}>
                        <span className="cell_with_checkbox">
                          <input
                            type="text"
                            defaultValue={item.Actual}
                            onChange={(e) =>
                              this.handleInputChange(
                                item.Id,
                                index,
                                "Actual",
                                e.target.value
                              )
                            }
                          />
                          <div className="form-group">
                            <input
                              type="checkbox"
                              id={`ac-${index}`}
                              defaultChecked={item.ActualVerify || false}
                              onChange={(e) =>
                                this.handleInputChange(
                                  item.Id,
                                  index,
                                  "ActualVerify",
                                  e.target.checked
                                )
                              }
                            />
                            <label htmlFor={`ac-${index}`} />
                          </div>
                        </span>
                      </td>
                      <td style={{ width: "150px", textAlign: "center" }}>
                        <span className="cell_with_checkbox">
                          <input
                            type="text"
                            defaultValue={item.Target || ""}
                            onChange={(e) =>
                              this.handleInputChange(
                                item.Id,
                                index,
                                "Target",
                                e.target.value
                              )
                            }
                          />
                          <div className="form-group">
                            <input
                              type="checkbox"
                              id={`tr-${index}`}
                              defaultChecked={item.TargetVerified || false}
                              onChange={(e) =>
                                this.handleInputChange(
                                  item.Id,
                                  index,
                                  "TargetVerified",
                                  e.target.checked
                                )
                              }
                            />
                            <label htmlFor={`tr-${index}`} />
                          </div>
                        </span>
                      </td>
                      <td>
                        <textarea defaultValue={item.URL}
                          onChange={(e) =>
                            this.handleInputChange(
                              item.Id,
                              index,
                              "URL",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <textarea defaultValue={item.Comment}
                          onChange={(e) =>
                            this.handleInputChange(
                              item.Id,
                              index,
                              "Comment",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No KPIs to show</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="btn_container_footer">
              <button className="active" onClick={() => this.resetFilter()}>
                Reset
              </button>{" "}
              <button
                // onClick={(e) => this.handleSubmit(e)}
                onClick={(e) => this.editListItem(e)}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }
}
