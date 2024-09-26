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
      hospital: props.newHospital || null,
      goals: [],
      subGoal: props.getGoal || null,
      goalMetrix: props.getGoalMetrix || null,
      kpiData: props.newKpis || null,
      updatedFields: [],
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

  private getInputBasedOnType = (inputType: string, value: any) => {
    let processedValue: any;

    console.log("Input type:", inputType);

    switch (inputType) {
      case "P":
        if (!isNaN(value)) {
          // Append % only for display purposes
          processedValue = `${value}%`;
        } else {
          console.error("Invalid input. Percent must be a valid number.");
        }
        break;

      case "N":
        processedValue = this.formatNumber(value);
        break;

      case "C":
        processedValue = this.formatCurrency(value);
        break;

      case "B":
        if (typeof value === "string") {
          // Coerce the value to uppercase and process it
          const stringValue = value.toUpperCase();
          processedValue =
            stringValue === "Y" ? "Y" : stringValue === "N" ? "N" : null;
        } else if (value === "true" || value === "false") {
          // If it's already a boolean, leave it as is
          processedValue = value;
        } else {
          console.error(
            "Invalid boolean input. Expected 'Y' or 'N', got:",
            value
          );
          processedValue = null;
        }
        break;

      default:
        processedValue = value ?? " "; // Return raw value for unknown types
        console.error("Unknown input type:", inputType);
    }

    console.log("Processed Value:", processedValue);
    return processedValue ?? "";
  };

  private formatNumber = (value: any) => {
    value = value.trim().toUpperCase();

    // Do not convert if value is in shorthand notation (e.g., "3M", "4B")
    if (value.endsWith("M") || value.endsWith("B")) {
      return value; // Return as is (e.g., "3M", "4B")
    } else if (!isNaN(value)) {
      // Format regular number with commas
      return Number(value).toLocaleString();
    }
    return null; // Invalid input
  };

  private formatCurrency = (value: any) => {
    value = value.trim().toUpperCase();

    // If value already contains '$', return it unchanged
    if (value.startsWith("$")) {
      return value;
    }

    // If shorthand notation (M, B), return value as is but prepend with '$'
    if (value.endsWith("M") || value.endsWith("B")) {
      return "$" + value; // Keep the "M" or "B"
    } else if (!isNaN(value)) {
      // Format regular number as currency with commas
      return (
        "$" +
        Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }

    return null; // Invalid input
  };

  // private editListItem = async (e: any) => {
  //   e.preventDefault();
  //   const { updatedFields } = this.state;
  //   // Prepare the updated data by using the Id from updatedFields
  //   const updatedData: any = Object.keys(updatedFields).map((index) => {
  //     const { Id, ...updatedItem } = updatedFields[index]; // Extract Id from updatedFields
  //     return {
  //       Id,
  //       ...updatedItem,
  //     };
  //   });
  //   const list = this.state._sp.web.lists.getByTitle("Goal Metrix");

  //   try {
  //     // Iterate over updated data to update each item individually
  //     for (let i = 0; i < updatedData.length; i++) {
  //       const data = updatedData[i];
  //       const { Id, ...fieldsToUpdate } = data;
  //       await list.items.getById(Id).update(fieldsToUpdate);
  //     }
  //     window.alert(`List item edited successfully`);
  //   } catch (e) {
  //     console.error("Error updating list item", e);
  //   } finally {
  //     window.location.reload();
  //   }
  // };

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

  private editListItem = (e: any) => {
    e.preventDefault();
    const url = "https://systemgoalapi.bilh.org/api/summary"; // Replace with your API URL

    const updatedArrayParam = [...this.state.updatedFields];
    // Send the PUT request with the array of objects
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedArrayParam),
    })
      .then((response) => {
        console.log("REsponse --->", response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        alert("Data Updated Successfully");
        window.location.reload();
        return response.json(); // Parse the response JSON
      })
      .then((data) => {
        window.location.reload();
        console.log(data);
      }) // Handle the response data
      .catch((error) => console.error("Error:", error));
  };

  private handleInputChange = (
    item: any,
    KPIId: number,
    index: number,
    field: string,
    value: any,
    valueType: string
  ): void => {
    console.log(index);

    // Handle different value types and remove formatting
    let formatedValue = value;
    switch (valueType) {
      case "P": // Percentage
        formatedValue = value.replace("%", ""); // Remove the % sign for internal storage
        break;
      case "C": // Currency
        formatedValue = value.replace(/[^0-9.-]+/g, ""); // Remove any non-numeric symbols (e.g., $)
        break;
      case "N": // Number
        formatedValue = value; // No need to format numbers, just use the value directly
        break;
      case "B": // Boolean (Y/N)
        // Coerce value to a string, then uppercase it
        const stringValue = String(value).toUpperCase();
        formatedValue =
          stringValue === "Y" ? "Y" : stringValue === "N" ? "N" : null;
        if (formatedValue === null) {
          console.error(
            "Invalid boolean input. Expected 'Y' or 'N', got:",
            value
          );
        }
        break;

      default:
        console.error("Unknown value type:", valueType);
        formatedValue = value; // Keep the original value if the type is unknown
    }

    // Copy the current state to avoid direct mutation
    const updatedArray = [...this.state.updatedFields];

    // Find the index of the existing item by KPIId
    const existingIndex = updatedArray.findIndex(
      (existingItem) => existingItem.KPIId === KPIId
    );

    // If item doesn't exist in the array, add it
    if (existingIndex === -1) {
      updatedArray.push({ ...item, KPIId, [field]: formatedValue });
    } else {
      // If item exists, update the field with the formatted value
      updatedArray[existingIndex] = {
        ...updatedArray[existingIndex],
        [field]: formatedValue,
      };
    }

    // Set the updated state
    this.setState({
      updatedFields: updatedArray,
    });
  };

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
    const subGoalData = subGoal.find(
      (subGoal: any) => subGoal.Id === subGoalId
    );
    return subGoalData ? subGoalData.Title : "Unknown KPI";
  };

  private getFilteredMetrixData() {
    if (
      this.state.systemGoalDropdown.id === null &&
      // this.state.subGoalDropdown.goalId === null &&
      this.state.hospitalDropdwon.hospitalId === null
    ) {
      console.log(" new filter if  cccccc");
      return [];
    }

    const metrixData = this.state?.goalMetrix?.filter(
      (item: any) =>
        // this.state.subGoalDropdown.goalId === item.SubGoalId &&
        this.state.hospitalDropdwon.hospitalId === item.HospitalId &&
        this.state.systemGoalDropdown.id === item.GoalId
    );
    console.log(" new filter cccccc", metrixData);
    return metrixData || [];
  }

  public render(): React.ReactElement<ISystemGoalFormProps> {
    const { hospital, goalMetrix, updatedFields } = this.state;

    console.log("get new gola metrix", goalMetrix);
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

    const subGoalGroup = this.getFilteredMetrixData().reduce(
      (result: any, item: any) => {
        // If subgoaliD is already a key, push the item to that array
        if (!result[item.SubGoalId]) {
          result[item.SubGoalId] = [];
        }
        result[item.SubGoalId].push(item);
        return result;
      },
      {}
    );

    console.log("Updated Fields Array --->", updatedFields);

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
                <th
                  style={{
                    minWidth: "300px",
                    maxWidth: "300px",
                    textAlign: "left",
                  }}
                >
                  Goal’s
                </th>
                <th style={{ width: "50px", textAlign: "center" }}>Q/M</th>
                <th
                  style={{
                    minWidth: "201px",
                    maxWidth: "201px",
                    textAlign: "center",
                  }}
                >
                  MTD/QTD
                </th>
                <th
                  style={{
                    minWidth: "201px",
                    maxWidth: "201px",
                    textAlign: "center",
                  }}
                >
                  YTD
                </th>
                <th
                  style={{
                    minWidth: "120px",
                    maxWidth: "120px",
                    textAlign: "left",
                  }}
                >
                  Url
                </th>
                <th style={{ width: "100%", textAlign: "left" }}>Comments</th>
              </thead>
              <tbody>
                {Object.keys(subGoalGroup).map((subgoalId) => (
                  <React.Fragment key={subgoalId}>
                    <tr className="table_row_repeat">
                      <th style={{ width: "380px", textAlign: "left" }}>
                        {this.getSubGoalTitle(Number(subgoalId))}
                      </th>
                      <th style={{ width: "50px", textAlign: "center" }}></th>
                      <th style={{ padding: "0" }}>
                        {/* <div className="table_in_div">
                        <div>Actual</div>
                        <div>Budget or Target</div>
                        <div>Prior Yr</div>
                        </div> */}
                        <table
                          width="100%"
                          cellSpacing="0"
                          cellPadding="0"
                          className="inner_repeat_table"
                          style={{ width: "100%", height: "100%" }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  border: "0",
                                }}
                              >
                                Actual
                              </th>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  borderTop: "0",
                                  borderBottom: "0",
                                }}
                              >
                                Budget or Target
                              </th>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  border: "0",
                                }}
                              >
                                Prior Yr
                              </th>
                            </tr>
                          </thead>
                        </table>
                      </th>
                      <th style={{ padding: "0", height: "auto" }}>
                        <table
                          width="100%"
                          cellSpacing="0"
                          cellPadding="0"
                          className="inner_repeat_table"
                          style={{ width: "100%", height: "100%" }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  border: "0",
                                }}
                              >
                                Actual
                              </th>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  borderTop: "0",
                                  borderBottom: "0",
                                }}
                              >
                                Budget or Target
                              </th>
                              <th
                                style={{
                                  minWidth: "67px",
                                  maxWidth: "67px",
                                  textAlign: "center",
                                  border: "0",
                                }}
                              >
                                Prior Yr
                              </th>
                            </tr>
                          </thead>
                        </table>
                      </th>
                      <th>{/* Url */}</th>
                      <th>{/* Comments */}</th>
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
                          <select
                            defaultValue={
                              item.ReportType !== null
                                ? item.ReportType
                                : "Select"
                            }
                            onChange={(e) =>
                              this.handleInputChange(
                                item,
                                item.KPIId,
                                index,
                                "ReportType",
                                e.target.value,
                                item.ValueType
                              )
                            }
                          >
                            <option value="Q">Q</option>
                            <option value="M">M</option>
                          </select>
                        </td>

                        {/* MTD Table */}
                        <td
                          className="mtd_color"
                          style={{ textAlign: "center", padding: "0" }}
                        >
                          <table>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    border: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={this.getInputBasedOnType(
                                      item.ValueType || "N",
                                      this.state.updatedFields.find(
                                        (field: any) =>
                                          field.KPIId === item.KPIId
                                      )?.MTD_ACTUAL ?? item.MTD_ACTUAL
                                    )}
                                    onChange={(e) => {
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "MTD_ACTUAL",
                                        e.target.value,
                                        item.ValueType
                                      );
                                    }}
                                  />
                                </td>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    borderTop: "0",
                                    borderBottom: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={
                                      this.getInputBasedOnType(
                                        item.ValueType || "N",
                                        this.state.updatedFields.find(
                                          (field: any) =>
                                            field.KPIId === item.KPIId
                                        )?.MTD_BUDGET ?? item.MTD_BUDGET
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "MTD_BUDGET",
                                        e.target.value,
                                        item.ValueType
                                      )
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    border: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={
                                      this.getInputBasedOnType(
                                        item.ValueType || "N",
                                        this.state.updatedFields.find(
                                          (field: any) =>
                                            field.KPIId === item.KPIId
                                        )?.MTD_PRIOR_YEAR ?? item.MTD_PRIOR_YEAR
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "MTD_PRIOR_YEAR",
                                        e.target.value,
                                        item.ValueType
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>

                        {/* YTD Table */}
                        <td
                          className="ytd_color"
                          style={{ textAlign: "center", padding: "0" }}
                        >
                          <table>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    border: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={
                                      this.getInputBasedOnType(
                                        item.ValueType || "N",
                                        this.state.updatedFields.find(
                                          (field: any) =>
                                            field.KPIId === item.KPIId
                                        )?.YTD_ACTUAL ?? item.YTD_ACTUAL
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "YTD_ACTUAL",
                                        e.target.value,
                                        item.ValueType
                                      )
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    borderTop: "0",
                                    borderBottom: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={
                                      this.getInputBasedOnType(
                                        item.ValueType || "N",
                                        this.state.updatedFields.find(
                                          (field: any) =>
                                            field.KPIId === item.KPIId
                                        )?.YTD_BUDGET ?? item.YTD_BUDGET
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "YTD_BUDGET",
                                        e.target.value,
                                        item.ValueType
                                      )
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    width: "67px",
                                    textAlign: "center",
                                    border: "0",
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={
                                      this.getInputBasedOnType(
                                        item.ValueType || "N",
                                        this.state.updatedFields.find(
                                          (field: any) =>
                                            field.KPIId === item.KPIId
                                        )?.YTD_PRIOR_YEAR ?? item.YTD_PRIOR_YEAR
                                      ) ?? ""
                                    }
                                    onChange={(e) =>
                                      this.handleInputChange(
                                        item,
                                        item.KPIId,
                                        index,
                                        "YTD_PRIOR_YEAR",
                                        e.target.value,
                                        item.ValueType
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
                          <input
                            type="text"
                            defaultValue={item.URL}
                            onChange={(e) =>
                              this.handleInputChange(
                                item,
                                item.KPIId,
                                index,
                                "URL",
                                e.target.value,
                                item.ValueType || "N"
                              )
                            }
                          />
                        </td>
                        <td>
                          <textarea
                            defaultValue={item.Comment}
                            onChange={(e) =>
                              this.handleInputChange(
                                item,
                                item.KPIId,
                                index,
                                "Comment",
                                e.target.value,
                                item.ValueType || "N"
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
