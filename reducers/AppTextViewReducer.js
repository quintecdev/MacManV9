import AsyncStorage from "@react-native-async-storage/async-storage"
import actionsConstants from "../constants/actionsConstants"

const initialState={
    selectedLng:{
        Language:"English",
        Languagevalue:"en"
    },
    selectedLngValue:"en",
    AppTextData:{
        txtLogin:'LOGIN',
        txtUser_Log_In:'User Log in',
        txtUser_ID:'User ID',
        txtpassword:'password',
        txtForgot_Password:'Forgot Password?',
        txt_Job_Oders:'Job Orders',
        txt_Job_Oder:'Job Order',
        txt_From:'From',
        txt_Overdue_Backlogs: 'Overdue Backlogs',
        txt_Assigned:'Assigned',
        txt_Not_Assigned:'Not Assigned',
        txt_Backlogs:'Backlogs',
        txt_Overdue:'Overdue',
        txt_Man_Hour:'Man Hour',
        txt_Estimated:'Estimated',
        txt_Available:'Available',
        txt_Schedule_Date:'Schedule Date',
        txt_OverDue_By: 'OverDue By',
        txt_min:'min',
        txt_Activities:'Activities',
        txt_Spare_Parts:'Spare Parts',
        txt_ASSIGN:'ASSIGN',
        txt_DELETE:'DELETE',
        txt_Technicians:'Technicians',
        txt_Change_Technician:'Change Technician',
        txt_To:'To',
        txt_UPDATE:'UPDATE',
        txt_Activity_Details:'Activity Details',
        txt_Job_Order_Report:'Job Order Report',
        txt_Spare_Parts_Required:'Spare Parts Required',
        txt_Job_Order_Assignment:'Job Order Assignment',
        txt_Additional_Spare_Parts:'Additional Spare Parts',
        txt_Additional_Spare_Parts_Issued:'Additional Spare Parts Issued',
        txt_Additional_Activity_Details:'Additional Activity Details',
        txt_ADD:'ADD',
        txt_Code:'Code',
        txt_Spare_Parts_Category:'Spare Parts Category',
        txt_Date:'Date',
        txt_Days:'Days',
        txt_LIST:'LIST',
        txt_RECEIVED:'RECEIVED',
        txt_Remark:'Remark',
        txt_OK:'OK',
        txt_Next_Day:'Next Day',
        txt_Break:'Break',
        txt_Save:'Save',
        txt_Additional_Activities:'Additional Activities',
        txt_RefNo:'RefNo',
        txt_JO_NO:'JoNo',
        txt_Started_at:'Started at',
        txt_Something_went_wrong:'Something went wrong',
        
        txt_somthing_wrong_contact_admin:'Something went wrong, Please contact the server administarator',
        txt_somthing_wrong_try_again:'Something went wrong, Please try again',
        txt_alr_wrk_in_job:'You are already working in job',
        txt_alr_wrk_in_another_job:'You are already working in another job',
        txt_must_start_job_to_enable_this:'You must start the job to enable this action',
        txt_Job_Report_Not_Entered:'Job Report Not Entered',
        txt_item_alrd_exist:'Item already existing',
        txt_Invalid_User_Details:'Invalid User Details',
        txt_Updated_Successfully:'Updated Successfully',
        txt_lng_error:'Somithing went wrong with this language, We set English as default language',
        txt_Change_Langauge:'Change Langauge',
        //new
        txt_Closed_All:'Closed All',
        txt_Verify:'Verify',
        txt_Review:'Review',
        txt_Custodian_Login:'Custodian Login',

        txt_Pending:'Pending',
        txt_Closed:'Closed',
        txt_WIP:'WIP',
        txt_Select_Reason:"Select Reason",
        txt_Select_Date:"select date",
        txt_Job_Order_Request:'Job Order Request',

        txt_Clear:'Clear',
        txt_Signature:'Signature',
        txt_signature_needed:'Signature Needed',
        txt_alert_msg_close_form:'Are you sure, You want to close this form',
        txt_Cancel:'Cancel',
        txt_Add_Activities:'Add Activities',
        txt_Add_Spare_Parts:'Add Spare Parts',

        //11/29/2021
        txt_Please_enter_your_notes:'Please enter your notes',
        txt_Select_to_add_Spare_Parts:'Select to add Spare Parts',
        txt_Spare_Parts_not_found:'Spare Parts not found',
        txt_job_order_report_verify_alert:"You must save this job order report before verify",
        txt_langauge:"Langauge",
        txt_invalid_time:"Invalid time",
        txt_fields_must_not_be_empty:"Fileds must not be empty",
        //07/10/2022
        txt_experiencing_technical_difficulties:"We're experiencing technical difficulties"
        
    }
}

export default (state=initialState,action)=>{
    // console.log("AppTextviewReducer: ",{state,action})
    switch(action.type){
        case actionsConstants.ACTION_SET_APP_TEXT_DATA:
            return{
                ...state,
                AppTextData:action.payload.appTextData
            }
            case actionsConstants.ACTION_SET_SELECTED_LNG:
                AsyncStorage.setItem('selectedLng',JSON.stringify(action.payload.selectedLng))
                return{
                    ...state,
                    selectedLng:action.payload.selectedLng
                }
            default: return state
    }
}