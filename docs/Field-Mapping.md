# Field Mapping — NOSSA (103 observed keys)

Each row is mapped explicitly. `detail.<key>` denotes allowlisted normalized metadata, not full raw duplicate; restricted values require a business purpose and permission, otherwise omit. All fields default nullable unless DDL requires identity/status. Never put PII in list DTO, logs, SSE or fixtures. Source field aliases are case-aware; conflicting aliases quarantine. `Witel`/`witel` and `Service_No`/`service_no` are documented variants. Preserve leading zeros. Numeric fields parse strict finite decimal, not JS parseFloat on malformed input.

| Source key | Target | Handling | Non-null sample rows* |
|---|---|---|---:|
| `Incident` | `incident` | typed column | 100 |
| `Customer_Name` | `detail.Customer_Name` | restricted; omit unless approved | 0 |
| `summary` | `summary` | restricted; omit unless approved | 100 |
| `Last_Work_Log_Date` | `last_work_log_at` | typed column | 79 |
| `last_updated_work_log` | `detail.last_updated_work_log` | restricted; omit unless approved | 79 |
| `Source` | `source_ticket` | typed column | 100 |
| `Segment` | `source_segment` | typed column | 100 |
| `channel` | `channel` | typed column | 99 |
| `customer_segment` | `customer_segment` | typed column | 96 |
| `service_id` | `service_id` | restricted; omit unless approved | 96 |
| `service_no` | `service_no` | restricted; omit unless approved | 96 |
| `service_type` | `service_type` | typed column | 96 |
| `Top_Priority` | `detail.Top_Priority` | allowlist only if needed | 1 |
| `Slg` | `detail.Slg` | allowlist only if needed | 3 |
| `Datek` | `detail.Datek` | restricted; omit unless approved | 2 |
| `RK` | `detail.RK` | allowlist only if needed | 77 |
| `Technology` | `technology` | typed column | 84 |
| `Induk_gamas` | `gamas_incident` | typed column | 2 |
| `Reported_Date` | `reported_at` | typed column | 100 |
| `TTR_Customer` | `ttr_customer_raw` | typed column | 76 |
| `TTR_Nasional` | `detail.TTR_Nasional` | allowlist only if needed | 76 |
| `TTR_Regional` | `detail.TTR_Regional` | allowlist only if needed | 76 |
| `TTR_Witel` | `detail.TTR_Witel` | allowlist only if needed | 0 |
| `TTR_Mitra` | `detail.TTR_Mitra` | allowlist only if needed | 76 |
| `TTR_Agent` | `detail.TTR_Agent` | allowlist only if needed | 76 |
| `Status` | `status` | typed column | 100 |
| `OSM_Resolved_Code` | `detail.OSM_Resolved_Code` | allowlist only if needed | 0 |
| `Last_Update_Ticket` | `source_updated_at` | typed column | 100 |
| `Status_Date` | `status_at` | typed column | 100 |
| `Closed/Reopen_By` | `detail.Closed/Reopen_By` | source reference only; no local assignment; restricted | 8 |
| `Resolved_By` | `detail.Resolved_By` | source reference only; no local assignment; restricted | 8 |
| `Owner` | `detail.Owner` | source reference only; no local assignment; restricted | 71 |
| `Owner_Group` | `owner_group` | typed column | 100 |
| `Workzone` | `source_workzone` | typed column | 100 |
| `witel` | `source_witel` | typed column | 99 |
| `Regional` | `source_region` | typed column | 100 |
| `Symptom` | `symptom` | typed column | 100 |
| `Solution_Segment` | `solution_segment` | typed column | 49 |
| `Actual_Solution` | `actual_solution` | typed column | 38 |
| `reportedpriority` | `detail.reportedpriority` | allowlist only if needed | 0 |
| `AssignedOwnerGroup` | `detail.AssignedOwnerGroup` | allowlist only if needed | 100 |
| `Customer_ID` | `detail.Customer_ID` | restricted; omit unless approved | 0 |
| `Classificationid` | `classification_id` | typed column | 100 |
| `Impacted_Site` | `detail.Impacted_Site` | allowlist only if needed | 1 |
| `RCA` | `detail.RCA` | allowlist only if needed | 0 |
| `ReportedBy` | `reported_by` | restricted; omit unless approved | 96 |
| `Name` | `detail.Name` | restricted; omit unless approved | 2 |
| `Ttr_Pending` | `ttr_pending_raw` | typed column | 0 |
| `INCIDENT_DOMAIN` | `detail.INCIDENT_DOMAIN` | allowlist only if needed | 15 |
| `ASSIGN_TO` | `detail.ASSIGN_TO` | source reference only; no local assignment; restricted | 62 |
| `TKNODE` | `detail.TKNODE` | allowlist only if needed | 0 |
| `HOSTNAME` | `detail.HOSTNAME` | restricted; omit unless approved | 81 |
| `CUSTOMER_TYPE` | `customer_type` | typed column | 70 |
| `EXTERNALSYSTEM_TICKETID` | `detail.EXTERNALSYSTEM_TICKETID` | restricted; omit unless approved | 90 |
| `ROOTCAUSE` | `detail.ROOTCAUSE` | allowlist only if needed | 0 |
| `RESOLUTION` | `detail.RESOLUTION` | allowlist only if needed | 0 |
| `GAUL` | `gaul_count` | typed column | 100 |
| `TICKET_DETAILS` | `detail.TICKET_DETAILS` | restricted; omit unless approved | 0 |
| `C_PARENT_ID` | `detail.C_PARENT_ID` | restricted; omit unless approved | 100 |
| `CONTACT_EMAIL` | `detail.CONTACT_EMAIL` | restricted; omit unless approved | 0 |
| `ISOBSOLETE` | `is_obsolete` | typed column | 100 |
| `C_RESOLVE_DATE` | `resolved_at` | typed column | 26 |
| `C_PENDING_STATUS` | `pending_reason` | typed column | 0 |
| `C_DESCRIPTION_ASSIGMENT` | `detail.C_DESCRIPTION_ASSIGMENT` | source reference only; no local assignment; restricted | 59 |
| `C_DESCRIPTION_SERVICEID` | `detail.C_DESCRIPTION_SERVICEID` | restricted; omit unless approved | 94 |
| `TTR_END_TO_END` | `ttr_end_to_end_raw` | typed column | 76 |
| `C_MYCX_RESULT` | `detail.C_MYCX_RESULT` | restricted; omit unless approved | 88 |
| `C_HOSTNAME_OLT` | `detail.C_HOSTNAME_OLT` | restricted; omit unless approved | 81 |
| `C_GUARANTE_STATUS` | `guarantee_status` | typed column | 78 |
| `C_SERVICE_CATEGORY` | `detail.C_SERVICE_CATEGORY` | allowlist only if needed | 0 |
| `SERVICE_IMPACT_GAMAS` | `detail.SERVICE_IMPACT_GAMAS` | allowlist only if needed | 0 |
| `C_BOOKING_DATE` | `booking_at` | typed column | 18 |
| `C_SLG_TTR` | `ttr_slg_raw` | typed column | 3 |
| `C_PRIORITY` | `detail.C_PRIORITY` | allowlist only if needed | 83 |
| `C_WORKING_HOUR` | `detail.C_WORKING_HOUR` | allowlist only if needed | 98 |
| `C_PACKAGE` | `detail.C_PACKAGE` | allowlist only if needed | 6 |
| `C_REALM` | `realm` | typed column | 55 |
| `C_IBOOSTER_ALERT_ID` | `detail.C_IBOOSTER_ALERT_ID` | allowlist only if needed | 7 |
| `TOTAL_SERVICE_INDIBIZ` | `detail.TOTAL_SERVICE_INDIBIZ` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_INDIHOME` | `detail.TOTAL_SERVICE_INDIHOME` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_NODEB` | `detail.TOTAL_SERVICE_NODEB` | allowlist only if needed | 100 |
| `TOTAL_ALL_SERVICE` | `detail.TOTAL_ALL_SERVICE` | allowlist only if needed | 100 |
| `TOTAL_LIS_INDIHOME` | `detail.TOTAL_LIS_INDIHOME` | allowlist only if needed | 100 |
| `TOTAL_LIS_INDIBIZ` | `detail.TOTAL_LIS_INDIBIZ` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_DATIN` | `detail.TOTAL_SERVICE_DATIN` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_VULA` | `detail.TOTAL_SERVICE_VULA` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_SDWAN` | `detail.TOTAL_SERVICE_SDWAN` | allowlist only if needed | 100 |
| `TOTAL_SERVICE_WIFI` | `detail.TOTAL_SERVICE_WIFI` | allowlist only if needed | 100 |
| `C_SOLUTION_DESCRIPTION` | `detail.C_SOLUTION_DESCRIPTION` | allowlist only if needed | 12 |
| `C_AREA_TIF` | `detail.C_AREA_TIF` | allowlist only if needed | 99 |
| `C_DISTRICT_TIF` | `source_district` | typed column | 99 |
| `C_REGIONAL_TIF` | `source_tif_region` | typed column | 99 |
| `C_TSC_RESULT` | `detail.C_TSC_RESULT` | allowlist only if needed | 10 |
| `C_SCC_RESULT` | `detail.C_SCC_RESULT` | allowlist only if needed | 16 |
| `C_TSC_RESULT_CATEGORY` | `detail.C_TSC_RESULT_CATEGORY` | allowlist only if needed | 6 |
| `C_SLG_NCX` | `detail.C_SLG_NCX` | allowlist only if needed | 3 |
| `inserted_date` | `source_inserted_at` | typed column | 100 |
| `C_CTS_CAUSE` | `detail.C_CTS_CAUSE` | allowlist only if needed | 0 |
| `C_CTS_RESOLUTION` | `detail.C_CTS_RESOLUTION` | allowlist only if needed | 0 |
| `JML_TIKET_ANAK_GAMAS` | `detail.JML_TIKET_ANAK_GAMAS` | allowlist only if needed | 100 |
| `C_SOLUTION_CODE` | `solution_code` | typed column | 12 |
| `TOTAL_INTERNET_INDIHOME` | `detail.TOTAL_INTERNET_INDIHOME` | allowlist only if needed | 0 |
| `C_DC_TYPE` | `detail.C_DC_TYPE` | allowlist only if needed | 83 |

*Non-null counts are raw JSON non-null, including literal null strings; not population quality rates.

## Derived/local fields
`id` UUIDv7 local; `workzone_id` approved dimension mapping via region/witel/workzone (TIF district separate); `lifecycle` rule-derived, not endpoint-derived; `closed_at` NULL until closure timestamp rule verified; `operational_bucket`, `kpi_seg`, `jenis_tiket_1/2`, `classification_flag/path`, `flagging_manja/datin`, `sqm_update_reason`, `needs_validation`, `validation_reason`, `sla_seconds`, `ttr_deadline_at`, `ttr_comply_status` derived only from approved ported rules. If unavailable -> unknown/NULL or validation flag, not fabricated. `source_endpoint` records winning stream; hash covers normalized persisted source facts (including authorized detail) and compare rule version separately. `version`, `created_at`, `updated_at` local only.

## Normalization requirements
- Exact incident trim uppercase, regex; never substitute parent or source UUID.
- Strict date parse: offset-aware ISO; offsetless booking requires approved timezone; invalid date -> null + quality flag or quarantine required fields.
- Missing != explicit null; null clear only documented authoritative field. Placeholder strings handled per field; do not erase meaningful composite symptom text like `null | TECHNICAL | ...`.
- Zero numeric is not missing; boolean flags accept approved 0/1 encodings only. GAUL semantics verify before KPI.
- Preserve raw TTR units; do not convert or equate resolution vs closure before sign-off.
- Customer text, names, contact information, internal hosts can be sensitive even embedded in summary/logs. Redact API based on permissions, avoid storing unnecessary fields; use synthetic fixtures.
