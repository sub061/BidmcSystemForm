import * as React from "react";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import type { ISystemGoalFormProps } from "./ISystemGoalFormProps";

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
    };
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
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="systemGoal">System Goal:</label>
        <select
          id="systemGoal"
          name="systemGoal"
          value={this.state.systemGoal}
          onChange={this.handleChange}
        >
          <option value="bilh">BILH</option>
        </select>
        <br />
        <br />

        <label htmlFor="hospital">Hospital:</label>
        <select
          id="hospital"
          name="hospital"
          value={this.state.hospital}
          onChange={this.handleChange}
        >
          <option value="AJH">AJH</option>
          <option value="BIDMC">BIDMC</option>
        </select>
        <br />
        <br />

        <label htmlFor="goals">Goal:</label>
        <select
          id="goals"
          name="goals"
          multiple
          value={this.state.goals}
          onChange={this.handleChange}
        >
          <option value="People">People</option>
          <option value="Quality">Quality</option>
          <option value="Experience">Experience</option>
        </select>
        <br />
        <br />

        <label htmlFor="subGoal">Sub Goal:</label>
        <select
          id="subGoal"
          name="subGoal"
          value={this.state.subGoal}
          onChange={this.handleChange}
        >
          <option value="Retention">Retention</option>
          <option value="Throughput">Throughput</option>
          <option value="Access">Access</option>
        </select>
        <br />
        <br />

        <div id="gridContainer">
          <table>
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Actual</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {this.state.grid.map((row, index) => (
                <tr key={index}>
                  <td>
                    <select
                      name="hospital"
                      value={row.hospital}
                      onChange={(e) => this.handleGridChange(index, e)}
                    >
                      <option value="AJH">AJH</option>
                      <option value="BIDMC">BIDMC</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="actual"
                      value={row.actual}
                      onChange={(e) => this.handleGridChange(index, e)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="target"
                      value={row.target}
                      onChange={(e) => this.handleGridChange(index, e)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="details"
                      value={row.details}
                      onChange={(e) => this.handleGridChange(index, e)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />

        <button type="button" onClick={this.addRow}>
          Add Row
        </button>
        <br />
        <br />

        <input type="submit" value="Submit" />
      </form>
    );
  }
}
