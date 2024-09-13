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
    console.log("Index --->", index)
    // If the index is not in updatedFields, initialize it
    if (!updatedFields[id]) {
      updatedFields[id] = { Id: id }; // Initialize with Id
    }

    // Update the specific field for the index
    updatedFields[id][field] = value;

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

  // Get SubGoal Title
  private getSubGoalTitle = (subGoalId: number) => {
    const { subGoal } = this.state;
    if (!subGoal) return "Unknown KPI"; // Check if dataKPI is null
    const subGoalData = subGoal.find((subGoal: any) => subGoal.Id === subGoalId);
    return subGoalData ? subGoalData.Title : "Unknown KPI";
  };

  private getFilteredMetrixData() {
    if (
      this.state.systemGoalDropdown.id === null &&
      // this.state.subGoalDropdown.goalId === null &&
      this.state.hospitalDropdwon.hospitalId === null
    )
      return [];
    const metrixData = this.state?.goalMetrix?.filter(
      (item: any) =>
        // this.state.subGoalDropdown.goalId === item.SubGoalId &&
        this.state.hospitalDropdwon.hospitalId === item.HospitalId &&
        this.state.systemGoalDropdown.id === item.GoalId
    );
    console.log("Metrix Data ----------->", metrixData);
    return metrixData || [];
  }

  public render(): React.ReactElement<ISystemGoalFormProps> {
    const { hospital, goalMetrix } = this.state;

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

    const subGoalGroup =
      this.getFilteredMetrixData().reduce((result: any, item: any) => {
        // If subgoaliD is already a key, push the item to that array
        if (!result[item.SubGoalId]) {
          result[item.SubGoalId] = [];
        }
        result[item.SubGoalId].push(item);
        return result;
      }, {});


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const setSubGoals = this.state.subGoal.filter(
    //   (item: any) => item.GoalId === this.state.systemGoalDropdown.id
    // );
    console.log("India ----> IIIIIIIIII  ", this.state.updatedFields);

    console.log("Goal Metrix IIIIIIIIII -->", goalMetrix)
    console.log("Sub Goal Group IIIIIIIIII-->", subGoalGroup)


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
                <label>Pillar:</label>
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
              {/* <div className="field_container">
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
              </div> */}
            </div>

            {/* Table View */}
            <table className="value_table">
              <thead>
                <th style={{ minWidth: "300px", maxWidth: "300px", textAlign: "left" }}>Goal’s</th>
                <th style={{ width: "50px", textAlign: "center" }}>Q/M</th>
                <th style={{ minWidth: "201px", maxWidth: "201px", textAlign: "center" }}>MTD/QTD</th>
                <th style={{ minWidth: "201px", maxWidth: "201px", textAlign: "center" }}>YTD</th>
                <th style={{ minWidth: "120px", maxWidth: "120px", textAlign: "left" }}>Url</th>
                <th style={{ width: "100%", textAlign: "left" }}>Comments</th>
              </thead>
              <tbody>
                {Object.keys(subGoalGroup).map((subgoalId) => (
                  <React.Fragment key={subgoalId}>
                    <tr className="table_row_repeat">
                      <th style={{ width: "380px", textAlign: "left" }}>{this.getSubGoalTitle(Number(subgoalId))}</th>
                      <th style={{ width: "50px", textAlign: "center" }}></th>
                      <th style={{ padding: '0' }}>

                        {/* <div className="table_in_div">
                        <div>Actual</div>
                        <div>Budget or Target</div>
                        <div>Prior Yr</div>
                        </div> */}
                      <table width="100%"  cellSpacing="0" cellPadding="0" className="inner_repeat_table" style={{ width: '100%', height: '100%' }}>
                          <thead>
                            <tr>
                            <th style={{ minWidth: "67px", maxWidth: "67px", textAlign: "center", border: '0' }}>Actual</th>
                            <th style={{ minWidth: "67px", maxWidth: "67px", textAlign: "center", borderTop: '0', borderBottom: '0' }}>Budget or Target</th>
                            <th style={{ minWidth: "67px", maxWidth: "67px", textAlign: "center", border: '0' }}>Prior Yr</th>
                            </tr>
                          </thead>
                        </table>
                      </th>
                      <th style={{ padding: '0', height: 'auto' }}>
                        <table width="100%"  cellSpacing="0" cellPadding="0" className="inner_repeat_table" style={{ width: '100%', height: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ minWidth: "67px", maxWidth: "67px", textAlign: "center", border: '0' }}>Actual</th>
                              <th style={{minWidth: "67px", maxWidth: "67px",  textAlign: "center", borderTop: '0', borderBottom: '0' }}>Budget or Target</th>
                              <th style={{ minWidth: "67px", maxWidth: "67px", textAlign: "center", border: '0' }}>Prior Yr</th>
                            </tr>
                          </thead>
                        </table>
                      </th>
                      <th>
                        {/* Url */}
                      </th>
                      <th>
                        {/* Comments */}
                      </th>
                    </tr>

                    {subGoalGroup[subgoalId].map((item: any, index: number) => (
                      <tr key={index}>
                        <td style={{ width: "380px", textAlign: "left" }}>
                          <span>{this.getKPITitle(item.KPIId)} </span>
                        </td>
                        <td style={{ width: "50px", textAlign: "center" }}>
                          {/* <div className="dropdown">
                            <button
                              className="btn dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                            
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" href="#">
                                  M
                                </a>
                              </li>
                              <li>
                                <a className="dropdown-item" href="#">
                                  Q
                                </a>
                              </li>
                            </ul>
                          </div> */}
                          <select>
                            <option value="Q">Q</option>
                            <option value="M">M</option>
                          </select>
                        </td>

                        {/* MTD Table */}
                        <td className="mtd_color" style={{  textAlign: "center", padding: '0' }}>
                          <table>
                            <tbody>
                              <tr>
                                <td style={{  width: "67px", textAlign: "center", border: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.MTD_ACTUAL}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "MTD_ACTUAL",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td style={{width: "67px",  textAlign: "center", borderTop: '0', borderBottom: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.MTD_BUDGET}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "MTD_BUDGET",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ width: "67px", textAlign: "center", border: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.MTD_PRIOR_YEAR_VARIANCE}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "MTD_PRIOR_YEAR_VARIANCE",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>

                        {/* YTD Table */}
                        <td className="ytd_color" style={{ textAlign: "center", padding: '0' }}>
                          <table>
                            <tbody>
                              <tr>
                                <td style={{  width: "67px", textAlign: "center", border: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.YTD_ACTUAL}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "YTD_ACTUAL",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td style={{  width: "67px", textAlign: "center", borderTop: '0', borderBottom: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.YTD_BUDGET}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "YTD_BUDGET",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td style={{  width: "67px", textAlign: "center", border: '0' }}>
                                  <input
                                    type="text"
                                    defaultValue={item.YTD_PRIOR_YEAR}
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item.Id,
                                        index,
                                        "YTD_PRIOR_YEAR",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>

                        {/* URL and Comments */}
                        <td>
                          <input type="text"
                            defaultValue={item.URL}
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
                          <textarea
                            defaultValue={item.Comment}
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
                    ))}
                  </React.Fragment>
                ))}
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
