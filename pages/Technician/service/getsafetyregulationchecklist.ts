import axios from 'axios';
import { API_TECHNICIAN } from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';

interface SafetyRegulationChecklistParams {
    JOID: number;
    WorkNatureID: number;
    SEID: number;
}

export interface SafetyRegulationImage {
    ID: number;
    Images: string;
}

export interface InspectionPoint {
    GroupID: number;
    ID: number;
    InspectionPoints: string;
    Remarks: string;
    Status: number;
}

export interface InspectionPointGroup {
    GroupID: number;
    Group: string;
    InspectionPoint: InspectionPoint[];
}

export interface SafetyRegulationChecklistResponse {
    ID: number;
    JOID: number;
    JONO: string;
    Comments: string;
    SEID: number;
    Images: SafetyRegulationImage[];
    InspectionPointGroups: InspectionPointGroup[];
    QRCodeScanned: boolean;
}

export const getSafetyRegulationChecklist = async (params: SafetyRegulationChecklistParams): Promise<SafetyRegulationChecklistResponse> => {
    try {
        const response = await requestWithEndUrl(`${API_TECHNICIAN}getsafetyregulationchecklist`, {
            params
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
