Clinic Database Platform Documentation

1. Project Overview

This platform is a clinical data management system designed for evaluating older patients. It utilizes n8n for backend logic/workflows and Supabase (PostgreSQL) for data persistence. The system is designed around a modular "Form" architecture where data is captured per patient visit.

2. Technical Stack

Frontend: Modular JavaScript (Form designs and Modules stored as .js files and imported dynamically).

Backend/Logic: n8n.

Database: Supabase.

Data Exchange: JSON.

3. Data Hierarchy & Identification

3.1 Patient SN (Serial Number)

Each patient is assigned a specific SN identifying their group.

Format: GR000000

GR: Group designation (e.g., ST, GR, AX).

000000: Unique numerical identifier.

3.2 Visit Number (VN)

The VN serves as the primary key to connect records across different forms for a single clinical encounter.

Rule: Maximum of 1 visit per patient per day.

Format: VYYMMDDHHMMSN

Example: V2603271115ST012556

260327: Date (March 27, 2026).

1115: Time (11:15).

ST012556: Patient SN.

4. Organizational Logic

Form: A set of questions/input fields corresponding to a specific assessment.

Module: A collection of forms grouped by clinical purpose.

Mapping: User <--> Module <--> Forms.

5. Privilege & Security (RBAC)

5.1 Form-Level Privileges

Users are assigned specific access levels per form:

VIEW: Read-only access to records.

CREATE: Can submit new records; cannot modify them after submission.

EDIT: Can modify historical data (includes audit logging).

5.2 Group-Level Restrictions

Standard Staff: Can only access/perform actions on patients belonging to their own group (e.g., Group A staff -> Group A patients).

Divine Users: Special privilege class allowed to view and edit across all patient groups.

6. Data Structure & Submission

6.1 JSON Format

The frontend submits data to n8n in a structured JSON format:

{
  "metadata": {
    "staffid": "string",
    "SN": "string",
    "VN": "string",
    "timestamp": "ISO8601",
    "moduleid": "string"
  },
  "submission": {
    "FormA": {
      "column_name_1": "value",
      "column_name_2": "value"
    },
    "FormB": {
      "column_name_x": "value"
    }
  }
}


6.2 Frontend Architecture

Form Design: Imported from separate .js files.

Naming Convention: Input elements use FORMNAME.VARNAME format.

Module Design: Container .js files that build the DIV structure and import necessary forms.

7. Operational Workflows

7.1 REVIEW Tab

Search: Staff enters Patient SN.

Select: A list of VNs is displayed with timestamps and associated forms.

Render: Data is displayed in "View Only" mode based on form-level privileges.

Modify: If the user has EDIT privilege, they can toggle "EDIT" mode.

Edits do not change the original timestamp or original creator.

All changes are tracked in an audit/trace log.

7.2 ASSESS Tab

Module Selection: Staff chooses a Module from their permitted list.

Identification: Staff inputs Patient SN.

New SN: Redirects to patient registration.

Existing SN: Prompt to populate the form with the most recent historical data.

Data Entry: - Each form section includes a "Draw Data" button to pull specific past data into the current form.

Forms remain open for submission/updates within the same day.

Submission: Data is pushed to Supabase via n8n.