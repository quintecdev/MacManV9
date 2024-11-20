import AsyncStorage from '@react-native-async-storage/async-storage';
import actionsConstants from '../constants/actionsConstants';

const initialState = {
  selectedLng: {
    Language: '',
    Languagevalue: '',
  },
  selectedLngValue: 'ol',
  AppTextData: {
    txtLogin: 'LOGIN',
    txtUser_Log_In: 'User Log in',
    txtUser_ID: 'User ID',
    txtpassword: 'password',
    txtForgot_Password: 'Forgot Password?',
    txt_Job_Oders: 'Job Orders',
    txt_Job_Oder: 'Job Order',
    txt_From: 'From',
    txt_Overdue_Backlogs: 'Overdue Backlogs',
    txt_Assigned: 'Assigned',
    txt_Not_Assigned: 'Not Assigned',
    txt_Backlogs: 'Backlogs',
    txt_Overdue: 'Overdue',
    txt_Man_Hour: 'Man Hour',
    txt_Estimated: 'Estimated',
    txt_Available: 'Available',
    txt_Schedule_Date: 'Schedule Date',
    txt_OverDue_By: 'OverDue By',
    txt_min: 'min',
    txt_Activities: 'Activities',
    txt_Spare_Parts: 'Spare Parts',
    txt_ASSIGN: 'ASSIGN',
    txt_DELETE: 'DELETE',
    txt_Technicians: 'Technicians',
    txt_Change_Technician: 'Change Technician',
    txt_To: 'To',
    txt_UPDATE: 'UPDATE',
    txt_Activity_Details: 'Activity Details',
    txt_Job_Order_Report: 'Job Order Report',
    txt_Spare_Parts_Required: 'Spare Parts Required',
    txt_Job_Order_Assignment: 'Job Order Assignment',
    txt_Additional_Spare_Parts: 'Additional Spare Parts',
    txt_Additional_Spare_Parts_Issued: 'Additional Spare Parts Issued',
    txt_Additional_Activity_Details: 'Additional Activity Details',
    txt_ADD: 'ADD',
    txt_Code: 'Code',
    txt_Spare_Parts_Category: 'Spare Parts Category',
    txt_Date: 'Date',
    txt_Days: 'Days',
    txt_LIST: 'LIST',
    txt_RECEIVED: 'RECEIVED',
    txt_Remark: 'Remark',
    txt_OK: 'OK',
    txt_Next_Day: 'Next Day',
    txt_Break: 'Break',
    txt_Save: 'Save',
    txt_Additional_Activities: 'Additional Activities',
    txt_RefNo: 'RefNo',
    txt_JO_NO: 'JoNo',
    txt_Started_at: 'Started at',
    txt_Something_went_wrong: 'Something went wrong',

    txt_somthing_wrong_contact_admin:
      'Something went wrong, Please contact the server administarator',
    txt_somthing_wrong_try_again: 'Something went wrong, Please try again',
    txt_alr_wrk_in_job: 'You are already working in job',
    txt_alr_wrk_in_another_job: 'You are already working in another job',
    txt_must_start_job_to_enable_this:
      'You must start the job to enable this action',
    txt_Job_Report_Not_Entered: 'Job Report Not Entered',
    txt_item_alrd_exist: 'Item already existing',
    txt_Invalid_User_Details: 'Invalid User Details',
    txt_Updated_Successfully: 'Updated Successfully',
    txt_lng_error:
      'Somithing went wrong with this language, We set English as default language',
    txt_Change_Langauge: 'Change Langauge',
    //new
    txt_Closed_All: 'Closed All',
    txt_Verify: 'Verify',
    txt_Review: 'Review',
    txt_Custodian_Login: 'Custodian Login',

    txt_Pending: 'Pending',
    txt_Closed: 'Closed',
    txt_WIP: 'WIP',
    txt_Select_Reason: 'Select Reason',
    txt_Select_Date: 'select date',
    txt_Job_Order_Request: 'Job Order Request',

    txt_Clear: 'Clear',
    txt_Signature: 'Signature',
    txt_signature_needed: 'Signature Needed',
    txt_alert_msg_close_form: 'Are you sure, You want to close this form',
    txt_Cancel: 'Cancel',
    txt_Add_Activities: 'Add Activities',
    txt_Add_Spare_Parts: 'Add Spare Parts',

    //11/29/2021
    txt_Please_enter_your_notes: 'Please enter your notes',
    txt_Select_to_add_Spare_Parts: 'Select to add Spare Parts',
    txt_Spare_Parts_not_found: 'Spare Parts not found',
    txt_job_order_report_verify_alert:
      'You must save this job order report before verify',
    txt_langauge: 'Langauge',
    txt_invalid_time: 'Invalid time',
    txt_fields_must_not_be_empty: 'Fileds must not be empty',
    //07/10/2022
    txt_experiencing_technical_difficulties:
      "We're experiencing technical difficulties",
    //30/12/2022
    txt_Select_Action: 'Select Action',
    txt_Start: 'Start',
    txt_QrCode: 'Qr Code',
    txt_Select_Item: 'Select item',
    txt_Abnormality_Notes: 'Abnormality Notes',
    txt_Complete: 'Complete',
    txt_Yes: 'Yes',
    txt_No: 'No',
    txt_Abnormality: 'Abnormality',
    txt_Please_give_Abnormality_Notes: 'Please give Abnormality Notes',
    txt_Req: 'Req',
    txt_Used: 'Used',
    txt_Spare_Parts_Stock: 'Spare Parts Stock',
    txt_Spare_parts_Search_Result: 'Spare parts Search Result',
    txt_Please_choose_prefered_Spare_part: 'Please choose prefered Spare part',
    txt_You_must_enter_atleast_one_activity_to_add_spareparts:
      'You must enter atleast one activity to add spareparts',
    txt_Checklist_saved_successfully: 'Checklist saved successfully',
    txt_Upload_Error: 'Upload Error',
    txt_Attachments_could_not_be_uploaded:
      'Attachments could not be uploaded for some reason, Plase click ok to try again',
    txt_Sorry: 'Sorry',
    txt_You_are_unable_to_close_the_job:
      'You are unable to close the job. Please use the provided spare parts',
    txt_Saved_successfully: 'Saved Successfully',
    txt_Are_you_sure_You_want_to_logout: 'Are you sure, You want to logout',
    txt_Logout: 'Logout',
    txt_Invalid_QR_code: 'Invalid QR code',
    txt_Are_You_sure_You_want_to_stop: 'Stop, Are You sure, You want to stop',
    txt_technical_difficulties_contact_the_server_administarator:
      "We're experiencing technical difficulties, Please contact the server administarator",
    txt_Camera_permission_denied: 'Camera permission denied',
    txt_Invalid_Asset_Information: 'Invalid Asset Information',
    txt_cancel: 'Cancel',
    txt_already_added: 'already added',
    txt_Type_valid_Search_Data: 'Type valid Search Data',
    txt_Invalid_Data: 'Invalid Data',
    txt_Hai: 'Hai',
    txt_Search_Spare_Parts: 'Search Spare Parts',
    txt_Object: 'Object',
    txt_Damage: 'Damage',
    txt_Cause: 'Cause',
    txt_Select_to_add_activity: 'Select to add activity',
    txt_Activity_not_found: 'Activity not found',
    txt_Logout_Successfully: 'Logout Successfully',
    txt_Expected_Assign_Dates: 'Expected Assign Dates',
    txt_RQty: 'RQty',
    txt_AQty: 'AQty',
    txt_ES: 'ES',
    txt_txt_Filter: 'Filter',
    txt_Asset: 'Asset',
    txt_JoNo: 'JoNo',
    txt_MHistory: 'MHistory',
    txt_Checklist: 'Checklist',
    txt_Remarks: 'Remarks',
    txt_Scheduled: 'Scheduled',
    txt_Unscheduled: 'Unscheduled',
    txt_Search: 'Search',
    txt_Chat: 'Chat',
    txt_Message: 'Message',
    txt_JOR_No: 'JOR No',
    txt_Requested_By: 'Requested By',
    txt_Problem_Type: 'Problem Type',
    txt_Description: 'Description',
    txt_Tools: 'Tools',
    //19/01/2022
    txt_Technician: 'Technician',
    txt_JO_Number: 'JO No.',
    txt_Job_Type: 'Job Type',
    txt_JOR_Number: 'JOR No.',
    txt_Abnormality_Note: 'Abnormality Note',
    txt_Update_Available: 'Update Available',
    txt_New_Version_is_available_upgrade_to_the_latest_version:
      'A new Mac-Man Version is available, and you must upgrade to the latest version.',
    txt_Plese_complete_CheckList: 'Plese complete CheckList',
    txt_Alert: 'Alert',
    txt_Invalid_Username_and_Password: 'Invalid Username and Password',
    txt_No_data_found: 'No data found',
    txt_Please_re_enter_the_assigning_time:
      'Please re-enter the assigning time',
    txt_No_new_notifications: 'No new notifications',
    txt_Are_you_sure_You_want_to_assign_this_job_to:
      'Are you sure, You want to assign this job to',
    txt_Checklist_Notification: 'Checklist Notification',
    txt_Success: 'Success',
    //feb 1 2023
    txt_No_of_Technicians: 'No. of Technicians',
    txt_Select_Technicians: 'Select Technicians',
    txt_Please_Select_Alteast_one_Technician:
      'Please Select Alteast one Technician',
    txt_Assigned_Technicians: 'Assigned Technicians',
    //feb 3 2023
    txt_Job_Order_Performance: 'Job Order Performance',
    //feb 7 2023
    txt_Plese_Enter_previous_service_report:
      'Plese Enter  previous service report',
    txt_No_Internet_Please_Check_your_internet_connection:
      'No Internet, Please Check Your Internet Connection',
    //feb 13 2023
    txt_Sorry_You_have_no_Premission: 'Sorry, You have no Premission',
    txt_Please_Select_desired_SpareParts_from_the_Selected_List:
      'Please Select desired SpareParts from the Selected List',
    txt_WareHouse_Selected_Successfully: 'WareHouse Selected Successfully',
    txt_No_Stock_Available: 'No Stock Available',
    txt_Please_Update_WareHouse_Name: 'Please Update WareHouse Name',
    txt_Please_Update_Used_SpareParts_Count:
      'Please Update Used SpareParts Count',
    txt_Spare_Parts_Added_Successfully: 'Spare Parts Added Successfully',
    txt_Technician_is_already_working_in_same_machine:
      'Technician is already working in same machine',
    txt_Machine_is_already_assigned: 'Machine is already assigned',
    //feb 23 2023
    txt_BreakDown_List: 'BreakDown List',
    txt_Problem_Description: 'Problem Description',
    txt_No_Notification: 'No Notification',
    txt_Sorry_Please_close_previous_BreakDown_Job:
      'Sorry, Please close previous BreakDown Job',
    txt_Please_Select_One_Reason: 'Please Select One Reason',
    txt_Do_you_want_to_start_this_Job: 'Do you want to start this Job',
    //feb 27 2023
    txt_Assign: 'Assign',
    txt_Are_you_sure_You_want_to_assign_this_job_to:
      'Are you sure, You want to assign this job to',
    txt_Assigned: 'Assigned',
    //feb 28 2023
    txt_Department_updated_successfully: 'Department updated successfully',
    txt_No_WorkCenter_Details_Available: 'No WorkCenter Details Available',
    //feb 29 2023
    txt_Are_you_sure_want_to_Update_the_Department:
      'Are you sure want to Update the Department',
    txt_Update: 'Update',
    txt_Select_One_Department: 'Select One Department',
    //march 2 2023
    txt_One_activity_must_be_in_WIP_or_Pending_to_save_the_job_Order_report:
      'One activity must be in WIP or Pending to save the job Order report',
    //march 15 2023
    txt_please_set_SpareParts_Count: 'please set SpareParts Count',
    txt_Please_set_Used_SpareParts_Count: 'Please set Used SpareParts Count',
    txt_Please_Select_WH_Name_of_the_Added_Spareparts:
      'Please Select WH Name of the Added Spareparts',
    txt_please_insert_valid_Quantity: 'please insert valid Quantity',
    txt_CycleCount_updated_sucessfully: 'CycleCount updated sucessfully',
    txt_Updation_Failed: 'Updation Failed',
    txt_No_Cycle_count_details_are_available:
      'No Cycle count details are available',
    txt_Part_No: 'Part No.',
    txt_SpareParts: 'SpareParts',
    txt_Qty: 'Qty',
    txt_Number: 'No.',
    //march 21 2023
    txt_Cycle_Count: 'Cycle Count',
    txt_JobOrder_is_verified: 'JobOrder is verified',
    txt_Production_supervisor_is_already_verified:
      'Production supervisor is already verified',
    txt_Verify: 'Verify',
    txt_Verified: 'Verified',
    //25 April 2023
    txt_Please_select_the_object_damage_and_cause:
      'Please select the object,damage and cause',
      //12 May 2023
    txt_Verification_ingored:'Verification ingored',
    txt_Production_supervisor_is_already_rejected:'Production supervisor is already rejected',
    txt_Value:'Value',
    txt_Please_enter_valid_input:'Please enter valid input',
    //22 may 2023
    txt_saving:'Saving',
    //27 june 2023
    txt_Sorry_this_Job_has_reassinged_to_another_employee:'Sorry, this Job has Re assigned to another employee',

  },
};

export default (state = initialState, action) => {
  // console.log("AppTextviewReducer: ",{state,action})
  switch (action.type) {
    case actionsConstants.ACTION_SET_APP_TEXT_DATA:
      return {
        ...state,
        AppTextData: action.payload.appTextData,
      };
    case actionsConstants.ACTION_SET_SELECTED_LNG:
      AsyncStorage.setItem(
        'selectedLng',
        JSON.stringify(action.payload.selectedLng),
      );
      return {
        ...state,
        selectedLng: action.payload.selectedLng,
      };
    default:
      return state;
  }
};
